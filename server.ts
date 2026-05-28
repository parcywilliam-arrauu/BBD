import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header if available
const isApiKeyPresent = !!process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (isApiKeyPresent) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini SDK initialized successfully with API Key");
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
  }
} else {
  console.log("GEMINI_API_KEY not found. Running with high-fidelity local simulation.");
}

// -------------------------------------------------------------
// Gemini Response Caching Layer to stay within 5 RPM free quota
// -------------------------------------------------------------
const geminiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // Cache valid for 15 minutes

function getCachedData(endpoint: string, payload: any): any | null {
  const cacheKey = `${endpoint}:${JSON.stringify(payload)}`;
  const cached = geminiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

function setCachedData(endpoint: string, payload: any, data: any): void {
  const cacheKey = `${endpoint}:${JSON.stringify(payload)}`;
  geminiCache.set(cacheKey, { data, timestamp: Date.now() });
}

// -------------------------------------------------------------
// AI-1: Smart Customer Health Summary
// -------------------------------------------------------------
app.post("/api/ai/health-summary", async (req, res) => {
  const {
    name,
    weight,
    height,
    bmi,
    medical_condition,
    medicine_taking,
    goal,
    activity_level,
    foot_condition,
  } = req.body;

  const payload = {
    name,
    weight,
    height,
    bmi,
    medical_condition,
    medicine_taking,
    goal,
    activity_level,
    foot_condition,
  };

  const cached = getCachedData("health-summary", payload);
  if (cached) {
    return res.json(cached);
  }

  if (ai) {
    try {
      const prompt = `Given this customer data of ${name || "a user"}:
 - Physical: weight ${weight || "unknown"}kg, height ${height || "unknown"}cm, BMI ${bmi || "unknown"}
 - Health conditions: ${medical_condition || "none"}
 - Medicines: ${medicine_taking || "none"}
 - Goal: ${goal || "general weight management"}
 - Lifestyle: activity level ${activity_level || "sedentary"}, foot condition ${foot_condition || "normal"}
 
 Generate a short 3-sentence health summary and suggest what meal plan type suits this customer best.
 Options: Low-carb / High-protein / Balanced / Soft diet / Diabetic-friendly
 
 Return response as a JSON object with exactly these properties:
 {
   "summary": "Short 3-sentence summary highlighting BMI and restrictions...",
   "suggestion": "Low-carb" (must be matching one of the options above)
 }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        setCachedData("health-summary", payload, parsed);
        return res.json(parsed);
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit) {
        console.warn("Gemini Rate Limit (429) hit for /api/ai/health-summary. Falling back to high-fidelity local simulation.");
      } else {
        console.error("Gemini Health Summary Error:", err);
      }
    }
  }

  // Fallback engine
  let calculatedSuggestion = "Balanced";
  const med = (medical_condition || "").toLowerCase();
  const act = (activity_level || "").toLowerCase();
  const w = parseFloat(weight) || 70;
  const b = parseFloat(bmi) || 22;

  if (med.includes("diabet") || med.includes("sugar") || med.includes("glucose")) {
    calculatedSuggestion = "Diabetic-friendly";
  } else if (act.includes("active") || act.includes("highly") || med.includes("muscle") || w > 85) {
    calculatedSuggestion = "High-protein";
  } else if (b > 25 || med.includes("weight loss") || med.includes("obese")) {
    calculatedSuggestion = "Low-carb";
  } else if (med.includes("digestive") || med.includes("tooth") || med.includes("gerd") || med.includes("soft")) {
    calculatedSuggestion = "Soft diet";
  }

  const generatedSummary = `The customer exhibits a ${b > 25 ? "higher" : b < 18.5 ? "lower" : "healthy"} BMI of ${b.toFixed(1)} with a target of active wellness. Notable considerations include health status listed as '${medical_condition || "None"}' with medicine intake as '${medicine_taking || "None"}'. Structured portion metrics aligned with a ${calculatedSuggestion.toLowerCase()} core is recommended to ensure daily macro targets are achieved.`;

  const fallbackResult = {
    summary: generatedSummary,
    suggestion: calculatedSuggestion,
  };

  // Cache fallback results too to prevent repetitive Gemini request fires when in rate limit cooldown
  setCachedData("health-summary", payload, fallbackResult);
  res.json(fallbackResult);
});

// -------------------------------------------------------------
// AI-2: Meal Plan Recommendation Engine
// -------------------------------------------------------------
app.post("/api/ai/meal-recommendation", async (req, res) => {
  const { bmi, medical_condition, activity_level, allergies, special_requests } = req.body;

  const payload = { bmi, medical_condition, activity_level, allergies, special_requests };
  const cached = getCachedData("meal-recommendation", payload);
  if (cached) {
    return res.json(cached);
  }

  if (ai) {
    try {
      const prompt = `Given these customer details:
 - BMI: ${bmi || "unknown"}
 - Medical Condition: ${medical_condition || "none"}
 - Activity Level: ${activity_level || "moderate"}
 - Allergies: ${allergies || "none"}
 - Special Requests: ${special_requests || "none"}
 
 Please recommend the top 3 meal plan types from the options of: Keto, Vegan, Paleo, High-Protein, Low-Carb.
 Return response as a JSON array of objects with exactly these properties:
 [
   { "category": "Keto", "reason": "1-2 sentence rationale based on BMI and allergy safety..." },
   { "category": "High-Protein", "reason": "Rationale..." },
   { "category": "Low-Carb", "reason": "Rationale..." }
 ]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        setCachedData("meal-recommendation", payload, parsed);
        return res.json(parsed);
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit) {
        console.warn("Gemini Rate Limit (429) hit for /api/ai/meal-recommendation. Falling back to high-fidelity local simulation.");
      } else {
        console.error("Gemini Recommendation Error:", err);
      }
    }
  }

  // Fallback Recommendation engine
  const finalAllergies = (allergies || "").toLowerCase();
  const recs = [
    {
      category: "Keto",
      reason: `Ideal for accelerating metabolic transition with a BMI of ${bmi || "22"}. High in premium fats and allergen-guarded.`,
    },
    {
      category: "High-Protein",
      reason: `Highly recommended for supporting ${activity_level || "Active"} physical goals and maintaining lean mass safely.`,
    },
    {
      category: "Low-Carb",
      reason: `Fosters sugar regulation and controls insulin spikes especially considering '${medical_condition || "None"}'.`,
    },
  ];

  if (finalAllergies.includes("dairy") || finalAllergies.includes("meat")) {
    recs[0] = {
      category: "Vegan",
      reason: "Provides robust organic fiber matrices, safe from shellfish/dairy/poultry ingredients.",
    };
  }

  setCachedData("meal-recommendation", payload, recs);
  res.json(recs);
});

// -------------------------------------------------------------
// AI-3: Auto-Classify Inquiry Intent
// -------------------------------------------------------------
app.post("/api/ai/classify-intent", async (req, res) => {
  const { message_text } = req.body;

  const payload = { message_text };
  const cached = getCachedData("classify-intent", payload);
  if (cached) {
    return res.json(cached);
  }

  if (ai) {
    try {
      const prompt = `Classify this inquiry message intent into exactly one of: [price_inquiry / menu_question / delivery_question / health_question / complaint / ready_to_order]
 
 Message: "${message_text || ""}"
 
 Return response as a JSON object with a single "intent_tag" key.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        const result = { intent_tag: parsed.intent_tag || "menu_question" };
        setCachedData("classify-intent", payload, result);
        return res.json(result);
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit) {
        console.warn("Gemini Rate Limit (429) hit for /api/ai/classify-intent. Falling back to high-fidelity local simulation.");
      } else {
        console.error("Gemini Classify Intent Error:", err);
      }
    }
  }

  // Fallback simple keyword match
  const text = (message_text || "").toLowerCase();
  let tag = "menu_question";

  if (text.includes("price") || text.includes("cost") || text.includes("how much") || text.includes("baht") || text.includes("discount") || text.includes("pro ")) {
    tag = "price_inquiry";
  } else if (text.includes("deliver") || text.includes("time") || text.includes("address") || text.includes("schedule") || text.includes("arrive")) {
    tag = "delivery_question";
  } else if (text.includes("allergy") || text.includes("diabetes") || text.includes("sick") || text.includes("weight") || text.includes("kcal") || text.includes("fat")) {
    tag = "health_question";
  } else if (text.includes("bad") || text.includes("late") || text.includes("cold") || text.includes("wrong") || text.includes("complain") || text.includes("refund")) {
    tag = "complaint";
  } else if (text.includes("order") || text.includes("buy") || text.includes("subscribe") || text.includes("sign up") || text.includes("want keto")) {
    tag = "ready_to_order";
  }

  const fallbackResult = { intent_tag: tag };
  setCachedData("classify-intent", payload, fallbackResult);
  res.json(fallbackResult);
});

// -------------------------------------------------------------
// AI-4: Churn Risk Detection
// -------------------------------------------------------------
app.post("/api/ai/churn-risk", async (req, res) => {
  const { daysSinceLastOrder, isExpiring, noResponseCount, negativeFeedbackCount } = req.body;

  const payload = { daysSinceLastOrder, isExpiring, noResponseCount, negativeFeedbackCount };
  const cached = getCachedData("churn-risk", payload);
  if (cached) {
    return res.json(cached);
  }

  if (ai) {
    try {
      const prompt = `Evaluate churn risk score (0 to 100) and suggest a retention action based on these client signals:
- Days since last order: ${daysSinceLastOrder || 0} days
- Package is expiring soon without renewal: ${isExpiring ? "true" : "false"}
- Staff sent messages with no reply: ${noResponseCount || 0} times
- Negative customer feedback count: ${negativeFeedbackCount || 0}
 
 Return a JSON with exactly these fields:
 {
   "score": 65,  // rating from 0 to 100
   "action": "Retention advice line..."
 }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        setCachedData("churn-risk", payload, parsed);
        return res.json(parsed);
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit) {
        console.warn("Gemini Rate Limit (429) hit for /api/ai/churn-risk. Falling back to high-fidelity local simulation.");
      } else {
        console.error("Gemini Churn Risk assessment Error:", err);
      }
    }
  }

  // Fallback logic
  let score = 10;
  let action = "Continue standard nutritional checks and scheduled newsletters.";

  const days = parseInt(daysSinceLastOrder) || 0;
  const exp = !!isExpiring;
  const noRep = parseInt(noResponseCount) || 0;
  const negFeed = parseInt(negativeFeedbackCount) || 0;

  if (days > 14) score += 40;
  if (exp) score += 20;
  if (noRep >= 2) score += 20;
  if (negFeed > 0) score += 30;

  score = Math.min(100, Math.max(0, score));

  if (score > 60) {
    action = `🚨 High Churn Risk! Send customized 20% Discount Code for renew plans, and request a 1-to-1 nutritional check-in.`;
  } else if (score > 30) {
    action = `⚠️ Moderate Risk. Propose a meal customization swap and check delivery satisfaction.`;
  } else {
    action = `🟢 Safe Customer. Congratulate them on adherence and suggest dietary milestone goals.`;
  }

  const fallbackResult = { score, action };
  setCachedData("churn-risk", payload, fallbackResult);
  res.json(fallbackResult);
});

// -------------------------------------------------------------
// AI-5: Auto-Reply Draft for Staff
// -------------------------------------------------------------
app.post("/api/ai/reply-draft", async (req, res) => {
  const { messages, customer_profile } = req.body;

  const payload = { messages, customer_profile };
  const cached = getCachedData("reply-draft", payload);
  if (cached) {
    return res.json(cached);
  }

  if (ai) {
    try {
      const messagesStr = (messages || []).map((m: any) => `${m.sender || "user"}: ${m.text || ""}`).join("\n");
      const prompt = `Given the customer overview: "${customer_profile || "Inquiry Lead"}" and their recent message Thread:
${messagesStr}
 
 Generate a polite, expert suggested reply in a Thai-friendly, professional, highly helpful tone. Use polite structures suited for our premium diet restaurant support staff.
 Return response as a JSON object:
 {
   "draft": "Warm draft response..."
 }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        setCachedData("reply-draft", payload, parsed);
        return res.json(parsed);
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
      if (isRateLimit) {
        console.warn("Gemini Rate Limit (429) hit for /api/ai/reply-draft. Falling back to high-fidelity local simulation.");
      } else {
        console.error("Gemini Reply Draft Error:", err);
      }
    }
  }

  // Fallback draft replies
  const msgs = messages || [];
  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1].text : "programs";
  let responseText = "Hello! Sawasdee khrup/ka, thank you for contacting Busy Boss Diet delivery support. We would love to customize an organic program for your specific health goals! Let us know if you have any severe allergies so our chef can accommodate.";

  if (lastMsg.toLowerCase().includes("price") || lastMsg.toLowerCase().includes("cost")) {
    responseText = "Sawasdee khrup! Thank you for inquiring about Busy Boss Diet plans! Our premium packages start at only 3,500 THB/week including free deliveries direct to your home. Would you like to check our special Keto and High-Protein Menu options for this week?";
  } else if (lastMsg.toLowerCase().includes("deliver")) {
    responseText = "Sawasdee ka! We deliver fresh meals twice daily (Morning 6:00-9:00 AM and Afternoon 4:00-7:00 PM) in insulated thermal bags. We can deliver directly to your condo front desk or office lobby. Shall we set up your schedule khrup?";
  }

  const fallbackResult = { draft: responseText };
  setCachedData("reply-draft", payload, fallbackResult);
  res.json(fallbackResult);
});

// -------------------------------------------------------------
// Vite Server Integration middleware
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server linked to Express");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production static directory: " + distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Busy Boss Diet server running on http://localhost:${PORT}`);
  });
}

bootstrap();
