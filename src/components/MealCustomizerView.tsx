import React, { useState, useEffect } from 'react';
import { Customer, InventoryItem, Order, DietCategory } from '../types';
import { 
  Scale, 
  Sparkles, 
  Plus, 
  Minus, 
  Check, 
  ShoppingCart, 
  User, 
  RefreshCw, 
  Flame, 
  Leaf, 
  Dumbbell, 
  Layers, 
  TrendingDown, 
  AlertTriangle, 
  HelpCircle, 
  Heart, 
  Layers2, 
  Timer, 
  Cookie, 
  Feather,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MealCustomizerProps {
  customers: Customer[];
  inventory: InventoryItem[];
  handleAddCustomOrder: (order: Partial<Order>, ingredientsUsed: { [id: string]: number }) => void;
  darkMode: boolean;
}

export default function MealCustomizerView({ customers, inventory, handleAddCustomOrder, darkMode }: MealCustomizerProps) {
  // Main inputs
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [dietStyle, setDietStyle] = useState<DietCategory>('Keto');
  const [mealName, setMealName] = useState<string>('Custom Herb Salmon & Avocado Platter');
  const [targetKcal, setTargetKcal] = useState<number>(600);
  const [orderSheetType, setOrderSheetType] = useState<'Standard Prep' | 'Special Kitchen' | 'VIP Express Prep' | 'Allergen Guard'>('Standard Prep');

  // Ingredient weights state (grams)
  const [proteinWeight, setProteinWeight] = useState<number>(180);
  const [carbWeight, setCarbWeight] = useState<number>(50);
  const [fatWeight, setFatWeight] = useState<number>(40);
  const [greenWeight, setGreenWeight] = useState<number>(100);

  // Chosen item identifiers from state
  const [chosenProtein, setChosenProtein] = useState<string>('');
  const [chosenCarb, setChosenCarb] = useState<string>('');
  const [chosenFat, setChosenFat] = useState<string>('');
  const [chosenGreen, setChosenGreen] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Initialize selected ingredients based on categories from stock
  useEffect(() => {
    // Proteins
    const proteins = inventory.filter(i => i.proteinPer100g > 15 && i.carbPer100g < 5);
    if (proteins.length > 0) setChosenProtein(proteins[0].id);

    // Carbs
    const carbs = inventory.filter(i => i.carbPer100g > 10);
    if (carbs.length > 0) setChosenCarb(carbs[0].id);

    // Fats
    const fats = inventory.filter(i => i.fatPer100g > 10 && i.proteinPer100g < 10);
    if (fats.length > 0) setChosenFat(fats[0].id);

    // Greens
    const greens = inventory.filter(i => i.caloriesPer100g < 50 && i.proteinPer100g < 5 && i.carbPer100g < 10);
    if (greens.length > 0) setChosenGreen(greens[0].id);
  }, [inventory]);

  // Adjust diet ratios automatically based on target style selection
  const applyDietPresetRatio = (style: DietCategory) => {
    setDietStyle(style);
    if (style === 'Keto') {
      setProteinWeight(200);
      setCarbWeight(15);
      setFatWeight(60);
      setGreenWeight(120);
      setMealName('Custom Keto Healthy Butter Roast Platters');
    } else if (style === 'Vegan') {
      setProteinWeight(110);
      setCarbWeight(170);
      setFatWeight(20);
      setGreenWeight(150);
      setMealName('Custom Organic Garden Plant Tofu Bowl');
    } else if (style === 'High-Protein') {
      setProteinWeight(260);
      setCarbWeight(70);
      setFatWeight(12);
      setGreenWeight(100);
      setMealName('Custom High-Pro Hypertrophy Muscle Meal');
    } else if (style === 'Low-Carb') {
      setProteinWeight(210);
      setCarbWeight(25);
      setFatWeight(30);
      setGreenWeight(130);
      setMealName('Custom Lean Shred Hydro-Baked Plate');
    } else {
      setProteinWeight(180);
      setCarbWeight(80);
      setFatWeight(30);
      setGreenWeight(100);
      setMealName('Customized Clean Balanced Meal');
    }
  };

  // Handle customer pre-sets
  const handleSelectCustomer = (custId: string) => {
    if (!custId) {
      setSelectedCustomer(null);
      return;
    }
    const customer = customers.find(c => c.id === custId);
    if (customer) {
      setSelectedCustomer(customer);
      setDietStyle(customer.category);
      setTargetKcal(Math.round(customer.targetKcal / 3));

      // Adjust slider values to fit macro profiles of specified diets
      if (customer.category === 'Keto') {
        setProteinWeight(200);
        setCarbWeight(15);
        setFatWeight(55);
        setGreenWeight(120);
      } else if (customer.category === 'Vegan') {
        setProteinWeight(110);
        setCarbWeight(160);
        setFatWeight(22);
        setGreenWeight(150);
      } else if (customer.category === 'High-Protein') {
        setProteinWeight(250);
        setCarbWeight(75);
        setFatWeight(15);
        setGreenWeight(100);
      } else if (customer.category === 'Low-Carb') {
        setProteinWeight(220);
        setCarbWeight(28);
        setFatWeight(32);
        setGreenWeight(125);
      } else {
        setProteinWeight(180);
        setCarbWeight(80);
        setFatWeight(30);
        setGreenWeight(100);
      }

      setMealName(`Personalized Plan: ${customer.name}`);
    }
  };

  // Find exact stock items
  const proteinItem = inventory.find(i => i.id === chosenProtein);
  const carbItem = inventory.find(i => i.id === chosenCarb);
  const fatItem = inventory.find(i => i.id === chosenFat);
  const greenItem = inventory.find(i => i.id === chosenGreen);

  // Compute live values
  const getMacros = () => {
    let kcal = 0;
    let prot = 0;
    let carb = 0;
    let fat = 0;

    if (proteinItem) {
      kcal += (proteinWeight * proteinItem.caloriesPer100g) / 100;
      prot += (proteinWeight * proteinItem.proteinPer100g) / 100;
      carb += (proteinWeight * proteinItem.carbPer100g) / 100;
      fat += (proteinWeight * proteinItem.fatPer100g) / 100;
    }
    if (carbItem) {
      kcal += (carbWeight * carbItem.caloriesPer100g) / 100;
      prot += (carbWeight * carbItem.proteinPer100g) / 100;
      carb += (carbWeight * carbItem.carbPer100g) / 100;
      fat += (carbWeight * carbItem.fatPer100g) / 100;
    }
    if (fatItem) {
      kcal += (fatWeight * fatItem.caloriesPer100g) / 100;
      prot += (fatWeight * fatItem.proteinPer100g) / 100;
      carb += (fatWeight * fatItem.carbPer100g) / 100;
      fat += (fatWeight * fatItem.fatPer100g) / 100;
    }
    if (greenItem) {
      kcal += (greenWeight * greenItem.caloriesPer100g) / 100;
      prot += (greenWeight * greenItem.proteinPer100g) / 100;
      carb += (greenWeight * greenItem.carbPer100g) / 100;
      fat += (greenWeight * greenItem.fatPer100g) / 100;
    }

    return {
      kcal: Math.round(kcal),
      protein: Math.round(prot * 10) / 10,
      carbs: Math.round(carb * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  };

  const currentMacros = getMacros();
  const kcalAccuracy = Math.min(Math.round((currentMacros.kcal / targetKcal) * 100), 100);

  // Nutrition percentages breakdown
  const totalKcalMultiplier = Math.max(currentMacros.kcal, 1);
  const ketoScore = Math.round(((currentMacros.fat * 9) / totalKcalMultiplier) * 100);
  const proteinScore = Math.round(((currentMacros.protein * 4) / totalKcalMultiplier) * 100);
  const carbScore = Math.round(((currentMacros.carbs * 4) / totalKcalMultiplier) * 100);

  // List filtered choices
  const proteinChoices = inventory.filter(i => i.proteinPer100g > 10 && i.carbPer100g < 10);
  const carbChoices = inventory.filter(i => i.carbPer100g > 10);
  const fatChoices = inventory.filter(i => i.fatPer100g > 10 && i.proteinPer100g < 10);
  const greenChoices = inventory.filter(i => i.caloriesPer100g < 100 && i.id !== chosenProtein && i.id !== chosenCarb && i.id !== chosenFat);

  // Quick preset handlers
  const handleIncrease = (stateSetter: React.Dispatch<React.SetStateAction<number>>, value: number, max: number = 350) => {
    stateSetter(prev => Math.min(prev + 10, max));
  };
  const handleDecrease = (stateSetter: React.Dispatch<React.SetStateAction<number>>, value: number, min: number = 0) => {
    stateSetter(prev => Math.max(prev - 10, min));
  };

  const handleSubmit = () => {
    // Ready delivery payload
    const newOrder: Partial<Order> = {
      customerName: selectedCustomer ? selectedCustomer.name : 'A la Carte Custom Meal',
      category: dietStyle,
      mealName: mealName,
      proteinGrams: currentMacros.protein,
      carbGrams: currentMacros.carbs,
      fatGrams: currentMacros.fat,
      totalKcal: currentMacros.kcal,
      address: selectedCustomer ? selectedCustomer.phone : 'Delivery On Demand Node',
      price: Math.round(12 + (currentMacros.kcal / 50) * 100) / 100, // Custom scaling price algorithm
      status: 'Placed',
      orderSheetType: orderSheetType,
    };

    // Calculate actual stock deduction
    const stockDeduction: { [id: string]: number } = {};
    if (chosenProtein) stockDeduction[chosenProtein] = proteinWeight;
    if (chosenCarb) stockDeduction[chosenCarb] = carbWeight;
    if (chosenFat) stockDeduction[chosenFat] = fatWeight;
    if (chosenGreen) stockDeduction[chosenGreen] = greenWeight;

    // Check ingredients availability
    let insufficient = false;
    let foodError = '';
    Object.keys(stockDeduction).forEach((id) => {
      const invItem = inventory.find(i => i.id === id);
      if (invItem && invItem.quantityGrams < stockDeduction[id]) {
        insufficient = true;
        foodError += `${invItem.name} (${invItem.quantityGrams}g remaining); `;
      }
    });

    if (insufficient) {
      setNotification(`🚨 Out of stock! Cannot build meal. Insufficient amount of: ${foodError}`);
      setTimeout(() => setNotification(null), 6000);
      return;
    }

    handleAddCustomOrder(newOrder, stockDeduction);
    setNotification(`✅ Customized meal for ${newOrder.customerName} added to current Delivery Queue!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Visual percentages of current plate
  const totalWeight = proteinWeight + carbWeight + fatWeight + greenWeight || 1;
  const pPct = (proteinWeight / totalWeight) * 100;
  const cPct = (carbWeight / totalWeight) * 100;
  const fPct = (fatWeight / totalWeight) * 100;
  const gPct = (greenWeight / totalWeight) * 100;

  // Diet plans configurations for beautiful buttons
  const dietConfigs = [
    { type: 'Keto' as DietCategory, label: 'Keto Presets', icon: Flame, desc: 'High Fats / Under 20g Carbs', colorClass: 'border-orange-500/20 text-orange-400 bg-orange-500/5 hover:bg-orange-500/10 active:bg-orange-500/20' },
    { type: 'Vegan' as DietCategory, label: 'Vegan Presets', icon: Leaf, desc: 'Plant Nutrients & Rich Greens', colorClass: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 active:bg-emerald-500/20' },
    { type: 'Paleo' as DietCategory, label: 'Paleo Presets', icon: Layers, desc: 'Unprocessed Meats & Roots', colorClass: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5 hover:bg-yellow-500/10 active:bg-yellow-500/20' },
    { type: 'High-Protein' as DietCategory, label: 'High Protein', icon: Dumbbell, desc: 'Maximized Athletic Repair', colorClass: 'border-rose-500/20 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 active:bg-rose-500/20' },
    { type: 'Low-Carb' as DietCategory, label: 'Low Carb', icon: TrendingDown, desc: 'Glucose Shortages for Shred', colorClass: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 active:bg-cyan-500/20' }
  ];

  return (
    <div id="meal-customizer-view" className="space-y-6">
      
      {/* Dynamic Popups */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xl z-50 ${
              notification.startsWith('✅') 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/5' 
                : 'bg-red-500/10 text-red-500 border border-red-500/30 shadow-red-500/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{notification.startsWith('✅') ? '🥗' : '🛑'}</span>
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-[10px] font-bold underline cursor-pointer hover:text-white transition-colors">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Smart Assist toggle */}
      <div className={`p-6 rounded-[32px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
        darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
      }`}>
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center">
            <Scale className="w-5 h-5 text-[#1DB954]" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Personalized Bento Box Customizer</h2>
            <p className="text-xs text-zinc-400">Step-by-step custom meal assembly and portion simulation calibrated for active diet goals</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Smart explanation toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border ${
              showExplanation 
                ? 'bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/30' 
                : 'bg-zinc-950/20 text-zinc-400 border-zinc-850 hover:text-zinc-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showExplanation ? 'Hide Guide' : 'Show Guide'}
          </button>

          <span className="text-xs bg-[#1DB954]/20 text-[#1DB954] px-3 py-1.5 rounded-full font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Autoscale Enabled
          </span>
        </div>
      </div>

      {/* Info Guide Pane */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl p-5 text-xs space-y-3 overflow-hidden border ${
              darkMode ? 'bg-zinc-950/40 border-zinc-850 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}
          >
            <h4 className="font-bold text-sm text-[#1DB954] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Understanding the Portion Builder Mechanics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="font-bold text-zinc-400 block uppercase font-mono text-[10px]">1. Preserving Muscle Mass</span>
                <p>Lean Proteins are calibrated to prevent nitrogen depletion during caloric deficits. Protein supplies <strong className="text-rose-500">4 kcal per gram</strong> and fuels lean recovery.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-400 block uppercase font-mono text-[10px]">2. Glycogen Rations</span>
                <p>Complex Carbohydrates release glucose slowly. Highly restricted in Keto presets to maintain nutritional ketosis, starch supplies <strong className="text-amber-500">4 kcal per gram</strong>.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-zinc-400 block uppercase font-mono text-[10px]">3. Lipids Density</span>
                <p>Healthy Essential Fats supply dense slow-burning fuel at <strong className="text-cyan-500">9 kcal per gram</strong>. Perfect for cellular regeneration, metabolic satiety, and steady energy.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-[#1DB954]">
              <span>Formula: Dish Calories = ((Protein * Density) + (Carbs * Density) + (Fats * Density) + Veggies) * Accuracy Index</span>
              <span className="font-semibold flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Keep client nutrition clean
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Intuitive Configurator form */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          
          {/* STEP 1: Plan Goals & Profile Selection */}
          <div className={`p-6 rounded-[32px] shadow-sm border space-y-5 ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center text-xs font-bold font-mono">1</span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Set Diet Goal & Target Profile</h3>
            </div>

            {/* Profile Folder select */}
            <div className="space-y-2">
              <label htmlFor="customer-select" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase font-mono">
                <User className="w-3.5 h-3.5 text-zinc-550" /> Link Client Health Folder
              </label>
              <select
                id="customer-select"
                value={selectedCustomer ? selectedCustomer.id : ''}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className={`w-full p-3.5 rounded-2xl text-xs font-semibold tracking-tight border focus:ring-2 focus:ring-[#1DB954] transition-all outline-none ${
                  darkMode ? 'bg-zinc-950 border-zinc-850 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              >
                <option value="">-- Standalone Customized Meal --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category} Plan • Target {Math.round(c.targetKcal / 3)} kcal/meal • Currently {c.currentWeight}kg)
                  </option>
                ))}
              </select>

              {/* Linking visual feedback card */}
              {selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-xl border border-dashed border-[#1DB954]/30 bg-[#1DB954]/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-[#1DB954] uppercase tracking-wider text-[9px] font-mono block">Connected Health Dossier</span>
                    <p className="text-zinc-300 font-medium">Auto-setting target meal budget to <strong className="text-white font-mono">{Math.round(selectedCustomer.targetKcal / 3)} kcal</strong> based on {selectedCustomer.name}'s loss schedule.</p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-400 bg-emerald-500/10 rounded-full p-0.5" />
                </motion.div>
              )}
            </div>

            {/* Quick Interactive Diet Cards Grid instead of simple select */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase font-mono">Diet Category Target Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {dietConfigs.map((cfg) => {
                  const IconComp = cfg.icon;
                  const isSelected = dietStyle === cfg.type;
                  return (
                    <button
                      key={cfg.type}
                      type="button"
                      onClick={() => applyDietPresetRatio(cfg.type)}
                      className={`p-3 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between h-[100px] cursor-pointer hover:scale-[1.03] ${
                        isSelected 
                          ? 'ring-2 ring-[#1DB954] border-transparent bg-[#1DB954]/10 shadow-[0_0_15px_rgba(29,185,84,0.15)] text-white' 
                          : `${cfg.colorClass} border-zinc-800`
                      }`}
                      title={cfg.desc}
                    >
                      <div className="flex items-center justify-between w-full">
                        <IconComp className={`w-4 h-4 ${isSelected ? 'text-[#1DB954]' : ''}`} />
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />}
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold font-mono tracking-tight block">{cfg.type}</span>
                        <span className="text-[8.5px] text-zinc-400 leading-tight block truncate">{cfg.desc.slice(0, 20)}...</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recipe title designation */}
              <div className="space-y-1.5">
                <label htmlFor="meal-name" className="text-xs font-semibold text-zinc-400 uppercase font-mono">Meal Dispatch Name</label>
                <input
                  id="meal-name"
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="Recipe name (e.g. Avocado Salmon Platter)"
                  className={`w-full p-3.5 rounded-2xl text-xs font-semibold border focus:ring-2 focus:ring-[#1DB954] transition-all outline-none ${
                    darkMode ? 'bg-zinc-950 border-zinc-850 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              {/* Calories Target Value and quick buttons */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="target-kcal" className="text-xs font-semibold text-zinc-400 uppercase font-mono">Meal Target Calories</label>
                  <span className="text-xs font-mono font-bold text-[#1DB954]">{targetKcal} kcal</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    id="target-kcal"
                    type="number"
                    value={targetKcal}
                    min={200}
                    max={1200}
                    step={25}
                    onChange={(e) => setTargetKcal(Number(e.target.value))}
                    className={`w-full p-3 rounded-2xl text-xs font-mono font-bold border focus:ring-2 focus:ring-[#1DB954] transition-all outline-none ${
                      darkMode ? 'bg-zinc-950 border-zinc-850 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                  {/* Common preset calories shortcuts */}
                  <div className="flex gap-1">
                    {[400, 600, 800].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTargetKcal(val)}
                        className={`px-2.5 rounded-xl text-[10.5px] font-bold font-mono transition-colors border cursor-pointer ${
                          targetKcal === val 
                            ? 'bg-[#1DB954] text-white border-transparent' 
                            : 'bg-zinc-950/30 text-zinc-400 border-zinc-800 hover:text-white'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Prep Sheet Type Selection */}
            <div id="order-sheet-type-container" className="space-y-1.5 border-t border-zinc-800 pt-4">
              <label htmlFor="order-sheet-type-select" className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 uppercase font-mono">
                <BookOpen className="w-3.5 h-3.5 text-[#1DB954]" /> Choose Order Prep Sheet Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Standard Prep', 'Special Kitchen', 'VIP Express Prep', 'Allergen Guard'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderSheetType(type)}
                    className={`p-2.5 rounded-xl text-xs font-bold font-sans border text-center transition-all cursor-pointer ${
                      orderSheetType === type
                        ? 'border-[#1DB954] bg-[#1DB954]/10 text-white font-black shadow-sm'
                        : darkMode 
                          ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 text-zinc-400 hover:text-white' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-750'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">This categorizes the physical prep sheet type printed in the kitchen.</p>
            </div>

          </div>

          {/* STEP 2: Ingredient Pantry Builder and Slider Controls */}
          <div className={`p-6 rounded-[32px] shadow-sm border space-y-6 ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-850 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center text-xs font-bold font-mono">2</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">Assemble Ingredient Portions</h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Live stocks are subtracted upon dispatches</span>
            </div>

            {/* 1. PROTEIN BUILDER BLOCK */}
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-rose-500/30 transition-all space-y-3.5 group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  <span className="text-xs font-bold font-mono tracking-tight text-zinc-300">1. CHOOSE LEAN PROTEIN SOURCE</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={chosenProtein}
                    onChange={(e) => setChosenProtein(e.target.value)}
                    className="p-1.5 rounded-xl text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-[#1DB954] outline-none max-w-[180px] cursor-pointer"
                  >
                    {proteinChoices.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.proteinPer100g}g P /100g)</option>
                    ))}
                  </select>
                  <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    {proteinWeight}g
                  </span>
                </div>
              </div>

              {/* Slider, Presets and Stock alert */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecrease(setProteinWeight, proteinWeight, 50)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={50}
                    max={350}
                    step={5}
                    value={proteinWeight}
                    onChange={(e) => setProteinWeight(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-rose-950/20 accent-rose-500"
                  />
                  <button 
                    onClick={() => handleIncrease(setProteinWeight, proteinWeight, 350)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gram presets and Stock metrics representation */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div className="flex gap-1.5 text-zinc-400">
                    {[100, 150, 200, 250].map(pG => (
                      <button
                        key={pG}
                        type="button"
                        onClick={() => setProteinWeight(pG)}
                        className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                          proteinWeight === pG ? 'bg-rose-500 text-white font-bold' : 'bg-zinc-900 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {pG}g
                      </button>
                    ))}
                  </div>

                  {/* Stock status indicator */}
                  {proteinItem && (
                    <span className={`font-semibold font-mono ${
                      proteinItem.quantityGrams < proteinWeight 
                        ? 'text-rose-400 flex items-center gap-1' 
                        : 'text-zinc-500'
                    }`}>
                      {proteinItem.quantityGrams < proteinWeight && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      In Stock: {proteinItem.quantityGrams}g
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CARBOHYDRATES BUILDER BLOCK */}
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-amber-500/30 transition-all space-y-3.5 group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <span className="text-xs font-bold font-mono tracking-tight text-zinc-300">2. CHOOSE COMPLEX STARCH SIDE</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={chosenCarb}
                    onChange={(e) => setChosenCarb(e.target.value)}
                    className="p-1.5 rounded-xl text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-[#1DB954] outline-none max-w-[180px] cursor-pointer"
                  >
                    {carbChoices.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.carbPer100g}g C /100g)</option>
                    ))}
                  </select>
                  <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    {carbWeight}g
                  </span>
                </div>
              </div>

              {/* Slider, Presets and Stock alert */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecrease(setCarbWeight, carbWeight, 0)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={300}
                    step={5}
                    value={carbWeight}
                    onChange={(e) => setCarbWeight(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-amber-950/20 accent-amber-500"
                  />
                  <button 
                    onClick={() => handleIncrease(setCarbWeight, carbWeight, 300)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gram presets and Stock metrics representation */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div className="flex gap-1.5 text-zinc-400">
                    {[0, 40, 80, 150, 200].map(pC => (
                      <button
                        key={pC}
                        type="button"
                        onClick={() => setCarbWeight(pC)}
                        className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                          carbWeight === pC ? 'bg-amber-500 text-white font-bold' : 'bg-zinc-900 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {pC}g
                      </button>
                    ))}
                  </div>

                  {/* Stock status indicator */}
                  {carbItem && (
                    <span className={`font-semibold font-mono ${
                      carbItem.quantityGrams < carbWeight 
                        ? 'text-rose-400 flex items-center gap-1' 
                        : 'text-zinc-500'
                    }`}>
                      {carbItem.quantityGrams < carbWeight && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      In Stock: {carbItem.quantityGrams}g
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. HEALTHY FATS BUILDER BLOCK */}
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-cyan-500/30 transition-all space-y-3.5 group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                  <span className="text-xs font-bold font-mono tracking-tight text-zinc-300">3. DRIZZLE HEALTHY LIPIDS / OILS</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={chosenFat}
                    onChange={(e) => setChosenFat(e.target.value)}
                    className="p-1.5 rounded-xl text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-[#1DB954] outline-none max-w-[180px] cursor-pointer"
                  >
                    {fatChoices.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.fatPer100g}g F /100g)</option>
                    ))}
                  </select>
                  <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    {fatWeight}g
                  </span>
                </div>
              </div>

              {/* Slider, Presets and Stock alert */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecrease(setFatWeight, fatWeight, 0)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={120}
                    step={2}
                    value={fatWeight}
                    onChange={(e) => setFatWeight(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-cyan-950/20 accent-cyan-500"
                  />
                  <button 
                    onClick={() => handleIncrease(setFatWeight, fatWeight, 120)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gram presets and Stock metrics representation */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div className="flex gap-1.5 text-zinc-400">
                    {[0, 15, 30, 45, 60].map(pF => (
                      <button
                        key={pF}
                        type="button"
                        onClick={() => setFatWeight(pF)}
                        className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                          fatWeight === pF ? 'bg-cyan-500 text-white font-bold' : 'bg-zinc-900 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {pF}g
                      </button>
                    ))}
                  </div>

                  {/* Stock status indicator */}
                  {fatItem && (
                    <span className={`font-semibold font-mono ${
                      fatItem.quantityGrams < fatWeight 
                        ? 'text-rose-400 flex items-center gap-1' 
                        : 'text-zinc-500'
                    }`}>
                      {fatItem.quantityGrams < fatWeight && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      In Stock: {fatItem.quantityGrams}g
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 4. MICROS & GREENS BED BLOCK */}
            <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-850 hover:border-emerald-500/30 transition-all space-y-3.5 group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-xs font-bold font-mono tracking-tight text-zinc-300">4. FIBER-RICH GREEN SALAD BED</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={chosenGreen}
                    onChange={(e) => setChosenGreen(e.target.value)}
                    className="p-1.5 rounded-xl text-[11px] font-bold bg-zinc-900 border border-zinc-800 text-[#1DB954] outline-none max-w-[180px] cursor-pointer"
                  >
                    {greenChoices.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.caloriesPer100g} kcal/100g)</option>
                    ))}
                  </select>
                  <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    {greenWeight}g
                  </span>
                </div>
              </div>

              {/* Slider, Presets and Stock alert */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecrease(setGreenWeight, greenWeight, 20)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={20}
                    max={250}
                    step={5}
                    value={greenWeight}
                    onChange={(e) => setGreenWeight(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-emerald-950/20 accent-emerald-500"
                  />
                  <button 
                    onClick={() => handleIncrease(setGreenWeight, greenWeight, 250)}
                    className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Gram presets and Stock metrics representation */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                  <div className="flex gap-1.5 text-zinc-400">
                    {[50, 100, 150, 200].map(pG => (
                      <button
                        key={pG}
                        type="button"
                        onClick={() => setGreenWeight(pG)}
                        className={`px-2 py-0.5 rounded-md font-mono transition-colors cursor-pointer ${
                          greenWeight === pG ? 'bg-emerald-500 text-white font-bold' : 'bg-zinc-900 border border-zinc-800 hover:text-white'
                        }`}
                      >
                        {pG}g
                      </button>
                    ))}
                  </div>

                  {/* Stock status indicator */}
                  {greenItem && (
                    <span className={`font-semibold font-mono ${
                      greenItem.quantityGrams < greenWeight 
                        ? 'text-rose-400 flex items-center gap-1' 
                        : 'text-zinc-500'
                    }`}>
                      {greenItem.quantityGrams < greenWeight && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                      In Stock: {greenItem.quantityGrams}g
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Beautiful dial gauge & dynamic plate weight renderer */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          
          {/* Circular dial calorie visualizer */}
          <div className={`p-6 rounded-[32px] flex flex-col items-center justify-between text-center border relative shadow-sm h-fit ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
          }`}>
            <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 self-start uppercase flex items-center gap-1.5">
              <Timer className="w-4 h-4 text-zinc-[600]" /> Caloric Target Compliance
            </h3>

            {/* Dial Ring */}
            <div id="gauge-layout-ring" className="relative w-40 h-40 flex items-center justify-center my-6">
              <svg className="w-full h-full transform -rotate-90">
                {/* Back Plate */}
                <circle
                  cx="80"
                  cy="80"
                  r="66"
                  className={`${darkMode ? 'stroke-zinc-800/60' : 'stroke-zinc-100'}`}
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Dynamically expanding compliance metric */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="66"
                  className="stroke-[#1DB954] transition-all duration-300"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 66}
                  strokeDashoffset={2 * Math.PI * 66 * (1 - (kcalAccuracy / 100))}
                  strokeLinecap="round"
                />
              </svg>

              {/* Central readout stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="text-[10px] font-bold text-zinc-500 font-mono tracking-wider uppercase">DISH ENERGY</span>
                <span className="text-3xl font-black font-mono tracking-tight text-white">{currentMacros.kcal}</span>
                
                {/* Bullet badge accuracy */}
                <span className={`text-[9px] uppercase font-bold font-mono px-2 py-0.5 rounded-full border ${
                  Math.abs(currentMacros.kcal - targetKcal) <= 50 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : currentMacros.kcal > targetKcal 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {Math.abs(currentMacros.kcal - targetKcal) <= 50 
                    ? '🎯 TARGET MET' 
                    : currentMacros.kcal > targetKcal ? 'EXCEEDS GOAL' : 'BELOW GOAL'}
                </span>
              </div>
            </div>

            {/* Summary description details */}
            <div className="w-full border-t border-zinc-850 dark:border-zinc-800 pt-4 flex items-center justify-between text-xs">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 font-mono block">DIET PRESET</span>
                <span className="font-extrabold text-[#1DB954]">{dietStyle} Plan</span>
              </div>

              <div id="divider-rule" className="w-[1px] h-6 bg-zinc-800" />

              <div className="text-right space-y-0.5">
                <span className="text-[10px] uppercase font-extrabold text-zinc-500 font-mono block">CAL BUDGET</span>
                <span className="font-mono font-bold text-zinc-300">{targetKcal} kcal</span>
              </div>
            </div>
          </div>

          {/* Dynamic visual bento plate layout (Gamified 3D-Like Tray) */}
          <div className={`p-6 rounded-[32px] flex flex-col gap-4 border shadow-sm ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
          }`}>
            <h3 className="text-xs font-bold font-mono tracking-wider text-zinc-400 uppercase flex items-center gap-1.5">
              <Layers2 className="w-4 h-4 text-zinc-[600]" /> Gourmet Bento Tray Assembly
            </h3>

            {/* Bento container representation */}
            <div className="p-4 rounded-3xl bg-zinc-950 border border-zinc-850/75 space-y-4">
              <div className="flex justify-between items-center text-[11px] font-mono border-b border-zinc-900 pb-2">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Cookie className="w-3.5 h-3.5 text-[#1DB954]" /> Plate Weight:
                </span>
                <strong className="text-white font-extrabold">{totalWeight}g</strong>
              </div>

              {/* Dyn-scaling grid compartents bar layout with motion */}
              <div className="h-10 rounded-2xl bg-zinc-900 overflow-hidden flex shadow-inner border border-zinc-850">
                <motion.div 
                  className="bg-rose-500 h-full relative" 
                  style={{ width: `${pPct}%` }}
                  layoutID="bento-prot-ratio"
                  title={`Protein: ${proteinWeight}g`}
                />
                <motion.div 
                  className="bg-amber-500 h-full relative" 
                  style={{ width: `${cPct}%` }}
                  layoutID="bento-carb-ratio"
                  title={`Carbos: ${carbWeight}g`}
                />
                <motion.div 
                  className="bg-cyan-500 h-full relative" 
                  style={{ width: `${fPct}%` }}
                  layoutID="bento-fat-ratio"
                  title={`Fats: ${fatWeight}g`}
                />
                <motion.div 
                  className="bg-emerald-500 h-full relative" 
                  style={{ width: `${gPct}%` }}
                  layoutID="bento-green-ratio"
                  title={`Greens: ${greenWeight}g`}
                />
              </div>

              {/* Legend with gram scales and ingredients */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 bg-zinc-900/50 p-2 rounded-xl border border-zinc-900/60">
                  <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8.5px] font-extrabold text-zinc-500 uppercase font-mono leading-none">PROTEIN</span>
                    <strong className="text-zinc-300 font-mono truncate">{proteinItem ? proteinItem.name : 'Selected Source'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-900/50 p-2 rounded-xl border border-zinc-900/60">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8.5px] font-extrabold text-zinc-500 uppercase font-mono leading-none">STARCH</span>
                    <strong className="text-zinc-300 font-mono truncate">{carbItem ? carbItem.name : 'Selected Carb'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-900/50 p-2 rounded-xl border border-zinc-900/60">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8.5px] font-extrabold text-zinc-500 uppercase font-mono leading-none">LIPIDS</span>
                    <strong className="text-zinc-300 font-mono truncate">{fatItem ? fatItem.name : 'Selected Oil'}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-zinc-900/50 p-2 rounded-xl border border-zinc-900/60">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8.5px] font-extrabold text-zinc-500 uppercase font-mono leading-none">FIBER</span>
                    <strong className="text-zinc-300 font-mono truncate">{greenItem ? greenItem.name : 'Selected Salad'}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Macro Percent Bar details for explaining breakdown easily */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-extrabold text-zinc-500 tracking-wider uppercase font-mono">Caloric Energy Sharing Index</h4>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Proteins ({proteinScore}% kcal value)</span>
                  <span className="font-mono text-zinc-300">{Math.round(currentMacros.protein * 4)} kcal • {currentMacros.protein}g</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${proteinScore}%` }} className="bg-rose-500 h-full rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Lipids / Fats ({ketoScore}% kcal value)</span>
                  <span className="font-mono text-zinc-300">{Math.round(currentMacros.fat * 9)} kcal • {currentMacros.fat}g</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${ketoScore}%` }} className="bg-cyan-500 h-full rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Starch Carbs ({carbScore}% kcal value)</span>
                  <span className="font-mono text-zinc-300">{Math.round(currentMacros.carbs * 4)} kcal • {currentMacros.carbs}g</span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${carbScore}%` }} className="bg-amber-500 h-full rounded-full" />
                </div>
              </div>
            </div>

            {/* Replicate dispatched custom recipe order controls */}
            <div className="pt-4 border-t border-zinc-850 dark:border-zinc-800 mt-2">
              <button
                id="save-constructed-meal-button"
                onClick={handleSubmit}
                className="w-full py-4 bg-[#1DB954] text-white rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-[#1ed760] transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-[#1DB954]/20 cursor-pointer"
                title="Saves this customized meal and automatically substracts kitchen inventory items."
              >
                <ShoppingCart className="w-4 h-4" />
                Assemble Custom Bento Box
              </button>
              <span className="text-[9.5px] font-mono text-zinc-500 tracking-tight text-center block mt-2 leading-none lowercase">
                Submits dispatch order and preserves stock portions in meal builder databases
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
