import { useState, FormEvent, useEffect } from 'react';
import { 
  Customer, 
  DietCategory, 
  CustomerInquiry, 
  CRMFeedback,
} from '../types';
import { 
  Users, 
  DollarSign, 
  Search, 
  Plus, 
  UserPlus, 
  Activity, 
  Flame, 
  ShieldCheck, 
  Settings, 
  Mail, 
  Phone, 
  Check, 
  Cpu, 
  MessageSquare, 
  Calendar, 
  Download, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  Clock,
  Briefcase,
  ShieldAlert,
  ChevronRight,
  Heart,
  PlusCircle,
  TrendingDown,
  Lock,
  Compass,
  Shield,
  Workflow,
  RefreshCw,
  Truck,
  FileSpreadsheet,
  ArrowUpDown
} from 'lucide-react';

interface CRMViewProps {
  customers: Customer[];
  handleAddCustomer: (customer: Partial<Customer>) => Customer;
  handleDeleteCustomer?: (id: string) => void;
  handleUpdateCustomer?: (customer: Customer) => void;
  darkMode: boolean;
  inquiries?: CustomerInquiry[];
  handleAddInquiry?: (inquiry: Partial<CustomerInquiry>) => CustomerInquiry;
  handleUpdateInquiry?: (inquiry: CustomerInquiry) => void;
  feedback?: CRMFeedback[];
  handleAddFeedback?: (feedback: Partial<CRMFeedback>) => CRMFeedback;
  currentUser?: { id: string; name: string; role: string };
  staffList?: any[];
}

export type WorkflowStage = 'intake' | 'assessment' | 'active' | 'calibration' | 'renewal';

interface CareTask {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Consultation' | 'Allergy Review' | 'Diet Tuning' | 'Subscription';
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  event: string;
  type: 'stage_change' | 'allergy_clearance' | 'task_update' | 'chat_sent' | 'checkin' | 'profile_edit' | 'manual_add';
}

export default function CRMView({
  customers,
  handleAddCustomer,
  handleDeleteCustomer,
  handleUpdateCustomer,
  darkMode,
  inquiries = [],
  handleAddInquiry,
  handleUpdateInquiry,
  feedback = [],
  handleAddFeedback,
  currentUser = { id: 'HR-401', name: 'Sarah Jenkins', role: 'Ops Lead' },
  staffList = []
}: CRMViewProps) {
  // Navigation & Toggle between Pipeline Kanban Board vs Details table list
  const [viewMode, setViewMode] = useState<'grid' | 'analytics' | 'sheet'>('sheet');
  const [sheetSortField, setSheetSortField] = useState<'name' | 'weight' | 'kcal' | 'health' | 'stage' | 'category' | null>(null);
  const [sheetSortAsc, setSheetSortAsc] = useState<boolean>(true);
  
  // CRM Data Analytics Tab & Cohort Filter state management
  const [analyticsTab, setAnalyticsTab] = useState<'health' | 'diet' | 'revenue' | 'crm'>('health');
  const [analyticsCohortFilter, setAnalyticsCohortFilter] = useState<'All' | DietCategory>('All');

  // Selected Customer in deep workspace
  const [selectedCust, setSelectedCust] = useState<Customer | null>(customers[0] || null);
  const [crmSubTab, setCrmSubTab] = useState<'diet' | 'lifestyle' | 'package' | 'inquiries' | 'tasks'>('diet');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- Toast notifications state ---
  interface ToastItem {
    id: string;
    type: 'success' | 'error' | 'warning';
    message: string;
  }
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // --- Drawer states ---
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'profile' | 'health' | 'packages' | 'messages' | 'feedback'>('profile');
  const handleSelectCustomer = (cust: Customer) => {
    setSelectedCust(cust);
    setIsDrawerOpen(true);
  };

  // --- Enroll Client form states (FIX 5) ---
  const [enrollName, setEnrollName] = useState('');
  const [enrollPhone, setEnrollPhone] = useState('');
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrollGender, setEnrollGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [enrollSource, setEnrollSource] = useState<'Instagram' | 'Messenger' | 'Telegram' | 'Website'>('Instagram');
  const [enrollBranch, setEnrollBranch] = useState<'Central' | 'North' | 'South'>('Central');
  const [enrollMealPlan, setEnrollMealPlan] = useState<DietCategory>('Low-Carb');
  const [enrollSpecialRequests, setEnrollSpecialRequests] = useState('');

  // --- Assign New Package inline forms states ---
  const [isAssigningPackage, setIsAssigningPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState('Platinum VIP Daily Prep');
  const [newPkgLevel, setNewPkgLevel] = useState('Premium VIP');
  const [newPkgMonths, setNewPkgMonths] = useState(3);

  // --- Chat input state for drawer ---
  const [chatInput, setChatInput] = useState('');

  // --- Inline Feedback form states for drawer ---
  const [showAddDrawerFeedback, setShowAddDrawerFeedback] = useState(false);
  const [drawerFeedbackText, setDrawerFeedbackText] = useState('');
  const [drawerFeedbackType, setDrawerFeedbackType] = useState<'general' | 'inquiry' | 'recommendation'>('general');
  const [drawerFeedbackPin, setDrawerFeedbackPin] = useState(false);

  // High level filter to view Risk or Attention-required clients instantly in both modes
  const [healthFilter, setHealthFilter] = useState<'all' | 'risk' | 'attention' | 'optimal'>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form states for creating new customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCategory, setNewCustCategory] = useState<DietCategory>('Keto');
  const [newCustAllergies, setNewCustAllergies] = useState('');
  const [newCustKcal, setNewCustKcal] = useState(1800);
  const [newCustWeight, setNewCustWeight] = useState(75);
  const [newCustTargetWeight, setNewCustTargetWeight] = useState(70);

  // Daily weight check-in states
  const [checkinWeight, setCheckinWeight] = useState('');
  const [checkinCalories, setCheckinCalories] = useState('');
  const [checkinDate, setCheckinDate] = useState('');

  // Active Inquiry reply state
  const [activeReply, setActiveReply] = useState('');

  // Status message notice toast
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // --- CRM Workflows Integration States ---
  const [crmMode, setCrmMode] = useState<'customers' | 'inquiries'>('customers');
  const [selectedInq, setSelectedInq] = useState<CustomerInquiry | null>(null);
  
  // Modals state management
  const [isAddInquiryOpen, setIsAddInquiryOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isAddFeedbackOpen, setIsAddFeedbackOpen] = useState(false);
  const [diabetesAlertOpen, setDiabetesAlertOpen] = useState(false);
  const [inquiryToConvert, setInquiryToConvert] = useState<CustomerInquiry | null>(null);

  // New Inquiry Form states
  const [prospectName, setProspectName] = useState('');
  const [prospectContact, setProspectContact] = useState('');
  const [inqSource, setInqSource] = useState<'Website' | 'Messenger' | 'Telegram' | 'Instagram' | 'website' | 'messenger' | 'telegram' | 'instagram'>('website');
  const [assignedStaff, setAssignedStaff] = useState('Sarah Jenkins');

  // Convert Inquiry Form states
  const [convertCustCode, setConvertCustCode] = useState('');
  const [convertName, setConvertName] = useState('');
  const [convertGender, setConvertGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [convertPhone, setConvertPhone] = useState('');
  const [convertBranch, setConvertBranch] = useState<'Downtown' | 'West'>('Downtown');
  const [convertAllergyDetails, setConvertAllergyDetails] = useState('');

  // Lifestyle Form extensions
  const [footCondition, setFootCondition] = useState('');
  const [feelingWillingness, setFeelingWillingness] = useState('');

  // Physical Status extensions
  const [currentWeightVal, setCurrentWeightVal] = useState(75);
  const [pastWeight, setPastWeight] = useState(75);
  const [physicalHeight, setPhysicalHeight] = useState(170);
  const [physicalTimeFrame, setPhysicalTimeFrame] = useState(12);
  const [bmiVal, setBmiVal] = useState(0);

  // Unified Search and Custom Filters (Workflow 8)
  const [inquirySourceFilter, setInquirySourceFilter] = useState<string>('all');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('all');
  const [inquiryStaffFilter, setInquiryStaffFilter] = useState<string>('all');
  const [customerBranchFilter, setCustomerBranchFilter] = useState<string>('all');
  const [customerPackageStatusFilter, setCustomerPackageStatusFilter] = useState<string>('all');

  // Feedback Form states (Workflow 5)
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<'general' | 'inquiry' | 'recommendation'>('general');
  const [isPinpoint, setIsPinpoint] = useState(false);

  // --- Premium State 1: Lifecycle Workflow Stages ---
  const [stagesMap, setStagesMap] = useState<Record<string, WorkflowStage>>(() => {
    const saved = localStorage.getItem('crm_workflow_stages_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Intuitive base staging mapping for initial customers
    return {
      'CUST-101': 'assessment',  // Eleanor (has allergies, needs reviewing)
      'CUST-102': 'assessment',  // Marcus (has shellfish allergy)
      'CUST-103': 'active',      // Sienna (vegan subscriber, tracking active status)
      'CUST-104': 'calibration', // Julian (target wt is far from current, weight curve stagnant)
      'CUST-105': 'renewal'      // Clara (paleo plan subscriber, approaching expiry)
    };
  });

  // --- Premium State 2: Allergy Verification clearance status ---
  const [allergyClearedMap, setAllergyClearedMap] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('crm_allergy_clearance_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      'CUST-101': false,
      'CUST-102': false,
      'CUST-103': true,
      'CUST-104': true,
      'CUST-105': true
    };
  });

  // --- Premium State 3: Interactive Interaction Audit Logs ---
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('crm_clinical_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'L-1', timestamp: '2026-05-26 11:24', customerId: 'CUST-101', customerName: 'Eleanor Sterling', event: 'Transferred lead request to Nutritional Assessment stage', type: 'stage_change' },
      { id: 'L-2', timestamp: '2026-05-26 15:40', customerId: 'CUST-103', customerName: 'Sienna Alva', event: 'Cleared Gluten allergen hazard protocol for kitchen delivery', type: 'allergy_clearance' },
      { id: 'L-3', timestamp: '2026-05-27 00:15', customerId: 'CUST-104', customerName: 'Julian Thorne', event: 'Flagged for metabolic tuning: 92.3kg weight stalemate', type: 'stage_change' }
    ];
  });

  // --- Premium State 4: Automation Rules Suite Configuration ---
  const [automationRules, setAutomationRules] = useState({
    autoTriageAllergy: true, // Automatically route new customer with allergy to Assessment lane
    criticalLogOncheckin: true, // Trigger audit alert if calorie excess logs (>200kcal difference over budget)
    autoGenerateOnboardingTasks: true // Inject task templates upon stage entries
  });

  // --- Premium State 5: Local Care Action Items (Task list) ---
  const [tasksMap, setTasksMap] = useState<Record<string, CareTask[]>>(() => {
    const saved = localStorage.getItem('care_tasks_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      'CUST-101': [
        { id: 'T-1', title: 'Verify core fats & carbohydrate percentages for active plan', status: 'completed', dueDate: 'May 28', priority: 'High', category: 'Diet Tuning' },
        { id: 'T-2', title: 'Kitchen pre-check: verify peanut zero cross-contact storage', status: 'pending', dueDate: 'May 29', priority: 'High', category: 'Allergy Review' },
        { id: 'T-3', title: 'Conduct weekly intake interview with Sarah via chat', status: 'pending', dueDate: 'Jun 05', priority: 'Medium', category: 'Consultation' }
      ],
      'CUST-102': [
        { id: 'T-4', title: 'Confirm shellfish-alternative protein supply safety', status: 'pending', dueDate: 'May 30', priority: 'High', category: 'Allergy Review' },
        { id: 'T-5', title: 'Schedule premium orientation check-in Zoom call', status: 'pending', dueDate: 'Jun 02', priority: 'Medium', category: 'Consultation' }
      ],
      'CUST-103': [
        { id: 'T-6', title: 'Verify soy & gluten-free vegan options are tracked in customizer', status: 'completed', dueDate: 'May 26', priority: 'Medium', category: 'Allergy Review' }
      ],
      'CUST-104': [
        { id: 'T-7', title: 'Macro composition audit: optimize plateaus on low-carb index', status: 'pending', dueDate: 'May 28', priority: 'High', category: 'Diet Tuning' }
      ],
      'CUST-105': [
        { id: 'T-8', title: 'Formulate 30-day Paleo Renewal coupon deal', status: 'pending', dueDate: 'May 31', priority: 'High', category: 'Subscription' }
      ]
    };
  });

  // Task form inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Consultation' | 'Allergy Review' | 'Diet Tuning' | 'Subscription'>('Diet Tuning');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Form states for updating Lifestyle, Physical, and Health profiles
  const [foodRestrictions, setFoodRestrictions] = useState('');
  const [activityLevel, setActivityLevel] = useState<'Sedentary' | 'Moderate' | 'Active' | 'Highly Active'>('Moderate');
  const [fastingWillingness, setFastingWillingness] = useState<'None' | '16:8 Fasting' | '20:4 Fasting' | 'Alternate Day'>('None');
  const [heightCm, setHeightCm] = useState(170);
  const [timeFrameWeeks, setTimeFrameWeeks] = useState(12);
  const [medicalCondition, setMedicalCondition] = useState('');
  const [otherCondition, setOtherCondition] = useState('');
  const [medicineTaking, setMedicineTaking] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [packageName, setPackageName] = useState('');
  const [accountLevel, setAccountLevel] = useState<'Basic' | 'Standard' | 'Premium VIP' | 'Elite Platinum'>('Standard');
  const [durationMonths, setDurationMonths] = useState(3);
  const [expiresDate, setExpiresDate] = useState('');

  // AI-driven clinical advisor and risk evaluation states
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiMealSuggestion, setAiMealSuggestion] = useState<string>('');
  const [aiMealRecommendations, setAiMealRecommendations] = useState<Array<{ category: string, reason: string }>>([]);
  const [aiChurnScore, setAiChurnScore] = useState<number | null>(null);
  const [aiChurnAction, setAiChurnAction] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Fetch AI Clinical Insights from real server API endpoints
  useEffect(() => {
    if (!selectedCust) return;

    const fetchAiInsights = async () => {
      setIsAiLoading(true);
      
      // Compute BMI on the fly
      const wt = selectedCust.currentWeight || 75;
      const ht = selectedCust.physicalStatus?.heightCm || selectedCust.physicalStatus?.height || 170;
      const calcBmi = (wt / Math.pow(ht / 100, 2)).toFixed(1);

      try {
        // 1. Fetch Health Summary & Suggestion (AI-1)
        const summaryRes = await fetch('/api/ai/health-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: selectedCust.name,
            weight: wt,
            height: ht,
            bmi: calcBmi,
            medical_condition: selectedCust.healthProfile?.medicalCondition || 'None',
            medicine_taking: selectedCust.healthProfile?.medicineTaking || 'None',
            goal: selectedCust.lifestyle?.fastingWillingness || 'Active Weight Control',
            activity_level: selectedCust.lifestyle?.activityLevel || 'Moderate',
            foot_condition: selectedCust.lifestyle?.foot_condition || 'Normal'
          })
        });
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setAiSummary(data.summary || '');
          setAiMealSuggestion(data.suggestion || '');
        }

        // 2. Fetch Meal Recommendations & Upgrades (AI-2, AI-3)
        const recommRes = await fetch('/api/ai/meal-recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bmi: calcBmi,
            medical_condition: selectedCust.healthProfile?.medicalCondition || 'None',
            activity_level: selectedCust.lifestyle?.activityLevel || 'Moderate',
            allergies: selectedCust.allergies.join(', ') || 'None',
            special_requests: selectedCust.healthProfile?.specialRequests || 'None'
          })
        });
        if (recommRes.ok) {
          const data = await recommRes.json();
          setAiMealRecommendations(Array.isArray(data) ? data : []);
        }

        // 3. Fetch Churn risk evaluation (AI-4)
        const isExpiring = selectedCust.subscriptionPackage?.expiresDate?.includes('2026-06') || false;
        const noResponseCount = selectedCust.inquiriesList?.some(inq => inq.messages?.slice(-1)[0]?.sender === 'staff') ? 1 : 0;
        const negativeFeedbackCount = (selectedCust.id === 'CUST-104') ? 1 : 0;

        const churnRes = await fetch('/api/ai/churn-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            daysSinceLastOrder: (selectedCust.status === 'Calibration Stall' || selectedCust.id === 'CUST-104') ? 15 : 1,
            isExpiring: isExpiring,
            noResponseCount: noResponseCount,
            negativeFeedbackCount: negativeFeedbackCount
          })
        });
        if (churnRes.ok) {
          const data = await churnRes.json();
          setAiChurnScore(typeof data.score === 'number' ? data.score : 20);
          setAiChurnAction(data.action || 'Optimal Care Plan active');
        }

      } catch (err) {
        console.error('Error fetching AI insights:', err);
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchAiInsights();
  }, [selectedCust]);

  // Update localStorage when maps or log records change
  useEffect(() => {
    localStorage.setItem('crm_workflow_stages_map', JSON.stringify(stagesMap));
  }, [stagesMap]);

  useEffect(() => {
    localStorage.setItem('crm_allergy_clearance_map', JSON.stringify(allergyClearedMap));
  }, [allergyClearedMap]);

  useEffect(() => {
    localStorage.setItem('crm_clinical_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('care_tasks_map', JSON.stringify(tasksMap));
  }, [tasksMap]);

  // Set default selected patient if none chosen
  useEffect(() => {
    if (customers.length > 0 && !selectedCust) {
      setSelectedCust(customers[0]);
    }
  }, [customers, selectedCust]);

  // Sync selected patient values with active input controls
  useEffect(() => {
    if (selectedCust) {
      setFoodRestrictions(selectedCust.lifestyle?.foodRestrictions || '');
      setActivityLevel(selectedCust.lifestyle?.activityLevel || 'Moderate');
      setFastingWillingness(selectedCust.lifestyle?.fastingWillingness || 'None');
      setHeightCm(selectedCust.physicalStatus?.heightCm || 172);
      setTimeFrameWeeks(selectedCust.physicalStatus?.timeFrameWeeks || 12);
      setMedicalCondition(selectedCust.healthProfile?.medicalCondition || '');
      setOtherCondition(selectedCust.healthProfile?.otherCondition || '');
      setMedicineTaking(selectedCust.healthProfile?.medicineTaking || '');
      setSpecialRequests(selectedCust.healthProfile?.specialRequests || '');
      setPackageName(selectedCust.subscriptionPackage?.packageName || '');
      setAccountLevel(selectedCust.subscriptionPackage?.accountLevel || 'Standard');
      setDurationMonths(selectedCust.subscriptionPackage?.durationMonths || 3);
      setExpiresDate(selectedCust.subscriptionPackage?.expiresDate || '');
      
      // Extended fields
      setFootCondition(selectedCust.lifestyle?.foot_condition || '');
      setFeelingWillingness(selectedCust.lifestyle?.feeling_willingness || '');
      setCurrentWeightVal(selectedCust.physicalStatus?.current_weight || selectedCust.currentWeight || 75);
      setPastWeight(selectedCust.physicalStatus?.past_weight || selectedCust.physicalStatus?.current_weight || selectedCust.currentWeight || 75);
      setPhysicalHeight(selectedCust.physicalStatus?.height || selectedCust.physicalStatus?.heightCm || 170);
      setPhysicalTimeFrame(selectedCust.physicalStatus?.time_frame || selectedCust.physicalStatus?.timeFrameWeeks || 12);
      setBmiVal(selectedCust.physicalStatus?.bmi || 0);
    }
  }, [selectedCust]);

  // Set default selected inquiry if none chosen
  useEffect(() => {
    if (inquiries.length > 0 && !selectedInq) {
      setSelectedInq(inquiries[0]);
    }
  }, [inquiries, selectedInq]);

  // Check clicking of "Expiring Packages" widget on load/tab switch
  useEffect(() => {
    const initFilter = localStorage.getItem('crm_initial_filter');
    if (initFilter === 'expiring') {
      setCustomerPackageStatusFilter('expiring_soon');
      setViewMode('grid'); // show dossiers grid
      setCrmMode('customers'); // show customers tab
      localStorage.removeItem('crm_initial_filter');
    }
  }, []);

  // Logging utility for clinical transparency
  const addAuditLog = (
    customerId: string, 
    customerName: string, 
    event: string, 
    type: AuditLogEntry['type']
  ) => {
    const newEntry: AuditLogEntry = {
      id: `L-${Math.floor(Math.random() * 100000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerId,
      customerName,
      event,
      type
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Switch customer workflow stage directly from Kanban Board or Select elements
  const moveCustomerStage = (customerId: string, targetStage: WorkflowStage) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    const oldStage = stagesMap[customerId] || 'intake';
    setStagesMap(prev => ({
      ...prev,
      [customerId]: targetStage
    }));

    // Audit Log Entry
    const labelMap: Record<WorkflowStage, string> = {
      intake: 'Intake & Discovery',
      assessment: 'Nutritional Assessment',
      active: 'Active Meal Prep',
      calibration: 'Caloric Calibration',
      renewal: 'Renewal & VIP Care'
    };
    addAuditLog(customerId, cust.name, `Moved subscriber stage from [${labelMap[oldStage]}] to [${labelMap[targetStage]}]`, 'stage_change');

    // Automation rule: Inject standard tasks on entering certain stages
    if (automationRules.autoGenerateOnboardingTasks) {
      const currentTasks = tasksMap[customerId] || [];
      if (targetStage === 'assessment' && !currentTasks.some(t => t.title.includes('Verify allergen profile'))) {
        const onboardingTasks: CareTask[] = [
          { id: `T-AUTO-${Math.random()}`, title: 'Verify allergen profile & clearance', status: 'pending', dueDate: 'Immediate', priority: 'High', category: 'Allergy Review' },
          { id: `T-AUTO-${Math.random()}`, title: 'Inspect custom macro restrictions', status: 'pending', dueDate: 'In 2 days', priority: 'Medium', category: 'Diet Tuning' }
        ];
        setTasksMap(prev => ({ ...prev, [customerId]: [...currentTasks, ...onboardingTasks] }));
      } else if (targetStage === 'calibration' && !currentTasks.some(t => t.title.includes('Calorie plateau analysis'))) {
        const tuningTasks: CareTask[] = [
          { id: `T-AUTO-${Math.random()}`, title: 'Calorie plateau analysis; adjust targets', status: 'pending', dueDate: 'Immediate', priority: 'High', category: 'Diet Tuning' }
        ];
        setTasksMap(prev => ({ ...prev, [customerId]: [...currentTasks, ...tuningTasks] }));
      }
    }

    setSaveSuccessMsg(`Moved ${cust.name} to the ${labelMap[targetStage]} pipeline workflow stage.`);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  // Sign and approve allergens safety clearance
  const clearAllergenSafety = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    setAllergyClearedMap(prev => ({
      ...prev,
      [customerId]: true
    }));

    addAuditLog(customerId, cust.name, `Cleared allergen hazard cleared. Kitchen tags generated safe.`, 'allergy_clearance');

    setSaveSuccessMsg(`Allergen Security Pass authorized for ${cust.name}! Notification sent to Kitchen Staff.`);
    setTimeout(() => setSaveSuccessMsg(''), 4550);
  };

  // Dynamic Metrics Bar Calculations
  const totalSubscribersCount = customers.length;
  const activeDeliveryPlanCount = customers.filter(c => c.status === 'Active Plan').length;
  
  // Calculate average health rating
  const calculateCustomerHealth = (c: Customer) => {
    let score = 85; 

    // Adjust for allergen clearance state
    const isCleared = allergyClearedMap[c.id];
    if (c.allergies && c.allergies.length > 0 && !isCleared) {
      score -= 25; // Massive penalty for unsafe allergy profiles
    }

    // Adjust for weight progress stagnation diagnostics
    if (c.weightTrend && c.weightTrend.length >= 4) {
      const lastIdx = c.weightTrend.length - 1;
      const progressDelta = Math.abs(c.currentWeight - c.targetWeight);
      const startingDelta = Math.abs(c.weightTrend[0].weight - c.targetWeight);
      
      // If weight has hardly moved in 4 steps but far from target
      if (startingDelta > 1 && Math.abs(c.weightTrend[0].weight - c.currentWeight) < 0.2) {
        score -= 15; // Calibration required
      }
    }

    if (c.lifestyle?.activityLevel === 'Sedentary' && c.targetKcal > 2000) {
      score -= 10;
    }

    if (c.status === 'Pending Renewal') {
      score -= 20;
    }

    score = Math.max(15, Math.min(100, score));

    let advisory = 'AOK: Consistent Progress';
    let labelColor = 'bg-emerald-500/10 text-emerald-450 border-emerald-500/10';
    let textTheme = 'text-emerald-500';
    let statusBg = 'bg-emerald-500';

    if (score < 50) {
      advisory = 'CRITICAL ALERT 🛑';
      labelColor = 'bg-rose-500/10 text-rose-450 border-rose-500/20';
      textTheme = 'text-rose-500';
      statusBg = 'bg-rose-500';
    } else if (score < 75) {
      advisory = 'Caloric Drift / Stall';
      labelColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      textTheme = 'text-amber-500';
      statusBg = 'bg-amber-500';
    }

    return { score, advisory, labelColor, textTheme, statusBg };
  };

  const globalCohortHealthIndex = Math.round(
    customers.reduce((acc, c) => acc + calculateCustomerHealth(c).score, 0) / (customers.length || 1)
  );

  // Get weight progress descriptive label
  const getWeightLossProgress = (c: Customer) => {
    const diff = Math.abs(c.currentWeight - c.targetWeight);
    const origin = c.weightTrend[0]?.weight || c.currentWeight;
    const initialDiff = Math.abs(origin - c.targetWeight);
    if (initialDiff === 0) return 'Stable weight maintenance';
    const percent = Math.min(100, Math.max(0, Math.round(((initialDiff - diff) / initialDiff) * 100)));
    return `${percent}% alignment with target`;
  };

  // Submit and create new subscriber dossier
  const handleAddNewCustomerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim() || !enrollPhone.trim()) {
      showToast("✗ Full Name and Phone are required!", "error");
      return;
    }

    // Auto-generate sequential customer code
    const nextNum = Math.max(...customers.map(c => {
      const match = c.id.match(/\d+/);
      return match ? parseInt(match[0]) : 105;
    })) + 1;
    const cleanId = `CUST-${nextNum}`;

    const dateFormatted = new Date().toISOString().split('T')[0];

    const createdCust: Partial<Customer> = {
      id: cleanId,
      customer_code: cleanId,
      name: enrollName.trim(),
      email: enrollEmail.trim() || `${enrollName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      phone: enrollPhone.trim(),
      category: enrollMealPlan,
      gender: enrollGender,
      branch: enrollBranch,
      status: 'Active Plan',
      joinedDate: dateFormatted,
      currentWeight: 75,
      targetWeight: 70,
      targetKcal: 1800,
      allergies: enrollSpecialRequests.trim() ? enrollSpecialRequests.split(',').map(s => s.trim()).filter(Boolean) : [],
      weightTrend: [
        { date: dateFormatted, weight: 75, kcalConsumed: 1800 }
      ],
      lifestyle: {
        foodRestrictions: enrollSpecialRequests.trim(),
        activityLevel: 'Moderate',
        fastingWillingness: 'None',
        activity_level: 'Moderate',
        foot_condition: 'Normal',
        feeling_willingness: 'None'
      },
      physicalStatus: {
        heightCm: 170,
        timeFrameWeeks: 12,
        current_weight: 75,
        past_weight: 75,
        height: 170,
        time_frame: 12,
        bmi: 26
      },
      healthProfile: {
        medicalCondition: 'None',
        otherCondition: '',
        medicineTaking: 'None',
        specialRequests: enrollSpecialRequests.trim(),
        medicine_taking: 'None',
        medical_condition: 'None',
        other_condition: '',
        special_requests: enrollSpecialRequests.trim()
      },
      subscriptionPackage: {
        packageName: `${enrollMealPlan} Tier Plan`,
        accountLevel: 'Standard',
        durationMonths: 1,
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active'
      },
      inquiriesList: [
        {
          id: `INQ-${Math.floor(100+Math.random()*900)}`,
          source: enrollSource.toLowerCase() as any,
          status: 'new' as any,
          timestamp: new Date().toISOString(),
          messages: []
        }
      ]
    };

    // Add customer to master list
    handleAddCustomer(createdCust);

    // Seed stages & allergen statuses mapping (Intake & Chat Leads is 'intake')
    setStagesMap(prev => ({ ...prev, [cleanId]: 'intake' }));
    setAllergyClearedMap(prev => ({ ...prev, [cleanId]: !enrollSpecialRequests.trim() }));
    
    // Seed action tasks for subscriber
    const listSeed: CareTask[] = [
      { id: `T-SE-${Math.floor(Math.random()*900)}`, title: 'Verify onboarding dietary data', status: 'pending', dueDate: 'Immediate', priority: 'High', category: 'Consultation' }
    ];
    setTasksMap(prev => ({ ...prev, [cleanId]: listSeed }));

    addAuditLog(cleanId, enrollName.trim(), `Enrolled client manually with code ${cleanId}.`, 'manual_add');

    // Reset controls & close modal
    setEnrollName('');
    setEnrollPhone('');
    setEnrollEmail('');
    setEnrollGender('Male');
    setEnrollSource('Instagram');
    setEnrollBranch('Central');
    setEnrollMealPlan('Low-Carb');
    setEnrollSpecialRequests('');
    setIsAddUserOpen(false);

    showToast("✓ Client enrolled successfully", "success");
  };

  // Submit logged check-ins directly into clinical subscriber state
  const handleAddNewCheckinLog = () => {
    if (!selectedCust || !checkinWeight || !checkinCalories) return;

    const wt = Number(checkinWeight);
    const cal = Number(checkinCalories);
    const loggedDateStr = checkinDate || `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const updatedTrend = [
      ...selectedCust.weightTrend,
      { date: loggedDateStr, weight: wt, kcalConsumed: cal }
    ];

    const updatedCust: Customer = {
      ...selectedCust,
      currentWeight: wt,
      weightTrend: updatedTrend
    };

    if (handleUpdateCustomer) {
      handleUpdateCustomer(updatedCust);
      setSelectedCust(updatedCust);
    }

    // Trigger rule alert audits if excessive caloric intake detected
    if (automationRules.criticalLogOncheckin && cal > selectedCust.targetKcal + 200) {
      addAuditLog(selectedCust.id, selectedCust.name, `WARNING: Check-in registered critical calorie overshoot (+${cal - selectedCust.targetKcal} kcal excess over safe limits)`, 'checkin');
    } else {
      addAuditLog(selectedCust.id, selectedCust.name, `Registered new clinical weight check-in (${wt}kg, ${cal}kcal)`, 'checkin');
    }

    // Reset controls
    setCheckinWeight('');
    setCheckinCalories('');
    setCheckinDate('');

    setSaveSuccessMsg(`Somatic check-in logged for ${selectedCust.name}! Progress sparkline updated.`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Convert Inquiry Form specific states
  const [convertFacebook, setConvertFacebook] = useState('');
  const [convertCategory, setConvertCategory] = useState<DietCategory>('Keto');
  const [convertTargetKcal, setConvertTargetKcal] = useState(1800);
  const [convertCurrentWeight, setConvertCurrentWeight] = useState(75);
  const [convertTargetWeight, setConvertTargetWeight] = useState(70);
  const [convertPackageName, setConvertPackageName] = useState('Inquiry Conversion Deal');
  const [convertAccountLevel, setConvertAccountLevel] = useState<'Basic' | 'Standard' | 'Premium VIP' | 'Elite Platinum'>('Standard');
  const [convertDurationMonths, setConvertDurationMonths] = useState(3);

  // --- WORKFLOW 1: INQUIRY INTAKE SUBMIT ---
  const handleCreateInquirySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim() || !prospectContact.trim()) {
      alert("Validation Error: Prospect Name and Contact details are required.");
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newInquiryPayload: Partial<CustomerInquiry> = {
      prospect_name: prospectName.trim(),
      prospect_contact: prospectContact.trim(),
      source: inqSource.toLowerCase() as any,
      assigned_to: assignedStaff,
      status: 'new',
      created_at: nowStr.split(' ')[0],
      updated_at: nowStr.split(' ')[0],
      messages: [],
      statusChangeLog: [{ status: 'new', timestamp: nowStr }]
    };

    if (handleAddInquiry) {
      const createdInq = handleAddInquiry(newInquiryPayload);
      setSelectedInq(createdInq);
    } else {
      alert("Error: handleAddInquiry is not connected.");
      return;
    }

    // Reset Form fields
    setProspectName('');
    setProspectContact('');
    setInqSource('website');
    setIsAddInquiryOpen(false);

    setSaveSuccessMsg(`New inquiry intake logged for ${prospectName}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // --- WORKFLOW 1: INQUIRY STATUS CHANGE WITH STRICT RULES ---
  const handleChangeInquiryStatus = (inquiryId: string, newStatus: string) => {
    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return;

    const currentStatus = inq.status;

    // RULE 1: Cannot skip from "new" directly to "converted"
    if (currentStatus === 'new' && newStatus === 'converted') {
      alert("Validation Error: Cannot skip from 'new' directly to 'converted'. You must contact the prospect first.");
      return;
    }
    // RULE 2: "closed" is a dead end — cannot reopen
    if (currentStatus === 'closed') {
      alert("Validation Error: This Inquiry is officially closed and cannot be reopened.");
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedLog = [...(inq.statusChangeLog || []), { status: newStatus, timestamp: nowStr }];

    const updatedInq: CustomerInquiry = {
      ...inq,
      status: newStatus as any,
      statusChangeLog: updatedLog,
      updated_at: nowStr.split(' ')[0]
    };

    handleUpdateInquiry?.(updatedInq);
    if (selectedInq?.id === inquiryId) {
      setSelectedInq(updatedInq);
    }
    
    setSaveSuccessMsg(`Status transitioned successfully to ${newStatus}`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // --- WORKFLOW 2: INQUIRY MESSAGING WITH SPECIAL RULE ---
  const handleSendInquiryMessage = (inquiryId: string, text: string) => {
    if (!text.trim()) {
      alert("Validation Error: Cannot send blank messages.");
      return;
    }

    const inq = inquiries.find(i => i.id === inquiryId);
    if (!inq) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const newMessage = {
      sender: 'staff' as const,
      sender_type: 'staff' as const,
      text: text,
      message_text: text,
      timestamp: nowStr,
      inquiry_id: inquiryId,
      platform_message_id: `MSG-${Math.floor(10000 + Math.random() * 90000)}`
    };

    // RULE: New message triggers status update to 'contacted' automatically (unless is interested/converted/closed)
    let nextStatus = inq.status;
    let statusLog = inq.statusChangeLog || [];
    if (inq.status === 'new') {
      nextStatus = 'contacted';
      statusLog = [...statusLog, { status: 'contacted', timestamp: nowStr }];
    }

    const updatedInq: CustomerInquiry = {
      ...inq,
      status: nextStatus as any,
      statusChangeLog: statusLog,
      messages: [...inq.messages, newMessage],
      updated_at: nowStr.split(' ')[0]
    };

    handleUpdateInquiry?.(updatedInq);
    if (selectedInq?.id === inquiryId) {
      setSelectedInq(updatedInq);
    }
    setActiveReply('');
  };

  // --- WORKFLOW 3: CONVERT PROSPECT TO CUSTOMER HANDLER ---
  const handleOpenConvertInquiry = (inq: CustomerInquiry) => {
    // Check if contacted or interested
    const stat = inq.status.toLowerCase();
    if (stat === 'new') {
      alert("Validation Error: Cannot convert a 'new' prospect. Contact the prospect first.");
      return;
    }
    if (stat === 'converted') {
      alert("Validation Error: This prospect is already converted.");
      return;
    }
    if (stat === 'closed') {
      alert("Validation Error: Closed trials are not available for conversion.");
      return;
    }

    const yr = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    
    setInquiryToConvert(inq);
    setConvertCustCode(`CRM-${yr}-${rand}`);
    setConvertName(inq.prospect_name || '');
    setConvertGender('Female');
    setConvertPhone(inq.prospect_contact || '');
    setConvertBranch('Downtown');
    setConvertAllergyDetails('');
    setIsConvertModalOpen(true);
  };

  const handleConvertProspectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inquiryToConvert) return;

    if (!convertName || !convertGender || !convertPhone || !convertBranch) {
      alert("Validation Error: Name, Gender, Phone, and Branch are required to register a patient.");
      return;
    }

    // Prepare Customer object
    const nowStr = new Date().toISOString().split('T')[0];
    const newCustPayload: Partial<Customer> = {
      name: convertName.trim(),
      customer_code: convertCustCode,
      facebook_name: convertFacebook || '',
      gender: convertGender,
      phone: convertPhone.trim(),
      email: `${convertName.trim().toLowerCase().replace(/\s+/g, '')}@example-crm.com`,
      branch: convertBranch,
      category: 'Keto', // default category
      allergies: convertAllergyDetails ? [convertAllergyDetails] : [],
      targetKcal: 1800,
      currentWeight: 75,
      targetWeight: 70,
      status: 'Active Plan',
      joinedDate: nowStr,
      weightTrend: [],
      inquiry_id: inquiryToConvert.id,
      inquiriesList: [
        {
          ...inquiryToConvert,
          status: 'converted'
        }
      ],
      lifestyle: {
        foodRestrictions: convertAllergyDetails || '',
        activityLevel: 'Moderate',
        fastingWillingness: 'None',
        foot_condition: '',
        activity_level: 'Moderate',
        feeling_willingness: ''
      },
      physicalStatus: {
        heightCm: 170,
        timeFrameWeeks: 12,
        current_weight: 75,
        past_weight: 75,
        height: 170,
        time_frame: 12,
        bmi: 26
      },
      healthProfile: {
        medicalCondition: '',
        otherCondition: '',
        medicineTaking: '',
        specialRequests: '',
        medicine_taking: '',
        medical_condition: '',
        other_condition: '',
        special_requests: ''
      },
      subscriptionPackage: {
        packageName: 'Trial Care Package',
        accountLevel: 'Basic',
        durationMonths: 1,
        expiresDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        package_level: 'Basic',
        duration: 1,
        status: 'active'
      }
    };

    // Generate Customer
    const createdCust = handleAddCustomer(newCustPayload);

    // Update Inquiry to converted status
    const dt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedInq: CustomerInquiry = {
      ...inquiryToConvert,
      status: 'converted',
      customer_id: createdCust.id,
      statusChangeLog: [...(inquiryToConvert.statusChangeLog || []), { status: 'converted', timestamp: dt }],
      updated_at: dt.split(' ')[0]
    };
    handleUpdateInquiry?.(updatedInq);

    // Sync state map and audits
    setStagesMap(prev => ({ ...prev, [createdCust.id]: 'assessment' }));
    setAllergyClearedMap(prev => ({ ...prev, [createdCust.id]: !convertAllergyDetails }));
    addAuditLog(createdCust.id, createdCust.name, `Converted from prospect inquiry ${inquiryToConvert.id} [Code: ${convertCustCode}, Branch: ${convertBranch}]`, 'manual_add');

    // Feed seed task
    const listSeed: CareTask[] = [
      { id: `T-SE-${Math.floor(Math.random()*900)}`, title: 'Verify severe allergy profiles and set custom target calories', status: 'pending', dueDate: 'Immediate', priority: 'High', category: 'Allergy Review' }
    ];
    setTasksMap(prev => ({ ...prev, [createdCust.id]: listSeed }));

    // Reset controls & close modal
    setIsConvertModalOpen(false);
    setInquiryToConvert(null);
    setSelectedCust(createdCust);
    setCrmMode('customers');
    setViewMode('grid'); // show dossiers grid
    setCrmSubTab('diet');

    setSaveSuccessMsg(`Prospect successfully converted! Patient registered with Customer Code ${convertCustCode}`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // --- WORKFLOW 4: INDEPENDENT PROFILE SECTION SAVERS ---
  const handleSaveLifestyle = () => {
    if (!selectedCust || !handleUpdateCustomer) return;

    const updatedCust: Customer = {
      ...selectedCust,
      lifestyle: {
        foodRestrictions: foodRestrictions || '',
        activityLevel,
        fastingWillingness,
        foot_condition: footCondition,
        activity_level: activityLevel,
        feeling_willingness: feelingWillingness
      }
    };

    handleUpdateCustomer(updatedCust);
    setSelectedCust(updatedCust);

    addAuditLog(selectedCust.id, selectedCust.name, `Saved Lifestyle & Pathologies [Foot status: ${footCondition || 'Normal'}]`, 'profile_edit');
    setSaveSuccessMsg(`Lifestyle & pathologies details saved for ${selectedCust.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSavePhysicalStatus = () => {
    if (!selectedCust || !handleUpdateCustomer) return;
    if (physicalHeight <= 0 || currentWeightVal <= 0) {
      alert("Validation Error: Height and Weight values are required.");
      return;
    }

    // Auto-calculate BMI on save: weight / (height/100)^2
    const hm = physicalHeight / 100;
    const computedBmi = Math.round((currentWeightVal / (hm * hm)) * 10) / 10;
    setBmiVal(computedBmi);

    const updatedCust: Customer = {
      ...selectedCust,
      currentWeight: currentWeightVal,
      physicalStatus: {
        heightCm: physicalHeight,
        timeFrameWeeks: physicalTimeFrame,
        current_weight: currentWeightVal,
        past_weight: pastWeight,
        height: physicalHeight,
        time_frame: physicalTimeFrame,
        bmi: computedBmi
      }
    };

    handleUpdateCustomer(updatedCust);
    setSelectedCust(updatedCust);

    addAuditLog(selectedCust.id, selectedCust.name, `Saved Physical Status (BMI auto-calculated to ${computedBmi})`, 'profile_edit');
    setSaveSuccessMsg(`Physical details saved! Calculated BMI is ${computedBmi}`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleSaveHealthProfile = () => {
    if (!selectedCust || !handleUpdateCustomer) return;

    const updatedCust: Customer = {
      ...selectedCust,
      healthProfile: {
        medicalCondition,
        otherCondition,
        medicineTaking,
        specialRequests,
        medicine_taking: medicineTaking,
        medical_condition: medicalCondition,
        other_condition: otherCondition,
        special_requests: specialRequests
      }
    };

    handleUpdateCustomer(updatedCust);
    setSelectedCust(updatedCust);

    addAuditLog(selectedCust.id, selectedCust.name, `Saved Clinical Health Profile Details`, 'profile_edit');

    // Rule warning: if medicine_taking contains diabetes, pop up diabetes caution modal
    if (medicineTaking && medicineTaking.toLowerCase().includes('diabetes')) {
      setDiabetesAlertOpen(true);
    } else {
      setSaveSuccessMsg(`Health details saved for ${selectedCust.name}!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    }
  };

  // Keep old bulk save connected as a proxy
  const handleSaveSubSectionsWorkspace = () => {
    handleSaveLifestyle();
    handleSavePhysicalStatus();
    handleSaveHealthProfile();
  };

  // --- WORKFLOW 5: FEEDBACK COLLECTION SUBMIT ---
  const handleCreateFeedbackSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCust) {
      alert("Validation Error: Choose a customer to log feedback against.");
      return;
    }
    if (!feedbackText.trim()) {
      alert("Validation Error: Feedback comments cannot be empty.");
      return;
    }

    const nowStr = new Date().toISOString();
    const newFeedbackPayload: Partial<CRMFeedback> = {
      customer_id: selectedCust.id,
      customer_name: selectedCust.name,
      feedback_type: feedbackType,
      feedback_text: feedbackText.trim(),
      is_pinpoint: isPinpoint,
      staff_name: currentUser?.name || 'Care Advisor',
      timestamp: nowStr
    };

    if (handleAddFeedback) {
      handleAddFeedback(newFeedbackPayload);
    } else {
      alert("Error: handleAddFeedback is not connected.");
      return;
    }

    // Add search audit log trace
    addAuditLog(selectedCust.id, selectedCust.name, `Logged new feedback review [Pinned: ${isPinpoint ? 'Yes' : 'No'}]`, 'profile_edit');

    // Reset controls
    setFeedbackText('');
    setFeedbackType('general');
    setIsPinpoint(false);
    setIsAddFeedbackOpen(false);

    setSaveSuccessMsg(`Feedback logged successfully for ${selectedCust.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  // Dispatch live responses back to inquiry chat logs
  const handleSendChatResponse = () => {
    if (!selectedCust || !activeReply.trim() || !handleUpdateCustomer) return;

    const stamp = new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    const originalList = selectedCust.inquiriesList || [];

    let updatedList: CustomerInquiry[] = [];

    if (originalList.length === 0) {
      updatedList = [{
        id: `INQ-${Math.floor(100+Math.random()*900)}`,
        source: 'Website',
        status: 'In Progress',
        serviceInterest: `${selectedCust.category} Specialty Plan Option`,
        timestamp: stamp,
        messages: [{
          sender: 'staff',
          text: activeReply,
          timestamp: stamp
        }]
      }];
    } else {
      const parentIdx = originalList.length - 1;
      const originalInquiry = originalList[parentIdx];
      
      const newInquiry = {
        ...originalInquiry,
        status: 'In Progress' as const,
        messages: [
          ...originalInquiry.messages,
          {
            sender: 'staff' as const,
            text: activeReply,
            timestamp: stamp
          }
        ]
      };
      updatedList = [...originalList];
      updatedList[parentIdx] = newInquiry;
    }

    const updatedCust: Customer = {
      ...selectedCust,
      inquiriesList: updatedList
    };

    handleUpdateCustomer(updatedCust);
    setSelectedCust(updatedCust);

    // Post to Audit Log
    addAuditLog(selectedCust.id, selectedCust.name, `Sent personalized chat advice: "${activeReply.substring(0, 40)}..."`, 'chat_sent');
    
    // Auto-complete any Pending Consultation action items
    const tasksOfCust = tasksMap[selectedCust.id] || [];
    const consultIdx = tasksOfCust.findIndex(t => t.category === 'Consultation' && t.status === 'pending');
    if (consultIdx !== -1) {
      const replacement = [...tasksOfCust];
      replacement[consultIdx] = {
        ...replacement[consultIdx],
        status: 'completed'
      };
      setTasksMap(prev => ({ ...prev, [selectedCust.id]: replacement }));
    }

    setActiveReply('');
    setSaveSuccessMsg(`Success! Replied to ${selectedCust.name.split(' ')[0]}. Automated triggers resolved corresponding review tasks.`);
    setTimeout(() => setSaveSuccessMsg(''), 4500);
  };

  // Clinician Smart AI Draft Advice Generator
  const handleTriggerAIDraftTemplate = (preset: 'allergy' | 'plateau' | 'fasting' | 'keto') => {
    if (!selectedCust) return;
    let text = '';

    switch (preset) {
      case 'allergy':
        text = `Hello ${selectedCust.name.split(' ')[0]}, I have personally cleared and signed off on your kitchen preparation safety protocols for your allergen profile: (${selectedCust.allergies.join(', ') || 'exclusions'}). Clean containers are fully flagged! Please let us know if your threshold changes.`;
        break;
      case 'plateau':
        text = `Hi ${selectedCust.name.split(' ')[0]}, looking over your clinical weight stats, we have noticed you are at a minor milestone plateau. Based on your current weight of ${selectedCust.currentWeight}kg, I have requested our chef to shift 15% of dinner carbohydrates into breakfast proteins today. This will assist in boosting metabolic inertia over the next 48 hours.`;
        break;
      case 'fasting':
        text = `Hello ${selectedCust.name.split(' ')[0]}, support for your ${selectedCust.lifestyle?.fastingWillingness || '16:8 cycle'} has been successfully updated on our logistics panel. Make sure to intake rich minerals during the feeding hours. I have scheduled high-satiety fiber snack replacements for your upcoming box today.`;
        break;
      case 'keto':
        text = `Hi ${selectedCust.name.split(' ')[0]}, reviewing your somatic Keto ratios. We are dropping carb margins slightly to 5% with high vegetable fat content. Check your Energy levels on day 3, and log them on your check-in card so we can fine-tune!`;
        break;
    }

    setActiveReply(text);
  };

  // Local Task Manager helper methods
  const handleAddNewTaskToClient = () => {
    if (!selectedCust || !newTaskTitle.trim()) return;

    const task: CareTask = {
      id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTaskTitle,
      status: 'pending',
      dueDate: newTaskDueDate || 'No limit',
      priority: newTaskPriority,
      category: newTaskCategory
    };

    const currentOfCust = tasksMap[selectedCust.id] || [];
    setTasksMap(prev => ({
      ...prev,
      [selectedCust.id]: [...currentOfCust, task]
    }));

    addAuditLog(selectedCust.id, selectedCust.name, `Created manual care action: "${newTaskTitle}"`, 'task_update');

    setNewTaskTitle('');
    setNewTaskDueDate('');
    setSaveSuccessMsg(`New action task added successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const toggleCareTaskState = (taskId: string) => {
    if (!selectedCust) return;
    const currentOfCust = tasksMap[selectedCust.id] || [];
    const modified = currentOfCust.map(t => 
      t.id === taskId 
        ? { ...t, status: (t.status === 'completed' ? 'pending' : 'completed') as 'pending' | 'completed' } 
        : t
    );

    setTasksMap(prev => ({
      ...prev,
      [selectedCust.id]: modified
    }));

    const task = currentOfCust.find(t => t.id === taskId);
    if (task) {
      addAuditLog(
        selectedCust.id, 
        selectedCust.name, 
        `Marked care item "${task.title}" as ${task.status === 'completed' ? 'PENDING' : 'COMPLETED'}`, 
        'task_update'
      );
    }
  };

  const deleteCareTaskItem = (taskId: string) => {
    if (!selectedCust) return;
    const current = tasksMap[selectedCust.id] || [];
    setTasksMap(prev => ({
      ...prev,
      [selectedCust.id]: current.filter(t => t.id !== taskId)
    }));
  };

  // JSON Exporter for Clinical Subscriber Document Files
  const handleExportClientDossierFile = (cust: Customer) => {
    const backupObj = {
      ...cust,
      stagedWorkflow: stagesMap[cust.id] || 'intake',
      allergenClearance: allergyClearedMap[cust.id] ? 'APPROVED_SAFE' : 'HAZARD_STALL',
      activeCarePlans: tasksMap[cust.id] || []
    };
    
    const stringified = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const handle = document.createElement('a');
    handle.setAttribute("href", stringified);
    handle.setAttribute("download", `Subscriber_DNA_${cust.id}_${cust.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(handle);
    handle.click();
    handle.remove();
  };

  // --- Filtering List of Patients (Workflow 8) ---
  const filteredCustomers = customers.filter(c => {
    // 1. Real-time Search Across Customer Lists
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.customer_code && c.customer_code.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    // 2. Health Risk filter
    const health = calculateCustomerHealth(c);
    if (healthFilter === 'risk') return health.score < 50;
    if (healthFilter === 'attention') return health.score >= 50 && health.score < 75;
    if (healthFilter === 'optimal') return health.score >= 75;

    // 3. Branch filter
    if (customerBranchFilter !== 'all') {
      if (!c.branch || c.branch.toLowerCase() !== customerBranchFilter.toLowerCase()) {
        return false;
      }
    }

    // 4. Package Expiry Status filter
    if (customerPackageStatusFilter !== 'all') {
      const expires = c.subscriptionPackage?.expiresDate || '';
      const today = new Date();
      const expDate = expires ? new Date(expires) : null;
      
      let pStatus = 'active';
      if (!expires || !expDate) {
        pStatus = 'expired';
      } else {
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) {
          pStatus = 'expired';
        } else if (diffDays <= 14) {
          pStatus = 'expiring_soon';
        }
      }

      if (customerPackageStatusFilter === 'expired' && pStatus !== 'expired') return false;
      if (customerPackageStatusFilter === 'expiring_soon' && pStatus !== 'expiring_soon') return false;
      if (customerPackageStatusFilter === 'active' && pStatus !== 'active') return false;
    }

    return true;
  });

  // --- Filtering List of Inquiries (Workflow 8) ---
  const filteredInquiries = inquiries.filter(inq => {
    // 1. Real-time Search Across Inquiry Lists
    const matchesSearch = (inq.prospect_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inq.prospect_contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inq.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Source filter
    if (inquirySourceFilter !== 'all') {
      if ((inq.source || '').toLowerCase() !== inquirySourceFilter.toLowerCase()) {
        return false;
      }
    }

    // 3. Status filter
    if (inquiryStatusFilter !== 'all') {
      if ((inq.status || '').toLowerCase() !== inquiryStatusFilter.toLowerCase()) {
        return false;
      }
    }

    // 4. Assigned staff filter
    if (inquiryStaffFilter !== 'all') {
      if ((inq.assigned_to || '').toLowerCase() !== inquiryStaffFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div id="crm-view-parent" className="space-y-6">
      
      {/* 🚀 Clinician Workflow Dashboard Metrics Header */}
      <div id="crm-metrics-header-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Registered Subscribers */}
        <div className="p-5 bg-white border border-slate-200 text-slate-900 rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold text-slate-500 block">Active Clients</span>
            <span className="text-3xl font-extrabold tracking-tight text-[#10b981]">{totalSubscribersCount}</span>
            <span className="text-[11px] text-[#64748b] font-medium block">
              Active subscriber plans
            </span>
          </div>
          <div className="p-3.5 bg-emerald-50 text-[#10b981] rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Delivery Run count */}
        <div className="p-5 bg-white border border-slate-200 text-slate-900 rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[12px] font-semibold text-slate-500 block">Active Deliveries</span>
            <span className="text-3xl font-extrabold tracking-tight text-blue-600">{activeDeliveryPlanCount}</span>
            <span className="text-[11px] text-[#64748b] font-medium block">
              Weekly boxes in transit
            </span>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-500 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Global Nutrition Cohort Health Score */}
        <div className="p-5 bg-white border border-slate-200 text-slate-900 rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[12px] font-semibold text-slate-500 block">Health Score</span>
              <span className="text-3xl font-extrabold tracking-tight text-emerald-600">{globalCohortHealthIndex}%</span>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl">
              <Heart className="w-5 h-5 fill-emerald-500/15" />
            </div>
          </div>
          <div className="mt-3.5 space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#10b981] h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${globalCohortHealthIndex}%` }}
              />
            </div>
            <span className="text-[10px] text-[#64748b] block font-medium">Combined target metrics</span>
          </div>
        </div>

        {/* Unresolved Hazards Count alert */}
        {(() => {
          const hazardCount = customers.filter(c => c.allergies && c.allergies.length > 0 && !allergyClearedMap[c.id]).length;
          return (
            <div className="p-5 bg-white border border-slate-200 text-slate-900 rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] transition-all flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[12px] font-semibold text-slate-500 block">Allergy Alerts</span>
                <span className="text-3xl font-extrabold tracking-tight text-rose-600">{hazardCount}</span>
                <span className="text-[11px] text-[#64748b] font-medium block">
                  {hazardCount > 0 ? `${hazardCount} preparation sheets blocked` : 'All allergen lines safe'}
                </span>
              </div>
              <div className={`p-3.5 rounded-xl ${hazardCount > 0 ? 'bg-rose-50 text-rose-500 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          );
        })()}

      </div>

      {/* Save Success Notice Toast Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs flex items-center gap-2.5 animate-fadeIn font-semibold shadow-sm">
          <Check className="w-4 h-4 shrink-0 text-emerald-650" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* --- CLINICAL ALLERGY CONTRADICTION KITCHEN ALERTS BAR (STATUS BANNER) --- */}
      {(() => {
        const hazardClients = customers.filter(c => c.allergies && c.allergies.length > 0 && !allergyClearedMap[c.id]);
        if (hazardClients.length > 0) {
          return (
            <div className="p-4 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase text-amber-800 tracking-wider block">ALLERGEN ALERT ACTIVE: KITCHEN PREPARATION BLOCKED</span>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    The kitchen has blocked preparation sheets for <strong className="text-slate-900">{hazardClients.map(c => c.name).join(', ')}</strong> due to outstanding allergen verification requirements ({hazardClients.map(c => c.allergies.join('+')).join(', ')}).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    hazardClients.forEach(c => clearAllergenSafety(c.id));
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-all text-xs tracking-wide cursor-pointer shadow-sm"
                >
                  Clear Safety Hold
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="p-3.5 rounded-[12px] bg-[#f0fdf4] border border-emerald-200 text-slate-700 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#10b981]" />
              <span className="font-medium text-slate-650">No outstanding allergen holds. All kitchen prep sheets cleared.</span>
            </div>
            <span className="text-[10px] text-[#10b981] px-2 py-0.5 rounded bg-emerald-100/60 font-medium uppercase tracking-wider">Pass</span>
          </div>
        );
      })()}

      {/* CRM Global Filter Settings & Main Controller bar */}
      <div className="p-5 bg-white border border-slate-200 rounded-[12px] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">CRM Clients Database</h2>
          <p className="text-xs text-[#64748b]">Manage and triage customer lifecycles, health parameters, active meal plans, and retention goals.</p>
        </div>

        {/* View Mode Switcher + Patient Add button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 w-full sm:w-auto justify-center border border-slate-200">
            <button
              type="button"
              id="crm-viewmode-sheet-btn"
              onClick={() => setViewMode('sheet')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'sheet' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
              <span>Spreadsheet Sheet</span>
            </button>
            <button
              type="button"
              id="crm-viewmode-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-white text-slate-950 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0 text-blue-500" />
              <span>Dossiers Grid</span>
            </button>
            <button
              type="button"
              id="crm-viewmode-analytics-btn"
              onClick={() => setViewMode('analytics')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'analytics' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
              <span>Analytics</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsAddUserOpen(!isAddUserOpen)}
            className="w-full sm:w-auto px-4 py-2 bg-[#10b981] hover:bg-[#10b981]/95 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            Enroll Client
          </button>
        </div>
      </div>

      {/* Expandable Enroll Client Modal Hub */}
      {isAddUserOpen && (
        <form onSubmit={handleAddNewCustomerSubmit} className={`p-6 rounded-2xl border space-y-4 animate-fadeIn text-xs ${
          darkMode ? 'bg-[#121214] border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800/40">
            <span className="font-extrabold uppercase tracking-widest text-[#1ed760] font-mono flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              Subcribers Clinical Intake Intake Register
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Client Legal Name</label>
              <input
                type="text"
                required
                placeholder="Rachel Sterling"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white focus:ring-1 focus:ring-[#1ed760] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Email Address</label>
              <input
                type="email"
                placeholder="rachel.s@outlook.com"
                value={newCustEmail}
                onChange={(e) => setNewCustEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white focus:ring-1 focus:ring-[#1ed760] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Phone Contact</label>
              <input
                type="text"
                placeholder="+1 (555) 304-2099"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white focus:ring-1 focus:ring-[#1ed760] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Nutrition Target Category</label>
              <select
                value={newCustCategory}
                onChange={(e) => setNewCustCategory(e.target.value as DietCategory)}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white focus:ring-1 focus:ring-[#1ed760] font-mono"
              >
                <option value="Keto">Keto Program</option>
                <option value="Vegan">Vegan Program</option>
                <option value="Paleo">Paleo Program</option>
                <option value="High-Protein">High-Protein Program</option>
                <option value="Low-Carb">Low-Carb Program</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={newCustWeight}
                onChange={(e) => setNewCustWeight(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Target Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={newCustTargetWeight}
                onChange={(e) => setNewCustTargetWeight(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] text-zinc-400 font-mono font-bold block uppercase">Kcal Daily Target Limit</label>
              <input
                type="number"
                required
                value={newCustKcal}
                onChange={(e) => setNewCustKcal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-zinc-800 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-rose-400 font-mono font-bold block uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Special Allergen Contraindications (Separated by commas)
              </label>
              <input
                type="text"
                placeholder="e.g. Peanuts, Dairy, Gluten, Soy"
                value={newCustAllergies}
                onChange={(e) => setNewCustAllergies(e.target.value)}
                className="w-full p-2.5 rounded-xl text-xs outline-none bg-zinc-900 border border-rose-500/10 focus:border-rose-500 text-white font-mono"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-[#1DB954] hover:bg-[#1db954]/95 text-zinc-950 font-black tracking-widest uppercase rounded-xl transition-all cursor-pointer text-xs font-mono"
              >
                PROVISION MEDICAL DOSSIER FILE
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Primary Workstation layout views */}
      
      {/* ========================================================== */}
      {/* 🚀 MODE 1: THE PREMIUM KANBAN WORKFLOW PIPELINE BOARD      */}
      {/* ========================================================== */}
      {false && (
        <div id="crm-kanban-mode-wrapper" className="space-y-6">
          
          {/* 🌟 Clear Pipeline Category Tabs Switcher */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm animate-fadeIn">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Select Active Workflow Pipeline</span>
              <h3 className="text-sm font-extrabold text-slate-800">Pipeline Board Channels</h3>
            </div>

            <div className="inline-flex rounded-xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-650 w-full md:w-auto">
              <button
                type="button"
                id="crm-pipeline-customers-tab-btn"
                onClick={() => setCrmMode('customers')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  crmMode === 'customers' 
                    ? 'bg-white text-[#10b981] shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Clients Pipeline ({customers.length})</span>
              </button>
              <button
                type="button"
                id="crm-pipeline-inquiries-tab-btn"
                onClick={() => setCrmMode('inquiries')}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  crmMode === 'inquiries' 
                    ? 'bg-white text-indigo-600 shadow-sm font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Prospect Leads ({inquiries.length})</span>
              </button>
            </div>
          </div>

          {crmMode === 'customers' ? (
            <>
          {/* Search bar and Triage Filters row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search client name or CUST code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none bg-white border border-[#e2e8f0] text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Triage Filters:</span>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setHealthFilter('all')}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${healthFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All Subscriptions ({customers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHealthFilter('attention')}
                  className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${healthFilter === 'attention' ? 'bg-white text-amber-600 shadow-sm font-bold' : 'text-slate-500 hover:text-amber-500'}`}
                >
                  Calibration Stall ({customers.filter(c => { const h = calculateCustomerHealth(c).score; return h >= 50 && h < 75; }).length})
                </button>
              </div>
            </div>
          </div>
          <div id="crm-kanban-board-grid" className="grid grid-cols-1 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
            
            {/* STAGE COLUMNS */}
            {[
              {
                key: 'intake' as WorkflowStage,
                title: 'Intake & Chat Leads',
                color: 'border-t-blue-500',
                badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
                textColor: 'text-blue-800',
                description: 'Incoming leads needing setup'
              },
              {
                key: 'assessment' as WorkflowStage,
                title: 'Health Assessment',
                color: 'border-t-amber-500',
                badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
                textColor: 'text-amber-800',
                description: 'Evaluating patient conditions'
              },
              {
                key: 'active' as WorkflowStage,
                title: 'Active Meal Prep',
                color: 'border-t-emerald-500',
                badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                textColor: 'text-emerald-800',
                description: 'Assigned customized plans'
              },
              {
                key: 'calibration' as WorkflowStage,
                title: 'Caloric Calibration',
                color: 'border-t-orange-500',
                badgeBg: 'bg-orange-50 text-orange-700 border-orange-100',
                textColor: 'text-orange-850',
                description: 'Plateau & caloric ceiling tuning'
              },
              {
                key: 'renewal' as WorkflowStage,
                title: 'Retention & Renewal',
                color: 'border-t-purple-500',
                badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
                textColor: 'text-purple-800',
                description: 'VIP care & renewal subscription'
              }
            ].map(col => {
              // Extract all matching customers of this stage
              const matchingClientsInCol = customers.filter(c => {
                const inStage = (stagesMap[c.id] || 'intake') === col.key;
                if (!inStage) return false;
                
                if (healthFilter === 'attention') {
                  const h = calculateCustomerHealth(c).score;
                  return h >= 50 && h < 75;
                }
                return true;
              });

              const doesMatchSearch = (cust: Customer) => {
                if (!searchTerm.trim()) return true;
                const src = searchTerm.toLowerCase();
                return cust.name.toLowerCase().includes(src) || (cust.customer_code || cust.id).toLowerCase().includes(src);
              };

              const hasAnySearchMatch = matchingClientsInCol.some(doesMatchSearch);

              return (
                <div
                  key={col.key}
                  className={`flex flex-col rounded-2xl border bg-slate-50/40 p-4.5 space-y-3.5 shrink-0 min-w-[290px] border-slate-200/80 border-t-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all ${col.color}`}
                >
                  {/* Column Header */}
                  <div className="flex flex-col space-y-1 pb-3 border-b border-slate-100 font-sans">
                    <div className="flex justify-between items-center">
                      <span className={`font-extrabold text-[13px] tracking-tight ${col.textColor}`}>
                        {col.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${col.badgeBg}`}>
                        {matchingClientsInCol.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-tight">{col.description}</p>
                  </div>

                  {/* Kanban Cards stack */}
                  <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin flex-1 pr-1">
                    {matchingClientsInCol.length === 0 ? (
                      <div className="py-10 px-4 text-center rounded-xl bg-slate-100/50 border border-dashed border-slate-250 flex flex-col items-center justify-center gap-2">
                        <span className="p-2 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm">
                          <UserPlus className="w-4 h-4 text-slate-400" />
                        </span>
                        <p className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">No Subscribers</p>
                        <button
                          type="button"
                          onClick={() => setIsAddUserOpen(true)}
                          className="text-[#10b981] hover:underline hover:text-[#0d9488] text-[11px] font-black uppercase tracking-wider flex items-center gap-0.5"
                        >
                          + Enroll Client
                        </button>
                      </div>
                    ) : (searchTerm.trim() !== '' && !hasAnySearchMatch) ? (
                      <div className="py-10 px-4 text-center rounded-xl bg-slate-100/50 border border-dashed border-slate-250 flex flex-col items-center justify-center gap-2">
                        <span className="p-2 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm">
                          <Search className="w-4 h-4 text-slate-400" />
                        </span>
                        <p className="text-[11px] font-bold text-slate-450 uppercase tracking-wide">No Matches</p>
                      </div>
                    ) : (
                      matchingClientsInCol.map(cust => {
                        const health = calculateCustomerHealth(cust);
                        const isSelected = selectedCust?.id === cust.id;
                        const cleared = allergyClearedMap[cust.id];
                        const matches = doesMatchSearch(cust);

                        // Initials for avatar bubble
                        const namesArr = cust.name.trim().split(' ');
                        const initials = (namesArr[0]?.[0] || '') + (namesArr[1]?.[0] || '');
                        
                        // Food-category color tag pairing
                        const catColors: { [key: string]: string } = {
                          KETO: 'bg-amber-100 text-amber-800 border-amber-200/50',
                          VEGAN: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
                          'WEIGHT LOSS': 'bg-rose-100 text-rose-800 border-rose-250/30',
                          'DIABETIC CARE': 'bg-blue-100 text-blue-800 border-blue-200/50',
                          'PEDIATRICS CARE': 'bg-purple-100 text-purple-800 border-purple-200/50'
                        };
                        const categoryColor = catColors[cust.category?.toUpperCase()] || 'bg-slate-100 text-slate-800 border-slate-200';

                        return (
                          <div
                            key={cust.id}
                            id={`kanban-card-${cust.id}`}
                            onClick={() => handleSelectCustomer(cust)}
                            className={`group p-4 bg-white border rounded-xl transition-all duration-200 cursor-pointer flex flex-col space-y-3.5 relative overflow-hidden ${
                              matches ? 'opacity-100' : 'opacity-35'
                            } ${
                              isSelected 
                                ? 'border-[#10b981] shadow-[0_5px_18px_rgba(16,185,129,0.12)] ring-1 ring-[#10b981]/30 bg-[#fafdfb]' 
                                : 'border-slate-200/85 hover:border-slate-350 hover:shadow-md hover:-translate-y-[1.5px]'
                            }`}
                          >
                            {/* Selection flag indicator */}
                            {isSelected && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-[#10b981]" />
                            )}

                            {/* Row 1: Profile Avatar Bubble + Name + ID Code */}
                            <div className="flex items-start gap-2.5">
                              {/* Avatar circle */}
                              <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-white/80 shadow-inner uppercase tracking-wider ${categoryColor}`}>
                                {initials || 'CU'}
                              </div>

                              <div className="space-y-0.5 flex-1 min-w-0">
                                <h4 className="font-extrabold text-[13.5px] text-slate-900 group-hover:text-[#10b981] transition-colors truncate leading-snug">
                                  {cust.name}
                                </h4>
                                <div className="text-[10px] text-slate-400 font-bold font-mono tracking-wide">
                                  ID: {cust.customer_code || cust.id}
                                </div>
                              </div>
                            </div>

                            {/* Row 2: Category Pill + Weight metric */}
                            <div className="flex justify-between items-center gap-1.5 pt-0.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border food-badge ${categoryColor}`}>
                                {cust.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200">
                                {cust.currentWeight} kg
                              </span>
                            </div>

                            {/* Row 3: Calorie & Allergen Cleared Indicators */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                              <div className="space-y-0.5">
                                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Cal limit</span>
                                <span className="font-extrabold text-slate-800 font-mono">{cust.targetKcal || 'Untracked'} kcal</span>
                              </div>
                              <div className="space-y-0.5 flex flex-col justify-center">
                                <span className="block text-[9px] text-slate-400 uppercase font-bold tracking-wider">Safety Audit</span>
                                {cleared ? (
                                  <span className="inline-flex items-center gap-0.5 text-[10.5px] text-emerald-600 font-extrabold">
                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                    <span>Cleared</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[10.5px] text-rose-550 font-extrabold animate-pulse">
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                    <span>Alert</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Row 4: Patient Health Index Graphical Bar */}
                            <div className="space-y-1.5 pt-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                                <span className="uppercase tracking-wider">Health Index</span>
                                <span className={
                                  health.score >= 75 ? 'text-emerald-600 font-black' : health.score >= 50 ? 'text-amber-600 font-black' : 'text-rose-550 font-black'
                                }>{health.score}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-300 ${
                                  health.score >= 75 ? 'bg-[#10b981]' : health.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} style={{ width: `${health.score}%` }}></div>
                              </div>
                            </div>

                            {/* Row 5: Column stage selection trigger */}
                            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Workout Stage:</span>
                              <select
                                value={stagesMap[cust.id] || 'intake'}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  moveCustomerStage(cust.id, e.target.value as WorkflowStage);
                                }}
                                className="bg-slate-50 border border-slate-200 text-[10px] text-slate-700 rounded-lg p-1.5 px-2 outline-none font-extrabold cursor-pointer hover:bg-slate-100 hover:border-slate-350 transition-all focus:ring-1 focus:ring-[#10b981]"
                              >
                                <option value="intake">Intake Leads</option>
                                <option value="assessment">Assessment</option>
                                <option value="active">Active Prep</option>
                                <option value="calibration">Calibration</option>
                                <option value="renewal">Retention</option>
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Quick Click to focus details reminder */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-[#64748b]">
            💡 Select any subscriber card to access their <strong>360° Clinical Workspace Panel</strong> below for real-time diet tuning.
          </div>

          </>
          ) : (
            <>
              {/* Sales Prospect Pipeline Columns (Workflow 1) */}
              <div id="crm-inquiries-kanban-board" className="grid grid-cols-1 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
                {[
                  {
                    key: 'new',
                    title: '📥 New Inquiry',
                    color: 'border-t-slate-400',
                    headerBg: 'bg-slate-100 text-slate-700 border-slate-200',
                    description: 'Fresh incoming leads needing qualification'
                  },
                  {
                    key: 'contacted',
                    title: '💬 Contacted Out',
                    color: 'border-t-sky-500',
                    headerBg: 'bg-sky-50 text-sky-700 border-sky-100',
                    description: 'Representative contacted prospect'
                  },
                  {
                    key: 'interested',
                    title: '🔥 Interested Lead',
                    color: 'border-t-amber-500',
                    headerBg: 'bg-amber-50 text-amber-700 border-amber-100',
                    description: 'High purchase interest and setup'
                  },
                  {
                    key: 'converted',
                    title: '✅ Converted Cust',
                    color: 'border-t-emerald-500',
                    headerBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    description: 'Converted! Subscribed in local database'
                  },
                  {
                    key: 'closed',
                    title: '❌ Closed Lost',
                    color: 'border-t-rose-400',
                    headerBg: 'bg-rose-50 text-rose-700 border-rose-100',
                    description: 'Disengaged trial or opt-out closed'
                  }
                ].map(col => {
                  const matchingInqs = filteredInquiries.filter(i => (i.status || 'new') === col.key);

                  return (
                    <div
                      key={col.key}
                      className={`flex flex-col rounded-2xl border bg-slate-50/40 p-4.5 space-y-3.5 shrink-0 min-w-[290px] border-slate-200/80 border-t-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all ${col.color}`}
                    >
                      {/* Inquiry pipeline column header */}
                      <div className="flex flex-col space-y-1 pb-3 border-b border-slate-100 font-sans">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[13px] tracking-tight text-slate-800">
                            {col.title}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${col.headerBg}`}>
                            {matchingInqs.length}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium leading-tight">{col.description}</p>
                      </div>

                      <div className="space-y-3 overflow-y-auto max-h-[500px] scrollbar-thin flex-1 pr-1 min-h-[140px]">
                        {matchingInqs.length === 0 ? (
                          <div className="py-10 px-4 text-center rounded-xl bg-slate-100/50 border border-dashed border-slate-250 flex flex-col items-center justify-center gap-2">
                            <span className="p-2 rounded-full bg-white text-slate-400 border border-slate-200 shadow-sm">
                              <MessageSquare className="w-4 h-4 text-slate-300" />
                            </span>
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">No matching leads</p>
                          </div>
                        ) : (
                          matchingInqs.map(inq => {
                            const isSelected = selectedInq?.id === inq.id;
                            
                            // Get visual icon for Source Channel
                            let srcEmoji = '🌐';
                            if (inq.source?.toLowerCase().includes('messenger')) srcEmoji = '💬';
                            if (inq.source?.toLowerCase().includes('telegram')) srcEmoji = '✈️';
                            if (inq.source?.toLowerCase().includes('instagram')) srcEmoji = '📸';

                            // Initials for avatar bubble
                            const namesArr = inq.prospect_name.trim().split(' ');
                            const initials = (namesArr[0]?.[0] || '') + (namesArr[1]?.[0] || '');

                            return (
                              <div
                                key={inq.id}
                                onClick={() => setSelectedInq(inq)}
                                className={`group p-4 bg-white border rounded-xl transition-all duration-200 cursor-pointer flex flex-col space-y-3.5 relative overflow-hidden ${
                                  isSelected 
                                    ? 'border-indigo-500 shadow-[0_5px_18px_rgba(99,102,241,0.12)] ring-1 ring-indigo-500/30 bg-[#fafbfe]' 
                                    : 'border-slate-200/85 hover:border-slate-350 hover:shadow-md hover:-translate-y-[1.5px]'
                                }`}
                              >
                                {/* Selection flag indicator */}
                                {isSelected && (
                                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                )}

                                <div className="space-y-3.5 flex-1 select-none">
                                  {/* Row 1: Source channels & inquiry ID */}
                                  <div className="flex justify-between items-center font-mono text-[9px] font-bold">
                                    <span className="text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{inq.id}</span>
                                    <span className="text-slate-500 flex items-center gap-1 uppercase bg-slate-150 px-1.5 py-0.5 rounded border border-slate-200">
                                      <span>{srcEmoji}</span>
                                      <span>{inq.source}</span>
                                    </span>
                                  </div>

                                  {/* Row 2: Avatar & Prospect contact details */}
                                  <div className="flex items-start gap-2.5">
                                    <div className="w-8.5 h-8.5 rounded-full flex items-center justify-center text-xs font-black shrink-0 border border-slate-200 bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                                      {initials || 'PL'}
                                    </div>

                                    <div className="space-y-0.5 flex-1 min-w-0">
                                      <h4 className="font-extrabold text-[13px] text-slate-950 group-hover:text-indigo-600 transition-colors truncate leading-tight">
                                        {inq.prospect_name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 font-medium">
                                        <Phone className="w-3 h-3 text-slate-300 shrink-0" />
                                        {inq.prospect_contact}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Row 3: Account Ownership & Message Threads Info */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                    <div className="space-y-0.5">
                                      <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">Assigned Rep</span>
                                      <span className="font-extrabold text-[#334155] truncate block">👤 {inq.assigned_to || 'Sarah Jenkins'}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="block text-[8px] text-slate-400 uppercase font-bold tracking-wider">Thread Status</span>
                                      <span className="font-extrabold text-indigo-600 block">💬 {inq.messages?.length || 0} chats</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Row 4: Status Shift Dropdown & Convert Button */}
                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                  <div className="flex justify-between items-center gap-2 font-sans">
                                    <select
                                      value={inq.status || 'new'}
                                      onClick={(e) => e.stopPropagation()}
                                      disabled={inq.status === 'closed'}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        handleChangeInquiryStatus(inq.id, e.target.value);
                                      }}
                                      className="bg-slate-50 border border-slate-200 text-[10px] text-slate-705 rounded-lg p-1.5 px-2 outline-none font-extrabold cursor-pointer hover:bg-slate-105 hover:border-slate-350 transition-all focus:ring-1 focus:ring-indigo-500 flex-1 max-w-[120px]"
                                    >
                                      <option value="new">New Lead</option>
                                      <option value="contacted">Contacted</option>
                                      <option value="interested">Interested</option>
                                      <option value="converted" disabled>Converted</option>
                                      <option value="closed">Closed Lost</option>
                                    </select>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenConvertInquiry(inq);
                                      }}
                                      disabled={inq.status === 'new' || inq.status === 'converted' || inq.status === 'closed'}
                                      className="flex-1 py-1.5 px-3 text-[11px] bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-lg font-sans text-center transition-all disabled:opacity-35 disabled:hover:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed border border-transparent disabled:border-slate-200 uppercase tracking-wider"
                                    >
                                      Convert Lead
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-[#64748b]">
                💡 Selecting any prospect lead on the pipeline board activates their **Live Communication Thread & Triage Advice Workspace** below.
              </div>
            </>
          )}

        </div>
      )}

      {/* ========================================================== */}
      {/* 📊 MODE 1.5: INTERACTIVE SPREADSHEET SHEET VIEW            */}
      {/* ========================================================== */}
      {viewMode === 'sheet' && (
        <div id="crm-spreadsheet-sheet" className="space-y-4 animate-fadeIn">
          {/* Quick spreadsheet search and filter controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Live Spreadsheet Triage Workspace</span>
              <h3 className="text-sm font-extrabold text-slate-800">Dynamic Excel Grid View</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 max-w-xl w-full justify-end">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter spreadsheet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-[#10b981] transition-all"
                />
              </div>
              
              {sheetSortField && (
                <button
                  type="button"
                  onClick={() => {
                    setSheetSortField(null);
                    setSheetSortAsc(true);
                  }}
                  className="px-2.5 py-1.5 border border-dashed border-rose-250 bg-rose-50 text-rose-650 hover:bg-rose-100 rounded-lg text-[10px] font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer"
                >
                  Clear Sort
                </button>
              )}
            </div>
          </div>

          {/* Interactive Data Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full min-w-[1000px] border-collapse text-left text-xs text-slate-600 font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-extrabold text-slate-500 uppercase tracking-wider select-none">
                  <tr>
                    <th className="py-3 px-4 border-r border-slate-200 w-20 text-center">ID Code</th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => {
                      setSheetSortField('name');
                      setSheetSortAsc(prev => sheetSortField === 'name' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5">
                        <span>Patient Subscriber</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => {
                      setSheetSortField('stage');
                      setSheetSortAsc(prev => sheetSortField === 'stage' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5">
                        <span>Workflow Stage</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => {
                      setSheetSortField('category');
                      setSheetSortAsc(prev => sheetSortField === 'category' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5">
                        <span>Diet Category</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors w-28 text-right" onClick={() => {
                      setSheetSortField('kcal');
                      setSheetSortAsc(prev => sheetSortField === 'kcal' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Target Kcal</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors w-28 text-right" onClick={() => {
                      setSheetSortField('weight');
                      setSheetSortAsc(prev => sheetSortField === 'weight' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span>Weight (kg)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors w-32" onClick={() => {
                      setSheetSortField('health');
                      setSheetSortAsc(prev => sheetSortField === 'health' ? !prev : true);
                    }}>
                      <div className="flex items-center gap-1.5">
                        <span>Health Index</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th className="py-3 px-4 border-r border-slate-200 text-center w-36">Allergy Safety</th>
                    <th className="py-3 px-4 border-r border-slate-200">Renewal Date</th>
                    <th className="py-3 px-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {(() => {
                    // Sort items dynamically
                    let list = [...filteredCustomers];
                    if (sheetSortField) {
                      list.sort((a, b) => {
                        let valA: any = '';
                        let valB: any = '';
                        if (sheetSortField === 'name') {
                          valA = a.name.toLowerCase();
                          valB = b.name.toLowerCase();
                        } else if (sheetSortField === 'weight') {
                          valA = a.currentWeight || 0;
                          valB = b.currentWeight || 0;
                        } else if (sheetSortField === 'kcal') {
                          valA = a.targetKcal || 0;
                          valB = b.targetKcal || 0;
                        } else if (sheetSortField === 'health') {
                          valA = calculateCustomerHealth(a).score;
                          valB = calculateCustomerHealth(b).score;
                        } else if (sheetSortField === 'stage') {
                          valA = stagesMap[a.id] || 'intake';
                          valB = stagesMap[b.id] || 'intake';
                        } else if (sheetSortField === 'category') {
                          valA = (a.category || '').toLowerCase();
                          valB = (b.category || '').toLowerCase();
                        }
                        if (valA < valB) return sheetSortAsc ? -1 : 1;
                        if (valA > valB) return sheetSortAsc ? 1 : -1;
                        return 0;
                      });
                    }

                    if (list.length === 0) {
                      return (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-450 uppercase font-bold tracking-wider font-mono">
                            No clients match search requirements.
                          </td>
                        </tr>
                      );
                    }

                    return list.map(cust => {
                      const isSelected = selectedCust?.id === cust.id;
                      const stage = stagesMap[cust.id] || 'intake';
                      const cleared = allergyClearedMap[cust.id];
                      const health = calculateCustomerHealth(cust);
                      
                      // Initials
                      const names = cust.name.trim().split(' ');
                      const initials = (names[0]?.[0] || '') + (names[1]?.[0] || '');

                      // Stage styling
                      const stageStyles: Record<WorkflowStage, { bg: string, text: string, border: string }> = {
                        intake: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-150' },
                        assessment: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-150' },
                        active: { bg: 'bg-emerald-50', text: 'text-emerald-850', border: 'border-emerald-150' },
                        calibration: { bg: 'bg-orange-50', text: 'text-orange-850', border: 'border-orange-150' },
                        renewal: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-150' }
                      };
                      const currentStageStyle = stageStyles[stage as WorkflowStage] || stageStyles.intake;

                      // Category custom badges
                      const catBadgeStyles: Record<string, string> = {
                        KETO: 'bg-amber-100/75 text-amber-900 border-amber-250/20',
                        VEGAN: 'bg-emerald-100/75 text-emerald-900 border-emerald-250/20',
                        'WEIGHT LOSS': 'bg-rose-100/75 text-rose-900 border-rose-250/20',
                        'DIABETIC CARE': 'bg-blue-100/75 text-blue-900 border-blue-250/20',
                        'PEDIATRICS CARE': 'bg-purple-100/75 text-purple-900 border-purple-250/20'
                      };
                      const categoryClass = catBadgeStyles[cust.category?.toUpperCase() || ''] || 'bg-slate-100 text-slate-800 border-slate-200';

                      return (
                        <tr
                          key={cust.id}
                          className={`transition-colors cursor-pointer hover:bg-slate-50/50 ${isSelected ? 'bg-emerald-50/20 border-l-[3px] border-l-[#10b981]' : ''}`}
                          onClick={() => handleSelectCustomer(cust)}
                        >
                          {/* ID Code cell */}
                          <td className="py-2.5 px-4 font-mono text-[11px] font-bold text-slate-450 border-r border-slate-150 text-center">
                            {cust.customer_code || cust.id}
                          </td>
                          
                          {/* Profile details cell */}
                          <td className="py-2.5 px-4 border-r border-slate-150">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border uppercase tracking-wider ${categoryClass}`}>
                                {initials || 'CU'}
                              </div>
                              <div className="space-y-0.5">
                                <span className={`font-extrabold text-slate-850 truncate block ${isSelected ? 'text-[#10b981]' : ''}`}>{cust.name}</span>
                                <span className="text-[9.5px] text-slate-400 font-mono">Weight logs: {cust.weightTrend?.length || 0}</span>
                              </div>
                            </div>
                          </td>

                          {/* Stage trigger dropdown cell */}
                          <td className="py-2.5 px-4 border-r border-slate-150">
                            <div className={`inline-flex rounded-lg border px-1.5 py-0.5 font-bold ${currentStageStyle.bg} ${currentStageStyle.text} ${currentStageStyle.border}`}>
                              <select
                                value={stage}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => moveCustomerStage(cust.id, e.target.value as WorkflowStage)}
                                className="bg-transparent border-none text-[10.5px] font-black uppercase tracking-wider outline-none cursor-pointer focus:ring-0 p-0"
                              >
                                <option value="intake">Intake Leads</option>
                                <option value="assessment">Assessment</option>
                                <option value="active">Active Prep</option>
                                <option value="calibration">Calibration</option>
                                <option value="renewal">Retention</option>
                              </select>
                            </div>
                          </td>

                          {/* Diet category cell */}
                          <td className="py-2.5 px-4 border-r border-slate-150">
                            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-bold">
                              <select
                                value={cust.category}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  if (handleUpdateCustomer) {
                                    const updated = { ...cust, category: e.target.value as DietCategory };
                                    handleUpdateCustomer(updated);
                                    if (selectedCust?.id === cust.id) setSelectedCust(updated);
                                    addAuditLog(cust.id, cust.name, `Modified profile category to ${e.target.value}`, 'checkin');
                                  }
                                }}
                                className="bg-transparent border-none text-[10px] font-extrabold uppercase tracking-widest text-slate-700 outline-none cursor-pointer p-0"
                              >
                                <option value="KETO">Keto</option>
                                <option value="VEGAN">Vegan</option>
                                <option value="WEIGHT LOSS">Weight Loss</option>
                                <option value="DIABETIC CARE">Diabetic Care</option>
                                <option value="PEDIATRICS CARE">Pediatrics Care</option>
                              </select>
                            </div>
                          </td>

                          {/* Target calories input */}
                          <td className="py-2.5 px-4 border-r border-slate-150 text-right font-mono font-bold">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                value={cust.targetKcal || 0}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  if (handleUpdateCustomer) {
                                    const updated = { ...cust, targetKcal: val };
                                    handleUpdateCustomer(updated);
                                    if (selectedCust?.id === cust.id) setSelectedCust(updated);
                                  }
                                }}
                                className="bg-slate-50/80 border border-slate-150 hover:border-slate-350 focus:border-[#10b981] rounded px-1.5 py-0.5 text-[11px] text-slate-800 font-mono font-bold w-16 text-right focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all"
                              />
                              <span className="text-[10px] text-slate-400 font-sans">kcal</span>
                            </div>
                          </td>

                          {/* Current weight input */}
                          <td className="py-2.5 px-4 border-r border-slate-150 text-right font-mono font-bold">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="number"
                                step="0.1"
                                value={cust.currentWeight || 0}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (handleUpdateCustomer) {
                                    const updated = { ...cust, currentWeight: val };
                                    handleUpdateCustomer(updated);
                                    if (selectedCust?.id === cust.id) setSelectedCust(updated);
                                  }
                                }}
                                className="bg-slate-50/80 border border-slate-150 hover:border-slate-350 focus:border-[#10b981] rounded px-1.5 py-0.5 text-[11px] text-slate-800 font-mono font-bold w-14 text-right focus:outline-none focus:ring-1 focus:ring-[#10b981] transition-all"
                              />
                              <span className="text-[10px] text-slate-400 font-sans">kg</span>
                            </div>
                          </td>

                          {/* Health score cell with index tracking */}
                          <td className="py-2.5 px-4 border-r border-slate-150">
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-400 leading-none">
                                <span>Health index</span>
                                <span className={health.score >= 75 ? 'text-emerald-600' : health.score >= 50 ? 'text-amber-500' : 'text-rose-550'}>
                                  {health.score}%
                                </span>
                              </div>
                              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  health.score >= 75 ? 'bg-emerald-500' : health.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`} style={{ width: `${health.score}%` }}></div>
                              </div>
                            </div>
                          </td>

                          {/* Safety audit trigger toggle */}
                          <td className="py-2.5 px-4 border-r border-slate-150 text-center">
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentCleared = allergyClearedMap[cust.id];
                                  setAllergyClearedMap(prev => ({ ...prev, [cust.id]: !currentCleared }));
                                  addAuditLog(cust.id, cust.name, !currentCleared ? `Cleared allergen hazards manually` : `Revoked allergen clearance level`, 'allergy_clearance');
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer flex items-center justify-center gap-1 shrink-0 ${
                                  cleared 
                                    ? 'bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100' 
                                    : 'bg-rose-50 border-rose-150 text-rose-700 hover:bg-rose-100 animate-pulse'
                                }`}
                              >
                                {cleared ? (
                                  <>
                                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                    <span>Cleared ✓</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-650" />
                                    <span>Hold ⚠</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Package Renewal Date cell */}
                          <td className="py-2.5 px-4 border-r border-slate-150 font-medium text-slate-500">
                            {cust.subscriptionPackage?.expiresDate ? (
                              <div className="space-y-0.5 leading-none">
                                <span className="text-[10px] text-slate-800 font-bold block">
                                  {new Date(cust.subscriptionPackage.expiresDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-[9px] text-[#64748b] font-mono whitespace-nowrap">Tier: {cust.subscriptionPackage.accountLevel || cust.subscriptionPackage.packageName || 'Premium'}</span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No Active Plan</span>
                            )}
                          </td>

                          {/* Row exclusion trigger */}
                          <td className="py-2.5 px-4 text-center">
                            <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                              {handleDeleteCustomer ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Remove custom client profile files of ${cust.name} from CRM active tracking register?`)) {
                                      handleDeleteCustomer(cust.id);
                                    }
                                  }}
                                  className="p-1 px-2 text-[10px] text-rose-550 border border-transparent hover:border-rose-100 hover:bg-rose-50 rounded-lg transition-all font-bold flex items-center gap-1 cursor-pointer"
                                  title="Unenroll subscriber"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Drop</span>
                                </button>
                              ) : (
                                <span className="text-slate-450">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>

                {/* Spreadsheet Workbook Footer Accumulators & Average Metrics */}
                <tfoot className="bg-slate-50 text-[11px] font-mono text-slate-550 border-t border-slate-200 font-extrabold select-none">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 text-left font-sans font-bold text-slate-800">
                      📊 Spreadsheet Synthesis Calculations
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-left">
                      Total: <span className="text-slate-900 font-extrabold">{filteredCustomers.length} clients</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      Limit Sum: <span className="text-indigo-600 font-extrabold font-mono">
                        {filteredCustomers.reduce((acc, c) => acc + (c.targetKcal || 0), 0).toLocaleString()}
                      </span> kcal
                    </td>
                    <td className="py-3 px-3 text-right">
                      Avg Weight: <span className="text-slate-900 font-extrabold font-mono">
                        {filteredCustomers.length > 0 
                          ? (filteredCustomers.reduce((acc, c) => acc + (c.currentWeight || 0), 0) / filteredCustomers.length).toFixed(1)
                          : '0.0'
                        }
                      </span> kg
                    </td>
                    <td className="py-3 px-4 text-left">
                      Avg Health: <span className="text-[#10b981] font-extrabold font-mono">
                        {filteredCustomers.length > 0
                          ? (filteredCustomers.reduce((acc, c) => acc + calculateCustomerHealth(c).score, 0) / filteredCustomers.length).toFixed(1)
                          : '0.0'
                        }%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      Safety Pass: <span className="text-emerald-600 font-extrabold font-mono">
                        {filteredCustomers.length > 0
                          ? ((filteredCustomers.filter(c => allergyClearedMap[c.id]).length / filteredCustomers.length) * 100).toFixed(0)
                          : '100'
                        }% ok
                      </span>
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-right text-[10px] text-slate-400 italic">
                      Live Sync Active 🟢
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-[#64748b]">
            💡 Clicking any record row loads their **Detailed Nutrition Dossier, Health Logs & Communication Thread** workspace below automatically.
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 📁 MODE 2: CLASSIC EXPANDED MEDICAL DOSSIERS GRID          */}
      {/* ========================================================== */}
      {viewMode === 'grid' && (
        <div id="crm-classic-grid" className="space-y-4 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search dossiers, name, IDs, exclusions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] transition-all"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setHealthFilter('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'all' ? 'bg-white text-slate-950 shadow-sm' : 'hover:text-slate-900'}`}
              >
                All ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setHealthFilter('risk')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${healthFilter === 'risk' ? 'bg-rose-500 text-white shadow-sm' : 'text-rose-600 hover:text-rose-900'}`}
              >
                Risk Focus ({customers.filter(c => calculateCustomerHealth(c).score < 50).length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustomers.map(cust => {
              const stages = stagesMap[cust.id] || 'intake';
              const clearsAl = allergyClearedMap[cust.id];
              const isSelected = selectedCust?.id === cust.id;
              const hStats = calculateCustomerHealth(cust);

              return (
                <div
                  key={cust.id}
                  onClick={() => handleSelectCustomer(cust)}
                  className={`relative overflow-hidden pt-6 pl-5 pr-5 pb-5 rounded-[12px] border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 shadow-sm bg-white border-slate-200 hover:shadow-md hover:-translate-y-0.5 ${
                    isSelected ? 'ring-1 ring-[#10b981] border-[#10b981]' : ''
                  }`}
                >
                  {/* Colored meal plan banner (thin, 4px) */}
                  <div className={`h-1 w-full absolute top-0 left-0 rounded-t-lg ${(() => {
                    const cat = (cust.category || '').toLowerCase();
                    if (cat.includes('keto')) return 'bg-amber-500';
                    if (cat.includes('vegan')) return 'bg-emerald-500';
                    if (cat.includes('cardio') || cat.includes('carb')) return 'bg-blue-500';
                    if (cat.includes('protein')) return 'bg-rose-500';
                    return 'bg-purple-500';
                  })()}`} />

                  {/* Top row: Avatar & basic identity info */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar circle with initials (emerald bg, white text) */}
                      <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-sm uppercase select-none shrink-0 shadow-sm">
                        {cust.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-850 text-[14px] leading-tight block truncate">{cust.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono mt-0.5 block truncate">
                          Code: {cust.customer_code || cust.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weight | BMI | Health score stats block */}
                  <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-[11px] leading-none select-none text-slate-600 font-medium">
                    <span>Weight: <strong className="text-slate-800 font-bold font-mono">{cust.currentWeight}kg</strong></span>
                    <span>BMI: <strong className="text-slate-800 font-bold font-mono">
                      {(() => {
                        const w = cust.currentWeight || 70;
                        const h = cust.physicalStatus?.heightCm || cust.physicalStatus?.height || 170;
                        return (w / ((h / 100) * (h / 100))).toFixed(1);
                      })()}
                    </strong></span>
                    <span>Health: <strong className="text-[#10b981] font-bold font-mono">{hStats.score}%</strong></span>
                  </div>

                  {/* Allergen status badge (✓ Safe or ⚠ Alert) */}
                  <div className="flex items-center justify-between text-xs font-semibold pt-1 border-t border-slate-100/50">
                    <span className="text-slate-400 font-medium">Allergen clearance:</span>
                    {clearsAl ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 rounded-full border border-emerald-100 font-bold">
                        ✓ Safe
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 bg-rose-50 px-2 rounded-full border border-rose-100 font-bold">
                        ⚠ Alert
                      </span>
                    )}
                  </div>

                  {/* Package Expiry block */}
                  {(() => {
                    const expires = cust.subscriptionPackage?.expiresDate || '';
                    if (!expires) {
                      return (
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-slate-400 font-medium">Subscription status:</span>
                          <span className="text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">No active plan</span>
                        </div>
                      );
                    }
                    const today = new Date();
                    const expDate = new Date(expires);
                    const diffTime = expDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const formattedDate = expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const expiresText = `Expires ${formattedDate}`;

                    let badgeClass = 'text-emerald-750 bg-emerald-50 border-emerald-150';
                    if (diffDays < 0) {
                      badgeClass = 'text-rose-700 bg-rose-50 border-rose-150 font-bold';
                    } else if (diffDays <= 7) {
                      badgeClass = 'text-amber-700 bg-amber-50 border-amber-150 font-bold animate-pulse';
                    } else if (diffDays <= 14) {
                      badgeClass = 'text-yellow-700 bg-yellow-50 border-yellow-150 font-medium';
                    }

                    return (
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-400 font-medium">Subscription status:</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${badgeClass}`}>
                          {diffDays < 0 ? `Expired ${formattedDate}` : expiresText}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Action Row */}
                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-slate-100/80 text-slate-555 text-[11px] font-semibold uppercase tracking-wide border border-slate-200">
                      Stage: {stages}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCustomer(cust);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#10b981] hover:text-white text-slate-700 rounded-lg text-[11.5px] font-bold transition-all text-center select-none cursor-pointer border border-slate-200/50 hover:border-transparent shadow-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 🧬 PART 3: THE 360-DEGREE CLINICAL WORKSPACE PRESET PANEL */}
      {/* ========================================================== */}
      {selectedCust && (
        <div id="crm-clinical-workspace-box" className="animate-fadeIn">
          
          <div className="p-4 bg-slate-50 border border-slate-200 border-b-0 rounded-t-2xl py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[#10b981]" />
              <div>
                <span className="text-xs font-bold tracking-wider text-[#10b981] uppercase block">360° CLIENT PROFILE WORKSPACE</span>
                <h4 className="text-sm font-bold text-slate-800 mt-0.5">Tuning: {selectedCust.name} ({selectedCust.id})</h4>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-[#64748b]">Workflow Stage:</span>
              <select
                value={stagesMap[selectedCust.id] || 'intake'}
                onChange={(e) => moveCustomerStage(selectedCust.id, e.target.value as WorkflowStage)}
                className="bg-white border border-slate-200 text-xs text-slate-800 font-bold rounded-lg p-2 outline-none cursor-pointer shadow-sm focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]"
              >
                <option value="intake">Intake</option>
                <option value="assessment">Assessment</option>
                <option value="active">Active Prep</option>
                <option value="calibration">Calibration</option>
                <option value="renewal">Renewal & VIP</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-b-2xl border border-slate-200 bg-white grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 columns: Tab Navigation & Client Details Content */}
            <div className="lg:col-span-2 flex flex-col gap-6">
            
              {/* Action controls timeline bar */}
              <div className="flex border-b border-slate-200 pb-0 gap-1 overflow-x-auto text-xs font-semibold tracking-wide scrollbar-none pb-1">
                {[
                  { 
                    key: 'diet', 
                    label: 'Metrics & Food Logs', 
                    icon: <Activity className="w-3.5 h-3.5 shrink-0" />, 
                    accentColor: 'text-[#10b981]',
                    activeClass: 'border-[#10b981] text-[#10b981] bg-emerald-50/40 rounded-t-lg'
                  },
                  { 
                    key: 'lifestyle', 
                    label: 'Lifestyle & Pathology', 
                    icon: <Shield className="w-3.5 h-3.5 shrink-0" />, 
                    accentColor: 'text-amber-600',
                    activeClass: 'border-amber-550 text-amber-600 bg-amber-50/40 rounded-t-lg'
                  },
                  { 
                    key: 'package', 
                    label: 'Subscription Tier & Billing', 
                    icon: <DollarSign className="w-3.5 h-3.5 shrink-0" />, 
                    accentColor: 'text-blue-600',
                    activeClass: 'border-blue-500 text-blue-600 bg-blue-50/40 rounded-t-lg'
                  },
                  { 
                    key: 'inquiries', 
                    label: 'Chat Threads', 
                    icon: <MessageSquare className="w-3.5 h-3.5 shrink-0" />, 
                    count: selectedCust.inquiriesList?.length || 0,
                    accentColor: 'text-indigo-600',
                    activeClass: 'border-indigo-500 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
                  },
                  { 
                    key: 'tasks', 
                    label: 'Action Tasks', 
                    icon: <Check className="w-3.5 h-3.5 shrink-0" />, 
                    count: (tasksMap[selectedCust.id] || []).filter(t => t.status === 'pending').length,
                    accentColor: 'text-rose-600',
                    activeClass: 'border-rose-500 text-rose-600 bg-rose-50/40 rounded-t-lg'
                  }
                ].map(subTab => (
                  <button
                    key={subTab.key}
                    type="button"
                    id={`crm-subtab-btn-${subTab.key}`}
                    onClick={() => setCrmSubTab(subTab.key as any)}
                    className={`pb-2.5 pt-2 px-3 border-b-2 font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
                      crmSubTab === subTab.key 
                        ? `${subTab.activeClass} border-b-[3px]` 
                        : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <span className={crmSubTab === subTab.key ? subTab.accentColor : 'text-slate-450'}>
                      {subTab.icon}
                    </span>
                    <span>{subTab.label}</span>
                    {subTab.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        crmSubTab === subTab.key 
                          ? 'bg-slate-900 text-white' 
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {subTab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

            {/* TAB CONTENT: DIET STATISTICS */}
            {crmSubTab === 'diet' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Micro somatic feedback advisory block */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748b] block">Caloric Ceiling Target</span>
                    <span className="text-sm font-extrabold text-[#10b981]">{selectedCust.targetKcal} kcal / Daily</span>
                    <span className="text-[11px] text-[#64748b] block">Macro limits strictly monitored</span>
                  </div>

                  <div className="space-y-1 border-y md:border-y-0 md:border-x border-slate-200 py-3 md:py-0 md:px-5">
                    <span className="text-[10px] font-bold uppercase text-[#64748b] block">Active Somatic Weight</span>
                    <span className="text-slate-800 text-sm font-extrabold">
                      {selectedCust.currentWeight}kg <span className="text-slate-400">➔</span> {selectedCust.targetWeight}kg
                    </span>
                    <span className="text-[11px] text-[#64748b] block">Initial Weight: {selectedCust.weightTrend[0]?.weight || selectedCust.currentWeight}kg</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-[#64748b] block">Somatic Advisory Rating</span>
                    {(() => {
                      const analysis = calculateCustomerHealth(selectedCust);
                      return (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-extrabold ${analysis.textTheme}`}>{analysis.score}%</span>
                          <span className="text-[10px] px-1.5 py-0.2 uppercase border rounded font-mono text-slate-700 bg-slate-100 border-slate-200">
                            {analysis.advisory}
                          </span>
                        </div>
                      );
                    })()}
                    <span className="text-[11px] text-[#64748b] block">Based on weights and calorie logs</span>
                  </div>

                </div>

                {/* Plot line weight curve graph SVG */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-700 font-bold uppercase block">Somatic Weight Trend Plot</span>
                    <span className="text-[#10b981] font-extrabold uppercase text-[10.5px]">
                      Total deviation: {Math.abs(selectedCust.currentWeight - (selectedCust.weightTrend[0]?.weight || selectedCust.currentWeight)).toFixed(1)}kg lost
                    </span>
                  </div>

                  {/* Manual check-in weights logger logs */}
                  <div className="h-[140px] w-full relative pt-2">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="curveFillGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Helper lines */}
                      <line x1="0" y1="5" x2="100" y2="5" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1 3" />
                      <line x1="0" y1="15" x2="100" y2="15" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1 3" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1 3" />

                      {(() => {
                        const logs = selectedCust.weightTrend || [];
                        if (logs.length === 0) return null;

                        const rawWeights = logs.map(l => l.weight);
                        const minRaw = Math.min(...rawWeights) - 0.5;
                        const maxRaw = Math.max(...rawWeights) + 0.5;
                        const r = maxRaw - minRaw || 1;

                        const coordinates = logs.map((l, ind) => {
                          const x = logs.length > 1 ? (ind / (logs.length - 1)) * 100 : 50;
                          const y = 30 - (((l.weight - minRaw) / r) * 20 + 5);
                          return { x, y, weight: l.weight, date: l.date };
                        });

                        const dPath = coordinates.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
                        const dArea = `${dPath} L ${coordinates[coordinates.length - 1].x} 30 L ${coordinates[0].x} 30 Z`;

                        return (
                          <>
                            {/* Glow fill area */}
                            <path d={dArea} fill="url(#curveFillGlow)" />
                            
                            {/* Clean trend line */}
                            <path d={dPath} fill="none" stroke="#10b981" strokeWidth="1.2" />

                            {/* Circular coordinates check-in points on trend */}
                            {coordinates.map((pt, k) => (
                              <g key={k}>
                                <circle cx={pt.x} cy={pt.y} r="1.2" fill="#10b981" />
                                <text x={pt.x} y={pt.y - 3} fill="#475569" fontSize="2.8" textAnchor="middle" fontWeight="bold">
                                  {pt.weight}kg
                                </text>
                                <text x={pt.x} y="29.5" fill="#64748b" fontSize="2.2" textAnchor="middle">
                                  {pt.date}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Daily Check-in Logging Console */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#10b981]" />
                    <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">Real-time Check-in Log Console</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#64748b] uppercase tracking-wider block">Checked Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 67.8"
                        value={checkinWeight}
                        onChange={(e) => setCheckinWeight(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#64748b] uppercase tracking-wider block">Caloric Intake (kcal)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1540"
                        value={checkinCalories}
                        onChange={(e) => setCheckinCalories(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-[#64748b] uppercase tracking-wider block">Log Reference Date (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. May 27"
                        value={checkinDate}
                        onChange={(e) => setCheckinDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddNewCheckinLog}
                        className="w-full py-2.5 bg-[#10b981] hover:bg-[#10b981]/95 text-white font-bold uppercase text-xs tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Commit Logs
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: LIFESTYLE & EXCLUSIONS */}
            {crmSubTab === 'lifestyle' && (
              <div className="space-y-5 animate-fadeIn">
                
                <div className="p-4 rounded-xl bg-slate-100/50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block">ALLERGEN SECURITY CONTROL STATUS</span>
                      <span className="text-[11px] text-[#64748b]">Exclusions: [{selectedCust.allergies.join(', ') || 'None'}]</span>
                    </div>
                  </div>

                  {selectedCust.allergies && selectedCust.allergies.length > 0 ? (
                    allergyClearedMap[selectedCust.id] ? (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-bold text-xs flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Approved Safe
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => clearAllergenSafety(selectedCust.id)}
                        className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded font-bold text-xs cursor-pointer shadow-sm"
                      >
                        Clear Hazards Approval Pass
                      </button>
                    )
                  ) : (
                    <span className="text-slate-400 text-xs font-semibold">No Exclusion Controls Needed</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  {/* Left block inputs */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-700 uppercase block">Metabolic Preferences</h5>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block uppercase">Food Exclusions / Restrictions</label>
                      <textarea
                        value={foodRestrictions}
                        onChange={(e) => setFoodRestrictions(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 outline-none text-xs focus:ring-1 focus:ring-[#10b981] h-16 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-1">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block uppercase">Activity Level</label>
                        <select
                          value={activityLevel}
                          onChange={(e) => setActivityLevel(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-none font-sans"
                        >
                          <option value="Sedentary">Sedentary Level</option>
                          <option value="Moderate">Moderate Level</option>
                          <option value="Active">Active Level</option>
                          <option value="Highly Active">Highly Active</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block uppercase">Fasting Level</label>
                        <select
                          value={fastingWillingness}
                          onChange={(e) => setFastingWillingness(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2 outline-none font-sans"
                        >
                          <option value="None">None</option>
                          <option value="16:8 Fasting">16:8 Fasting</option>
                          <option value="20:4 Fasting">20:4 Fasting</option>
                          <option value="Alternate Day">Alternate Day Scheme</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right block inputs - Pathology profiles */}
                  <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-700 uppercase block">Clinical Medical Profile</h5>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block uppercase">Stated Medical Pathology / Allergy Details</label>
                      <input
                        type="text"
                        value={medicalCondition}
                        onChange={(e) => setMedicalCondition(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2 outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block uppercase">Current Medications taking</label>
                      <input
                        type="text"
                        value={medicineTaking}
                        onChange={(e) => setMedicineTaking(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2 outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-rose-600 font-bold block uppercase">Thermal Box Specific Delivery Notes</label>
                      <input
                        type="text"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2 outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSubSectionsWorkspace}
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold uppercase text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Commit Clinical profiles update
                  </button>
                </div>

              </div>
            )}

            {/* TAB CONTENT: BILLING AND COHORT DEALS */}
            {crmSubTab === 'package' && (
              <div className="space-y-5 animate-fadeIn">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <h5 className="font-bold uppercase text-slate-700 block">Package Subscription Level</h5>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block uppercase">Active Package Name</label>
                      <input
                        type="text"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block uppercase">Service Level tier</label>
                        <select
                          value={accountLevel}
                          onChange={(e) => setAccountLevel(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 outline-none font-sans"
                        >
                          <option value="Basic">Basic Rank ($89/mo)</option>
                          <option value="Standard">Standard Rank ($149/mo)</option>
                          <option value="Premium VIP">Premium VIP Rank ($299/mo)</option>
                          <option value="Elite Platinum">Elite Platinum Rank ($499/mo)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold block uppercase">Active Period (Months)</label>
                        <input
                          type="number"
                          value={durationMonths}
                          onChange={(e) => setDurationMonths(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold block uppercase">Plan Expiration Date</label>
                      <input
                        type="text"
                        value={expiresDate}
                        onChange={(e) => setExpiresDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg p-2.5 outline-none text-xs"
                      />
                    </div>
                  </div>

                  {/* Deals retention triggers block */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                    <h5 className="font-bold uppercase text-rose-700 block">Retention Upselling Sequences</h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      Stall churn rates for subscribers approaching plans expiration dates. These actions automatically queue follow-up emails using pre-approved retention pathways.
                    </p>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          const code = `RENEWAL-${Math.floor(100+Math.random()*900)}`;
                          setActiveReply(`Hi ${selectedCust.name.split(' ')[0]}, your custom ${selectedCust.category} cycle approaches renewal. I have secured a local dietitian retention voucher for you! Use ${code} on renewal of your Express program path for 20% off plus free high-protein snack boxes.`);
                          setCrmSubTab('inquiries');
                          setSaveSuccessMsg('Retention deal preset loaded into Advisor chat feed!');
                          setTimeout(() => setSaveSuccessMsg(''), 4000);
                        }}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 shadow-sm"
                      >
                        ⚡ load Churn prevention Deals template
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveReply(`Hi ${selectedCust.name.split(' ')[0]}, based on your incredible consistency (${getWeightLossProgress(selectedCust)} loss milestones), you have been pre-approved for our Elite VIP status upgrade! This unlocks direct real-time chats with Sarah, priority chef cooking runs, and premium delivery timing.`);
                          setCrmSubTab('inquiries');
                          setSaveSuccessMsg('VIP status proposal loaded into chat feed!');
                          setTimeout(() => setSaveSuccessMsg(''), 4000);
                        }}
                        className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#10b981]/20 shadow-sm"
                      >
                        💎 load Premium Status Upgrade template
                      </button>
                    </div>

                    <div className="bg-slate-100/80 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Elite status adds $150 to estimated subscriber MRR calculations.</span>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleSaveSubSectionsWorkspace}
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold uppercase text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Save Subscription levels
                  </button>
                </div>

              </div>
            )}

            {/* TAB CONTENT: ACTIVE CRM INQUIRIES & CHAT FEED */}
            {crmSubTab === 'inquiries' && (
              <div className="space-y-4 animate-fadeIn">
                
                <div id="crm-chat-history-feed" className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Clinical Advisor Live Chat feed</span>
                  
                  <div className="space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1 text-xs">
                    {selectedCust.inquiriesList && selectedCust.inquiriesList.length > 0 ? (
                      selectedCust.inquiriesList.flatMap(inq => inq.messages).map((m, idx) => {
                        const isStaff = m.sender === 'staff';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[80%] ${isStaff ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[9.5px] text-[#64748b] mb-1">{isStaff ? 'Staff Care Agent' : selectedCust.name} • {m.timestamp}</span>
                            <div className={`p-3 rounded-2xl leading-relaxed text-xs shadow-sm ${
                              isStaff 
                                ? 'bg-[#10b981] text-white font-sans rounded-tr-none' 
                                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                            }`}>
                              {m.text}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl uppercase">
                        No historical chat lines logged. Type below to push first dispatch!
                      </div>
                    )}
                  </div>
                </div>

                {/* Automation AI draft triggers */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-semibold">
                    <Cpu className="w-4 h-4 text-[#10b981]" />
                    <span>Dietitian AI Automated Drafts:</span>
                  </div>

                  <div className="flex flex-wrap gap-1 md:gap-2">
                    <button
                      type="button"
                      onClick={() => handleTriggerAIDraftTemplate('allergy')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded hover:text-[#10b981] cursor-pointer"
                    >
                      🛡️ Allergy clearances draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAIDraftTemplate('plateau')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded hover:text-[#10b981] cursor-pointer"
                    >
                      🔥 Progress plateau tuning draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAIDraftTemplate('fasting')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded hover:text-[#10b981] cursor-pointer"
                    >
                      ⏱️ Fasting schedule draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerAIDraftTemplate('keto')}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded hover:text-[#10b981] cursor-pointer"
                    >
                      🥑 Keto fat tuning draft
                    </button>
                  </div>
                </div>

                {/* Advisor live draft dispatch text area input */}
                <div className="space-y-3">
                  <textarea
                    placeholder={`Compose live expert clinic advice regarding ${selectedCust.category} guidelines for ${selectedCust.name}...`}
                    value={activeReply}
                    onChange={(e) => setActiveReply(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#10b981] focus:border-[#10b981] font-sans p-3 text-slate-900 h-24 resize-none shadow-sm"
                  />
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[11px] text-[#64748b]">Pressing send updates subscriber portal dashboard directly.</span>
                    <button
                      type="button"
                      onClick={handleSendChatResponse}
                      className="px-4 py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold uppercase rounded-lg transition-all text-xs cursor-pointer shadow-sm"
                    >
                      Send Advisor Dispatch
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: CLINICAL CARE ACTION TARGETS EXECUTOR */}
            {crmSubTab === 'tasks' && (
              <div className="space-y-5 animate-fadeIn">
                
                {/* Active items task stack */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider block">Target Care Action Items Pipeline</span>
                    <span className="text-xs text-[#10b981] uppercase px-2 py-0.5 rounded bg-[#10b981]/10 border border-[#10b981]/25 font-bold">
                      {(tasksMap[selectedCust.id] || []).filter(t => t.status==='completed').length}/{(tasksMap[selectedCust.id] || []).length} COMPLETED
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto scrollbar-thin text-xs pr-1">
                    {(!tasksMap[selectedCust.id] || tasksMap[selectedCust.id].length === 0) ? (
                      <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        No targeted action items created. Add one below to launch track loop!
                      </div>
                    ) : (
                      tasksMap[selectedCust.id].map((t) => (
                        <div
                          key={t.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                            t.status === 'completed'
                              ? 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleCareTaskState(t.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                t.status === 'completed' 
                                  ? 'bg-[#10b981] border-[#10b981] text-white' 
                                  : 'border-slate-300 hover:border-[#10b981]'
                              }`}
                            >
                              {t.status === 'completed' && <Check className="w-3.5 h-3.5 text-white" />}
                            </button>

                            <div>
                              <span className={`text-[12px] block font-semibold ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                {t.title}
                              </span>
                              
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {t.category}
                                </span>
                                <span>Limit: {t.dueDate}</span>
                                <span className={`font-bold uppercase ${
                                  t.priority === 'High' ? 'text-rose-600' : t.priority === 'Medium' ? 'text-amber-600' : 'text-slate-400'
                                }`}>
                                  [{t.priority}]
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteCareTaskItem(t.id)}
                            className="px-2 py-1 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                            title="Delete targeted action item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Fast Care action creator block */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">Fast Targeted Care Action Creator</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block uppercase">Objective Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Audit soy-allergen options"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-semibold block uppercase">Action Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as any)}
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans focus:ring-1 focus:ring-[#10b981]"
                      >
                        <option value="Consultation">Clinical Consultation</option>
                        <option value="Allergy Review">Kitchen Allergen pre-check</option>
                        <option value="Diet Tuning">Diet Caloric Tuning</option>
                        <option value="Subscription">Renewal offer sequentials</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold block uppercase">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg p-2.5 outline-none font-sans focus:ring-1 focus:ring-[#10b981]"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-semibold block uppercase">Date limit</label>
                        <input
                          type="text"
                          placeholder="e.g. May 30"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 text-slate-800 rounded-lg outline-none text-xs focus:ring-1 focus:ring-[#10b981]"
                        />
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddNewTaskToClient}
                        className="w-full py-2.5 bg-[#10b981] hover:bg-[#10b981]/90 text-white font-bold uppercase text-xs tracking-wider rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Queue Care Action
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}
            </div>

            {/* Right Column: GreenBite AI Clinical Intelligence Core */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5 h-fit shadow-xs animate-fadeIn flex flex-col">
              
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 font-sans">
                <Sparkles className="w-5 h-5 text-[#10b981]" />
                <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">GreenBite AI Clinical Advisor</span>
              </div>

              {/* AI-1: Smart Customer Health Summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">AI-1: Live Health Summary</span>
                {isAiLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-full"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                      "{aiSummary || "No physical status logs mapped yet. Select customer profile to trigger synthesis."}"
                    </p>
                    {aiMealSuggestion && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-[#64748b] font-semibold uppercase">Meal Target:</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 uppercase">
                          {aiMealSuggestion}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* AI-4: Churn Risk Diagnostic Core */}
              <div className="space-y-2.5 pt-3.5 border-t border-slate-200/60 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">AI-4: Predictive Churn Level</span>
                  {aiChurnScore !== null && (
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded uppercase border ${
                      aiChurnScore > 60 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                        : aiChurnScore > 30 
                          ? 'bg-amber-50 border-amber-200 text-amber-600' 
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    }`}>
                      {aiChurnScore > 60 ? '🚨 Critical Attention' : aiChurnScore > 30 ? '⚠️ Moderate' : '🟢 Secure Plan'}
                    </span>
                  )}
                </div>

                {isAiLoading ? (
                  <div className="h-8 bg-slate-200 rounded animate-pulse w-full"></div>
                ) : (
                  <div className="space-y-2.5">
                    {aiChurnScore !== null && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Adherence Level:</span>
                          <span className="text-slate-800 font-bold">{100 - aiChurnScore}% probability</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              aiChurnScore > 60 ? 'bg-rose-500' : aiChurnScore > 30 ? 'bg-amber-500' : 'bg-[#10b981]'
                            }`}
                            style={{ width: `${100 - aiChurnScore}%` }}
                          ></div>
                        </div>
                        <span className="text-[9.5px] text-slate-400 block tracking-wide">
                          (Derived Churn Risk Signal: {aiChurnScore}%)
                        </span>
                      </div>
                    )}
                    <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-650 leading-normal shadow-2xs">
                      <span className="font-bold text-slate-705 block mb-1">AI Recommendation Action:</span>
                      {aiChurnAction || "Analyzing interaction telemetry, feedback, and expirations..."}
                    </div>
                  </div>
                )}
              </div>

              {/* AI-2 & 3: Personalized Upgrades */}
              <div className="space-y-2.5 pt-3.5 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block font-sans">AI-2 & 3: Upgrades & Goal Tracking</span>
                {isAiLoading ? (
                  <div className="space-y-1">
                    <div className="h-6 bg-slate-200 rounded animate-pulse w-full"></div>
                    <div className="h-6 bg-slate-200 rounded animate-pulse w-full"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {aiMealRecommendations.length === 0 ? (
                      <span className="text-xs text-slate-400">No active nutrient upgrades processed.</span>
                    ) : (
                      aiMealRecommendations.map((rec) => (
                        <div key={rec.category} className="p-3 bg-white border border-slate-150 rounded-xl flex items-start gap-2 text-xs shadow-2xs">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1 font-sans">
                              <span className="font-bold text-slate-800">{rec.category} Category</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (selectedCust) {
                                    handleUpdateCustomer({
                                      ...selectedCust,
                                      category: rec.category as DietCategory
                                    });
                                    setSaveSuccessMsg(`Transitioned ${selectedCust.name} plan category directly to recommended ${rec.category}.`);
                                    setTimeout(() => setSaveSuccessMsg(''), 4000);
                                  }
                                }}
                                className="text-[10px] font-bold text-[#10b981] hover:underline cursor-pointer"
                              >
                                Upgrade Plan
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-normal">{rec.reason}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Somatic Check loss target warning flags panel */}
            <div className="lg:col-span-3 pt-4 border-t border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs text-slate-500">
              <span className="text-xs">Somatic clinical dossiers conform to HIPAA & dietary security standards.</span>
              <button
                type="button"
                onClick={() => handleExportClientDossierFile(selectedCust)}
                className="py-2 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/85 text-slate-700 hover:text-[#10b981] transition-colors border border-slate-200 flex items-center gap-2 text-xs font-semibold cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Client Profile JSON
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* 📊 MODE 3: HIGH-PERFORMANCE DATA ANALYTICS & REPORTS COHORT */}
      {/* ========================================================== */}
      {viewMode === 'analytics' && (() => {
        const cohortToAnalyze = customers.filter(c => {
          if (analyticsCohortFilter === 'All') return true;
          return c.category === analyticsCohortFilter;
        });

        const totalLost = cohortToAnalyze.reduce((acc, c) => {
          const initial = c.weightTrend[0]?.weight || c.currentWeight;
          return acc + (initial - c.currentWeight);
        }, 0);
        const avgLost = cohortToAnalyze.length > 0 ? (totalLost / cohortToAnalyze.length).toFixed(1) : '0.0';

        const totalBudget = cohortToAnalyze.reduce((acc, c) => acc + c.targetKcal, 0);
        const avgBudget = cohortToAnalyze.length > 0 ? Math.round(totalBudget / cohortToAnalyze.length) : 0;
        const avgActual = cohortToAnalyze.length > 0 ? Math.round(cohortToAnalyze.reduce((acc, c) => {
          const lastCheck = c.weightTrend[c.weightTrend.length - 1];
          return acc + (lastCheck?.kcalConsumed || c.targetKcal);
        }, 0) / cohortToAnalyze.length) : 0;

        const allergicCount = cohortToAnalyze.filter(c => c.allergies && c.allergies.length > 0).length;
        const clearedAllergicCount = cohortToAnalyze.filter(c => c.allergies && c.allergies.length > 0 && allergyClearedMap[c.id]).length;
        const clearanceRate = allergicCount > 0 ? Math.round((clearedAllergicCount / allergicCount) * 100) : 100;

        let totalActionTasks = 0;
        let completedActionTasks = 0;
        cohortToAnalyze.forEach(c => {
          const tList = tasksMap[c.id] || [];
          totalActionTasks += tList.length;
          completedActionTasks += tList.filter(t => t.status === 'completed').length;
        });
        const taskCompletionRate = totalActionTasks > 0 ? Math.round((completedActionTasks / totalActionTasks) * 100) : 100;

        // Custom Diet Category breakdown
        const categoriesCount = { Keto: 0, Vegan: 0, Paleo: 0, 'High-Protein': 0, 'Low-Carb': 0 };
        cohortToAnalyze.forEach(c => {
          if (c.category in categoriesCount) {
            categoriesCount[c.category]++;
          }
        });

        // Account tier distribution
        const tiersCount = { 'Basic': 0, 'Standard': 0, 'Premium VIP': 0, 'Elite Platinum': 0 };
        cohortToAnalyze.forEach(c => {
          const tier = c.subscriptionPackage?.accountLevel || 'Standard';
          if (tier in tiersCount) {
            tiersCount[tier]++;
          }
        });

        // Inquiries volume
        const totalInquiries = cohortToAnalyze.reduce((acc, c) => acc + (c.inquiriesList?.length || 0), 0);
        const pendingInquiries = cohortToAnalyze.reduce((acc, c) => acc + (c.inquiriesList?.filter(inq => inq.status === 'In Progress')?.length || 0), 0);

        const customerAllergicCountTotalIndex = cohortToAnalyze.filter(c => c.allergies && c.allergies.length > 0).length;
        const customerAllergicCountWithPendingHoldsIndex = cohortToAnalyze.filter(c => c.allergies && c.allergies.length > 0 && !allergyClearedMap[c.id]).length;

        const handleExportAnalyticsReport = () => {
          let csv = 'ID,Name,Category,Current Weight,Target Weight,Goal Status,Health Score,Allergen Status,Remaining Tasks\n';
          cohortToAnalyze.forEach(c => {
            const h = calculateCustomerHealth(c);
            const subAl = allergyClearedMap[c.id] ? 'CLEARED' : 'HAZARD_STALL';
            const tasksOf = tasksMap[c.id] || [];
            const pendingNum = tasksOf.filter(t => t.status === 'pending').length;
            csv += `"${c.id}","${c.name}","${c.category}",${c.currentWeight},${c.targetWeight},"${h.advisory}",${h.score},"${subAl}",${pendingNum}\n`;
          });
          const dataUrl = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
          const handle = document.createElement('a');
          handle.setAttribute("href", dataUrl);
          handle.setAttribute("download", `clinical_crm_analytics_${analyticsCohortFilter}_${new Date().toISOString().split('T')[0]}.csv`);
          document.body.appendChild(handle);
          handle.click();
          handle.remove();
        };

        const handleTriggerVirtualRecalibration = () => {
          let triggerCount = 0;
          cohortToAnalyze.forEach(c => {
            const health = calculateCustomerHealth(c);
            const originalTasks = tasksMap[c.id] || [];
            if (health.score < 50 && !originalTasks.some(t => t.title.includes('Emergency wellness advisory intervention'))) {
              const emergencyTask: CareTask = {
                id: `T-EMER-${Math.floor(100+Math.random()*900)}`,
                title: 'Emergency wellness advisory intervention: Caloric rebalance',
                status: 'pending',
                dueDate: 'Immediate',
                priority: 'High',
                category: 'Diet Tuning'
              };
              setTasksMap(prev => ({
                ...prev,
                [c.id]: [...(prev[c.id] || []), emergencyTask]
              }));
              addAuditLog(c.id, c.name, `AI AUTOMATION: Generated emergency dietary intervention task due to critical cohort score (${health.score}%)`, 'task_update');
              triggerCount++;
            }
          });

          setSaveSuccessMsg(`Clinical AI run completed successfully! Triggered priority wellness advisories for ${triggerCount} high-risk subscribers in this cohort.`);
          setTimeout(() => setSaveSuccessMsg(''), 5050);
        };

        return (
          <div id="crm-analytics-block" className="space-y-6 animate-fadeIn">
            
            {/* Dashboard Controls Sub-header */}
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-200 text-zinc-900'
            }`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-wider">Cohort Isolation Filter:</span>
                <div className="flex flex-wrap bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider font-mono text-zinc-400">
                  {(['All', 'Keto', 'Vegan', 'Paleo', 'High-Protein', 'Low-Carb'] as const).map(cat => {
                    const count = cat === 'All' ? customers.length : customers.filter(c => c.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAnalyticsCohortFilter(cat)}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          analyticsCohortFilter === cat ? 'bg-zinc-800 text-[#1ed760] font-black' : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch md:self-auto">
                <button
                  type="button"
                  onClick={handleTriggerVirtualRecalibration}
                  className="flex-1 md:flex-none py-2 px-3 border border-dashed border-emerald-500/30 hover:border-emerald-500 bg-[#1ed760]/10 hover:bg-[#1ed760]/25 text-[#1ed760] rounded-lg transition-all text-[10px] tracking-widest uppercase font-black font-mono cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                  AI Sync Diagnoses
                </button>

                <button
                  type="button"
                  onClick={handleExportAnalyticsReport}
                  className="flex-1 md:flex-none py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-350 hover:text-white transition-colors border border-zinc-800 flex items-center justify-center gap-1.5 text-[10px] uppercase font-black font-mono cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Metrics CSV
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Average Weight Progress */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                darkMode ? 'bg-[#121214] border-zinc-850 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingDown className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Avg Cohort Weight-Loss</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black font-mono">{avgLost} kg</span>
                    <span className="text-[10px] text-emerald-505 font-mono">cumulative</span>
                  </div>
                </div>
              </div>

              {/* Energy Drift Gap */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                darkMode ? 'bg-[#121214] border-zinc-850 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Calorie Target vs Intake</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black font-mono">{avgBudget} / {avgActual}</span>
                    <span className="text-[9px] text-[#9ca3af] font-mono">kcal</span>
                  </div>
                </div>
              </div>

              {/* Allergen Clearance Check */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                darkMode ? 'bg-[#121214] border-zinc-850 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Allergies Secure Pass Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black font-mono">{clearanceRate}%</span>
                    <span className="text-[9px] text-cyan-405 font-mono">cleared</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Task Complete Rate */}
              <div className={`p-4 rounded-xl border flex items-center gap-4 ${
                darkMode ? 'bg-[#121214] border-zinc-850 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">Care Tasks Complete Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black font-mono">{taskCompletionRate}%</span>
                    <span className="text-[9px] text-purple-400 font-mono">SLA checklist</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Sub-tab Selection */}
            <div className="flex max-w-full overflow-x-auto border-b border-zinc-800 font-mono text-[10.5px]">
              {(['health', 'diet', 'revenue', 'crm'] as const).map(tab => {
                const labelMap = {
                  health: '🧬 Metabolic & Patient Health',
                  diet: '🍽️ Cohort Diet Distribution',
                  revenue: '💰 Account Levels & Retention',
                  crm: '💬 Interaction SLA Performance'
                };
                const isActive = analyticsTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAnalyticsTab(tab)}
                    className={`px-4 py-2.5 font-bold uppercase transition-all shrink-0 border-b-2 tracking-wide -mb-[2px] ${
                      isActive 
                        ? 'text-[#1ed760] border-[#1ed760]' 
                        : 'text-zinc-500 border-transparent hover:text-zinc-300'
                    }`}
                  >
                    {labelMap[tab]}
                  </button>
                );
              })}
            </div>

            {/* Sub-tab Content Area */}
            {analyticsTab === 'health' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Average Progress toward Target weight Card */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Weight Management Target Metrics</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Comparing starting weight vs current weight progression and tracking stagnant targets needing calibration.
                  </p>

                  <div className="space-y-4">
                    {cohortToAnalyze.length === 0 ? (
                      <div className="py-12 text-center text-zinc-600 border border-dashed border-zinc-850 rounded-xl uppercase font-mono text-[10px]">
                        No subscribers registered in selected category.
                      </div>
                    ) : (
                      cohortToAnalyze.map(c => {
                        const scoreStats = calculateCustomerHealth(c);
                        const progress = getWeightLossProgress(c);
                        const startWt = c.weightTrend[0]?.weight || c.currentWeight;
                        const lost = (startWt - c.currentWeight).toFixed(1);
                        
                        // Percentage tracking towards weight loss delta
                        const diffToGoal = Math.abs(c.currentWeight - c.targetWeight);
                        const baseDiff = Math.abs(startWt - c.targetWeight);
                        const percentComplete = baseDiff > 0 ? Math.round(Math.min(100, Math.max(0, ((baseDiff - diffToGoal) / baseDiff) * 100))) : 100;

                        return (
                          <div key={c.id} className="space-y-1.5 p-3 rounded-lg bg-zinc-950/40 border border-zinc-900">
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="font-extrabold text-zinc-200">{c.name} <span className="text-[9px] text-zinc-500 select-none">({c.id})</span></span>
                              <span className="font-bold text-[#1ed760]">{percentComplete}% target achieved</span>
                            </div>

                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-[#1ed760] h-1.5 rounded-full transition-all duration-500" 
                                style={{ width: `${percentComplete}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center text-[10.5px] font-mono text-zinc-500">
                              <span>Loss: <strong className="text-zinc-300">{lost}kg</strong> (Start: {startWt}kg → Now: {c.currentWeight}kg)</span>
                              <span>Goal: <strong className="text-[#1ed760]">{c.targetWeight}kg</strong></span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Cohort Health Index & Status Distribution */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Clinical Patient Health Analysis</span>
                  <p className="text-[10px] text-zinc-500 leading-normal font-sans">
                    Categorization of active subscribers according to overall health integrity scores, unresolved allergens, and intake risk indices.
                  </p>

                  <div className="space-y-4">
                    {(() => {
                      const critical = cohortToAnalyze.filter(c => calculateCustomerHealth(c).score < 50).length;
                      const stall = cohortToAnalyze.filter(c => { const s = calculateCustomerHealth(c).score; return s >= 50 && s < 75; }).length;
                      const optimal = cohortToAnalyze.filter(c => calculateCustomerHealth(c).score >= 75).length;
                      const total = cohortToAnalyze.length || 1;

                      const pctCritical = Math.round((critical / total) * 100);
                      const pctStall = Math.round((stall / total) * 100);
                      const pctOptimal = Math.round((optimal / total) * 100);

                      return (
                        <div className="space-y-4">
                          
                          {/* Segment bar */}
                          <div className="w-full rounded-full h-4 overflow-hidden flex font-mono text-[9px] text-zinc-950 font-black">
                            {critical > 0 && <div className="bg-rose-500 flex items-center justify-center transition-all duration-300" style={{ width: `${pctCritical}%` }} title="Critical risk">{pctCritical}%</div>}
                            {stall > 0 && <div className="bg-amber-500 flex items-center justify-center transition-all duration-300" style={{ width: `${pctStall}%` }} title="Stall attention">{pctStall}%</div>}
                            {optimal > 0 && <div className="bg-emerald-500 flex items-center justify-center transition-all duration-300" style={{ width: `${pctOptimal}%` }} title="Optimal progress">{pctOptimal}%</div>}
                          </div>

                          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-mono">
                            <div className="p-2.5 rounded-xl bg-rose-955/20 border border-rose-500/10 space-y-1">
                              <span className="text-rose-500 font-extrabold text-[10px] block uppercase">CRITICAL</span>
                              <p className="text-xl font-bold text-white font-mono">{critical}</p>
                              <span className="text-[9px] text-zinc-500 block">Requires Shift</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-amber-955/20 border border-amber-500/10 space-y-1">
                              <span className="text-amber-500 font-extrabold text-[10px] block uppercase">STALLED</span>
                              <p className="text-xl font-bold text-white font-mono">{stall}</p>
                              <span className="text-[9px] text-zinc-500 block">Metabolic Stall</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-emerald-955/20 border border-emerald-500/10 space-y-1">
                              <span className="text-[#1ed760] font-extrabold text-[10px] block uppercase">OPTIMAL</span>
                              <p className="text-xl font-bold text-white font-mono">{optimal}</p>
                              <span className="text-[9px] text-zinc-500 block">No Blocks</span>
                            </div>
                          </div>

                          {/* Allergy Hold checklist summary */}
                          <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900 flex items-center justify-between text-xs font-mono text-zinc-400">
                            <span className="flex items-center gap-1.5 font-bold">
                              <ShieldAlert className="w-4 h-4 text-rose-500" />
                              Subscribers with unresolved food blocks:
                            </span>
                            <span className="font-extrabold text-white">{customerAllergicCountWithPendingHoldsIndex} / {customerAllergicCountTotalIndex}</span>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                </div>

              </div>
            )}

            {analyticsTab === 'diet' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Diet Programs distribution breakdown */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Cohort Subscription Distribution</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Reviewing relative registration weights of dietary packages selected during clinician intake setup.
                  </p>

                  <div className="space-y-3 pt-2">
                    {Object.entries(categoriesCount).map(([cat, val]) => {
                      const total = cohortToAnalyze.length || 1;
                      const percentage = Math.round((val / total) * 100);

                      let colorBar = 'bg-cyan-500';
                      if (cat === 'Keto') colorBar = 'bg-amber-500';
                      if (cat === 'Vegan') colorBar = 'bg-emerald-500';
                      if (cat === 'Paleo') colorBar = 'bg-orange-550';
                      if (cat === 'High-Protein') colorBar = 'bg-purple-500';

                      return (
                        <div key={cat} className="space-y-1 font-mono text-xs">
                          <div className="flex justify-between items-center text-zinc-450 text-[11px]">
                            <span className="font-extrabold text-zinc-300">{cat} Programs</span>
                            <span>{val} subscriber{val !== 1 ? 's' : ''} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-zinc-900 rounded-full class h-2.5 overflow-hidden">
                            <div className={`${colorBar} h-2.5 rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Macro Target Demographics Comparative Analysis */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Caloric Target Benchmarks</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Average target calorie allowance limits configured for subscribers vs the actual limits inputted on core checks.
                  </p>

                  <div className="p-5 rounded-xl bg-zinc-950/60 border border-zinc-900 flex flex-col justify-center items-center py-8 space-y-6">
                    
                    {/* SVG Metric Circle visualization */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg width="144" height="144" viewBox="0 0 144 144" className="transform -rotate-90">
                        <circle cx="72" cy="72" r="60" fill="transparent" stroke="#18181b" strokeWidth="8" />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="60" 
                          fill="transparent" 
                          stroke="#1ed760" 
                          strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 60}
                          strokeDashoffset={2 * Math.PI * 60 * (1 - Math.min(1, avgActual / (avgBudget || 2000)))}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center space-y-0.5">
                        <span className="text-2xl font-black font-mono tracking-tight text-white">{avgActual}</span>
                        <span className="text-[9px] text-zinc-500 font-mono block uppercase border-t border-zinc-800 pt-0.5">Target {avgBudget}</span>
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-2 text-center text-xs font-mono border-t border-zinc-900/40 pt-4">
                      <div>
                        <span className="text-zinc-550 block text-[9px] uppercase">Avg Prescribed Target</span>
                        <strong className="text-white text-base font-bold">{avgBudget} kcal/day</strong>
                      </div>
                      <div>
                        <span className="text-zinc-550 block text-[9px] uppercase">Avg Active Progress</span>
                        <strong className="text-[#1ed760] text-base font-bold">{avgActual} kcal/day</strong>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {analyticsTab === 'revenue' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Account Premium Tier Spread */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Subscriber Tier Breakdown</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Evaluating density profile levels indicating support tier configurations and service plan targets.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {Object.entries(tiersCount).map(([tier, count]) => {
                      let tierLabel = 'Standard Customer';
                      let tierStyle = 'border-zinc-800 bg-zinc-950/20';
                      let badge = 'bg-zinc-850 text-zinc-400';

                      if (tier === 'Premium VIP') {
                        tierLabel = 'Direct Chat Activated';
                        tierStyle = 'border-emerald-500/10 bg-emerald-950/5';
                        badge = 'bg-[#1ed760]/10 text-[#1ed760]';
                      } else if (tier === 'Elite Platinum') {
                        tierLabel = 'Priority Courier Assigned';
                        tierStyle = 'border-purple-500/15 bg-purple-950/5';
                        badge = 'bg-purple-500/10 text-purple-400';
                      } else if (tier === 'Basic') {
                        tierLabel = 'Core Food Logs';
                      }

                      return (
                        <div key={tier} className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 font-mono ${tierStyle}`}>
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-zinc-300 text-xs block">{tier}</span>
                            <span className={`text-[8.5px] font-extrabold px-1.5 py-0.2 rounded uppercase ${badge}`}>x{count}</span>
                          </div>
                          <span className="text-[9.5px] text-zinc-500 block leading-tight">{tierLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subscriptions Renewals and Warnings Panel */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-rose-455 uppercase block tracking-wider font-mono flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-500" />
                    Subscription Renewal Warning Board
                  </span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Following list displays subscriber packages expiring within the current calendar block or pending clinician care plan extensions.
                  </p>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {cohortToAnalyze.length === 0 ? (
                      <div className="py-12 text-center text-zinc-600 border border-dashed border-zinc-850 rounded-xl uppercase font-mono text-[10px]">
                        No profiles recorded.
                      </div>
                    ) : (
                      cohortToAnalyze.map(c => {
                        const pkg = c.subscriptionPackage;
                        const expireTime = pkg?.expiresDate ? new Date(pkg.expiresDate).getTime() : 0;
                        const nowTime = new Date('2026-05-27').getTime();
                        const daysLeft = Math.ceil((expireTime - nowTime) / (1000 * 60 * 60 * 24));
                        
                        let warningText = 'Safe Period';
                        let styleClass = 'hover:border-zinc-805 border-zinc-900 bg-zinc-950/10 text-zinc-400';

                        if (daysLeft < 0) {
                          warningText = 'EXPIRED PLAN';
                          styleClass = 'border-rose-500/20 bg-rose-950/10 text-rose-400';
                        } else if (daysLeft < 20) {
                          warningText = `RENEWAL DUE: EXPIRES IN ${daysLeft} DAYS`;
                          styleClass = 'border-amber-500/20 bg-amber-950/10 text-[#d97706]';
                        } else if (daysLeft < 50) {
                          warningText = `Moderate: Expires in ${daysLeft} days`;
                          styleClass = 'border-cyan-500/20 bg-cyan-950/10 text-cyan-400';
                        }

                        return (
                          <div key={c.id} className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs transition-all ${styleClass}`}>
                            <div className="space-y-0.5">
                              <span className="font-extrabold text-zinc-200 block">{c.name} ({c.id})</span>
                              <span className="text-[9px] text-zinc-500 block uppercase">{pkg?.packageName || 'Plan general'} • {pkg?.accountLevel || 'Standard'}</span>
                            </div>
                            <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                              {warningText}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {analyticsTab === 'crm' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Chat Inquiries Response Metrics */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Chat Response Performance SLA</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Verification log indicates volumes of inquiries, current active responses, and open triage status counts.
                  </p>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-zinc-950/40 border border-zinc-900 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-500 font-mono uppercase block">Total Queries</span>
                      <strong className="text-xl font-mono text-white block">{totalInquiries}</strong>
                    </div>

                    <div className="p-3 bg-zinc-950/40 border border-zinc-905 rounded-xl space-y-1">
                      <span className="text-[8px] text-zinc-400 font-mono uppercase block">Active Triage</span>
                      <strong className="text-xl font-mono text-cyan-400 block">{pendingInquiries}</strong>
                    </div>

                    <div className="p-3 bg-[#1ed760]/5 border border-emerald-500/10 rounded-xl space-y-1">
                      <span className="text-[8px] text-[#1ed760] font-mono uppercase block">Response SLA</span>
                      <strong className="text-xl font-mono text-emerald-400 block">
                        {totalInquiries > 0 ? Math.round(((totalInquiries - pendingInquiries) / totalInquiries) * 100) : 100}%
                      </strong>
                    </div>
                  </div>

                  {/* List of outstanding inquiries with direct shortcut responses */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block font-mono pl-1">Outbound Communication Queue</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {cohortToAnalyze.length === 0 ? (
                        <div className="py-8 text-center text-zinc-650 uppercase font-mono text-[9px] border border-dashed border-zinc-850 rounded-lg">No records</div>
                      ) : (
                        (() => {
                          const queryRows: { name: string; id: string; lastMsg: string; timestamp: string }[] = [];
                          cohortToAnalyze.forEach(c => {
                            if (c.inquiriesList && c.inquiriesList.length > 0) {
                              const lastInq = c.inquiriesList[c.inquiriesList.length - 1];
                              const lastMsg = lastInq.messages[lastInq.messages.length - 1];
                              if (lastMsg) {
                                queryRows.push({
                                  name: c.name,
                                  id: c.id,
                                  lastMsg: lastMsg.text,
                                  timestamp: lastInq.timestamp
                                });
                              }
                            }
                          });

                          if (queryRows.length === 0) {
                            return <div className="py-8 text-center text-zinc-550 font-mono text-[9px]">No open query threads in this cohort subset. All cleared!</div>;
                          }

                          return queryRows.map((q, i) => (
                            <div key={i} className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-900 text-[10.5px] font-mono flex justify-between items-start gap-2.5">
                              <div className="space-y-0.5 max-w-[75%]">
                                <span className="font-extrabold text-zinc-200">{q.name} ({q.id})</span>
                                <p className="text-[9.5px] text-zinc-500 truncate" title={q.lastMsg}>"{q.lastMsg}"</p>
                              </div>
                              <span className="text-[8px] text-zinc-500 shrink-0 uppercase">{q.timestamp}</span>
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </div>
                </div>

                {/* Patient Care Tasks execution dashboard */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white border-zinc-205 text-zinc-900'
                }`}>
                  <span className="text-xs font-bold text-[#1ed760] uppercase block tracking-wider font-mono">Clinician Action Item Performance</span>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Displays cumulative completion records of daily meal-tuning, safety audits, and onboarding procedures.
                  </p>

                  <div className="space-y-3">
                    {(() => {
                      // Group task count by category
                      const totals = { 'Allergy Review': 0, 'Diet Tuning': 0, 'Consultation': 0, 'Subscription': 0 };
                      const completed = { 'Allergy Review': 0, 'Diet Tuning': 0, 'Consultation': 0, 'Subscription': 0 };

                      cohortToAnalyze.forEach(c => {
                        const list = tasksMap[c.id] || [];
                        list.forEach(t => {
                          const cat = t.category;
                          if (cat in totals) {
                            totals[cat]++;
                            if (t.status === 'completed') {
                              completed[cat]++;
                            }
                          }
                        });
                      });

                      return (Object.keys(totals) as Array<keyof typeof totals>).map(cat => {
                        const totValue = totals[cat];
                        const compValue = completed[cat];
                        const pctDone = totValue > 0 ? Math.round((compValue / totValue) * 100) : 100;

                        return (
                          <div key={cat} className="space-y-1 font-mono text-xs">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="font-extrabold text-zinc-300">{cat} Care Tasks</span>
                              <span className="text-zinc-500">{compValue} of {totValue} done ({pctDone}%)</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-[#a855f7] h-1.5 rounded-full transition-all" style={{ width: `${pctDone}%` }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>
            )}

          </div>
        );
      })()}

      {/* ========================================================== */}
      {/* 📜 PART 4: AUTOMATION RULES & COHORT INTERACTION AUDIT TRAIL */}
      {/* ========================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Clinician Workflow Rules Setup */}
        <div className={`xl:col-span-5 p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white text-zinc-900'
        }`}>
          <div className="flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-[#1ed760]" />
            <h4 className="text-xs font-mono font-black tracking-widest uppercase text-zinc-300">Clinician Automation Rule Suite</h4>
          </div>
          <p className="text-[10px] text-zinc-500 leading-normal font-sans">
            Fine-tune automated triggers that shift clients into specific workflow pipelines based on clinical entries.
          </p>

          <div className="space-y-3.5 text-xs font-mono">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-extrabold block text-zinc-200 uppercase text-[10.5px]">Auto-triage Allergen Hazards</span>
                <p className="text-[9px] text-[#9ca3af] mt-0.5">Push new client with ingredients warnings straight to Nutritional Assessment stage.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutomationRules(prev => ({ ...prev, autoTriageAllergy: !prev.autoTriageAllergy }))}
                className={`p-1 px-2.5 rounded text-[8.5px] font-black uppercase transition-all ${
                  automationRules.autoTriageAllergy 
                    ? 'bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/30' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {automationRules.autoTriageAllergy ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 pt-3 border-t border-zinc-900/40">
              <div>
                <span className="font-extrabold block text-zinc-200 uppercase text-[10.5px]">Caloric excess log alerts</span>
                <p className="text-[9px] text-[#9ca3af] mt-0.5">Generate warning logs if check-ins overshoot programmed calorie budgets by +200 kcal.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutomationRules(prev => ({ ...prev, criticalLogOncheckin: !prev.criticalLogOncheckin }))}
                className={`p-1 px-2.5 rounded text-[8.5px] font-black uppercase transition-all ${
                  automationRules.criticalLogOncheckin 
                    ? 'bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/30' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {automationRules.criticalLogOncheckin ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            <div className="flex items-start justify-between gap-3 pt-3 border-t border-zinc-900/40">
              <div>
                <span className="font-extrabold block text-zinc-200 uppercase text-[10.5px]">Auto onboarding action tasks</span>
                <p className="text-[9px] text-[#9ca3af] mt-0.5">Pre-fill standard consultation checklists on client stage assignments.</p>
              </div>
              <button
                type="button"
                onClick={() => setAutomationRules(prev => ({ ...prev, autoGenerateOnboardingTasks: !prev.autoGenerateOnboardingTasks }))}
                className={`p-1 px-2.5 rounded text-[8.5px] font-black uppercase transition-all ${
                  automationRules.autoGenerateOnboardingTasks 
                    ? 'bg-[#1ed760]/10 text-[#1ed760] border border-[#1ed760]/30' 
                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                }`}
              >
                {automationRules.autoGenerateOnboardingTasks ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

          </div>
        </div>

        {/* 📜 Clinical Interactions Audit Log Table list */}
        <div id="crm-[#1ed760]-clinical-audit-logs" className={`xl:col-span-7 p-5 rounded-2xl border space-y-4 ${
          darkMode ? 'bg-[#111113] border-zinc-850 text-white' : 'bg-white text-zinc-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4.5 h-4.5 text-cyan-400" />
              <h4 className="text-xs font-mono font-black tracking-widest uppercase text-zinc-300">Subscriber Activity Audit Trail</h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuditLogs([]);
                setSaveSuccessMsg('Clinical interactions logs cleared.');
                setTimeout(() => setSaveSuccessMsg(''), 3000);
              }}
              className="text-[9px] font-mono text-zinc-500 hover:text-rose-455 uppercase hover:underline"
            >
              Clear log trail
            </button>
          </div>

          <div className="space-y-2.5 max-h-[195px] overflow-y-auto scrollbar-thin text-[10px] font-mono pr-1">
            {auditLogs.length === 0 ? (
              <div className="py-12 text-center text-zinc-650 border border-dashed border-zinc-850 rounded-xl uppercase">
                Audit is empty. Move subscriber stages or perform logs above to initialize pipeline trail.
              </div>
            ) : (
              auditLogs.map(log => {
                let badgeStyle = 'text-cyan-400 bg-cyan-950/20 border border-cyan-500/10';
                if (log.type === 'allergy_clearance') badgeStyle = 'text-emerald-400 bg-emerald-950/20 border border-emerald-500/10';
                if (log.type === 'checkin') badgeStyle = 'text-yellow-450 bg-yellow-950/20 border border-yellow-500/10';
                if (log.type === 'manual_add') badgeStyle = 'text-purple-400 bg-purple-950/20 border border-purple-500/10';

                return (
                  <div key={log.id} className="p-2.5 rounded-lg bg-zinc-950/50 border border-zinc-900 hover:border-zinc-850 transition-all flex items-start gap-3">
                    <span className="text-zinc-600 shrink-0 select-none">{log.timestamp}</span>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${badgeStyle}`}>
                          {log.type.replace('_', ' ')}
                        </span>
                        <strong className="text-zinc-300 font-extrabold">{log.customerName} ({log.customerId})</strong>
                      </div>
                      <p className="text-zinc-400 text-[9.5px] leading-relaxed">{log.event}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      {/* ========================================================== */}
      {/* 🚀 FIX 4: CLIENT PROFILE SLIDEOUT DRAWER FROM THE RIGHT    */}
      {/* ========================================================== */}
      {isDrawerOpen && selectedCust && (
        <>
          {/* Backdrop/Overlay with 40% black opacity */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 animate-fadeIn"
          />

          {/* Sliding Drawer component - 400px wide */}
          <div 
            className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-55 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-200 animate-slideInRight"
          >
            {/* Header section (Name, Customer Code, Meal Plan Badge, Close button) */}
            <div className="p-5 border-b border-slate-150 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[18px] text-slate-850 tracking-tight leading-none">
                    {selectedCust.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#10b981] border border-emerald-100 text-[10px] font-bold">
                    {selectedCust.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Code: <strong className="font-semibold text-slate-700">{selectedCust.customer_code || selectedCust.id}</strong>
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 px-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-150 transition-all font-mono font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stats Row (Weight, Height, BMI, Health Score) */}
            <div className="p-4 bg-emerald-50/30 border-b border-emerald-100/60 grid grid-cols-4 gap-2 text-center select-none">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Weight</span>
                <span className="text-xs font-bold text-slate-755 block font-mono">{selectedCust.currentWeight}kg</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Height</span>
                <span className="text-xs font-bold text-slate-755 block font-mono">
                  {selectedCust.physicalStatus?.heightCm || selectedCust.physicalStatus?.height || 170}cm
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">BMI</span>
                <span className="text-xs font-bold text-slate-755 block font-mono">
                  {(() => {
                    const w = selectedCust.currentWeight || 70;
                    const h = selectedCust.physicalStatus?.heightCm || selectedCust.physicalStatus?.height || 170;
                    return (w / ((h / 100) * (h / 100))).toFixed(1);
                  })()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Health</span>
                <span className="text-xs font-bold text-slate-755 block font-mono">
                  {calculateCustomerHealth(selectedCust).score}%
                </span>
              </div>
            </div>

            {/* Tab selection menu */}
            <div className="flex border-b border-slate-150 text-[11px] font-bold text-slate-500 bg-white shadow-sm overflow-x-auto shrink-0 scrollbar-none">
              {[
                { key: 'profile', label: 'Profile' },
                { key: 'health', label: 'Health' },
                { key: 'packages', label: 'Packages' },
                { key: 'messages', label: 'Messages' },
                { key: 'feedback', label: 'Feedback' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setDrawerTab(tab.key as any)}
                  className={`flex-1 min-w-[65px] py-3 text-center border-b-2 font-bold cursor-pointer transition-all ${
                    drawerTab === tab.key 
                      ? 'border-[#10b981] text-[#10b981] bg-emerald-50/10 font-bold' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Tab Content Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* 1. Profile Tab */}
              {drawerTab === 'profile' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Personal Dossier</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                      <span className="text-slate-800 font-semibold">{selectedCust.name}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Facebook Name</span>
                      <span className="text-slate-800 font-semibold">{selectedCust.facebook_name || 'N/A'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                      <span className="text-slate-800 font-semibold">{selectedCust.gender || 'Female'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                      <span className="text-slate-800 font-semibold">{selectedCust.phone}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                      <span className="text-slate-800 font-semibold truncate block">{selectedCust.email}</span>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold font-mono">Address</span>
                      <span className="text-slate-800 font-semibold leading-relaxed block">{selectedCust.address || 'N/A'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch</span>
                      <span className="text-slate-800 font-semibold">{selectedCust.branch || 'Central Branch'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Client Source</span>
                      <span className="text-slate-800 font-semibold">Organic (Ad Campaign)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Health Tab */}
              {drawerTab === 'health' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Physical & Clinical Bio</h4>
                  <div className="space-y-4 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Medical Condition</span>
                      <p className="text-slate-800 font-semibold">
                        {selectedCust.healthProfile?.medicalCondition || selectedCust.healthProfile?.medical_condition || 'No diagnosed clinical conditions.'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Medicines</span>
                      {selectedCust.healthProfile?.medicineTaking || selectedCust.healthProfile?.medicine_taking ? (
                        <div className="p-3 bg-red-50 border border-red-150 text-red-700 rounded-xl space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded text-[9px] font-bold uppercase select-none">
                            ⚠ Medicine Alert
                          </span>
                          <p className="font-semibold text-xs mt-1">
                            {selectedCust.healthProfile.medicineTaking || selectedCust.healthProfile.medicine_taking}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 italic">No daily medication logged.</p>
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Special Request Notes</span>
                      <p className="text-slate-800 font-normal leading-relaxed">
                        {selectedCust.healthProfile?.specialRequests || selectedCust.healthProfile?.special_requests || 'No custom kitchen requests logged.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Lifestyle Activity</span>
                        <p className="text-slate-800 font-semibold">
                          {selectedCust.lifestyle?.activityLevel || selectedCust.lifestyle?.activity_level || 'Moderate Active'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Somatic Exclusions</span>
                        <p className="text-slate-800 font-semibold truncate">
                          {selectedCust.lifestyle?.foot_condition || 'Standard foot index'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Packages Tab */}
              {drawerTab === 'packages' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Subscription Contracts</h4>
                  
                  {!isAssigningPackage ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Plan</span>
                            <span className="text-sm font-bold text-slate-800">
                              {selectedCust.subscriptionPackage?.packageName || 'No active contracts'}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                            {selectedCust.subscriptionPackage?.accountLevel || 'Basic Account'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] font-medium text-slate-500">
                          <span>Expiry date:</span>
                          <span className="text-slate-800 font-bold font-mono">
                            {selectedCust.subscriptionPackage?.expiresDate || 'No Contract'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAssigningPackage(true)}
                        className="w-full py-2.5 bg-[#10b981] hover:bg-[#10b981]/95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        Assign New Package
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 text-xs font-medium">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] uppercase block">Package Name</label>
                        <input
                          type="text"
                          value={newPkgName}
                          onChange={(e) => setNewPkgName(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold text-slate-850"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] uppercase block">Account Level</label>
                        <select
                          value={newPkgLevel}
                          onChange={(e) => setNewPkgLevel(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold text-slate-850 cursor-pointer"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Standard">Standard</option>
                          <option value="Premium VIP">Premium VIP</option>
                          <option value="Elite Platinum">Elite Platinum</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] uppercase block">Duration in Months</label>
                        <select
                          value={newPkgMonths}
                          onChange={(e) => setNewPkgMonths(Number(e.target.value))}
                          className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold text-slate-850 cursor-pointer"
                        >
                          <option value="1">1 Month Contract</option>
                          <option value="3">3 Months Contract</option>
                          <option value="6">6 Months Contract</option>
                          <option value="12">1 Year VIP Exclusive</option>
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAssigningPackage(false)}
                          className="flex-1 py-2 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold hover:bg-slate-100 text-center"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = {
                              ...selectedCust,
                              subscriptionPackage: {
                                packageName: newPkgName,
                                accountLevel: newPkgLevel,
                                durationMonths: newPkgMonths,
                                expiresDate: new Date(Date.now() + newPkgMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                status: 'active'
                              }
                            };
                            handleUpdateCustomer(updated);
                            setSelectedCust(updated);
                            setIsAssigningPackage(false);
                            showToast("✓ Subscriber package updated successfully", "success");
                          }}
                          className="flex-1 py-2 bg-[#10b981] text-white rounded-lg font-bold hover:bg-[#10b981]/90 text-center cursor-pointer"
                        >
                          Save Package
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Messages Tab */}
              {drawerTab === 'messages' && (
                <div className="space-y-4 flex flex-col h-[320px] animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Client Chat Threads</h4>
                  
                  <div className="flex-1 overflow-y-auto space-y-2.5 p-1 text-xs">
                    {(() => {
                      const assocInquiry = inquiries.find(inq => inq.customer_id === selectedCust.id || inq.id === selectedCust.inquiry_id);
                      const defaultMessages: any[] = [
                        { sender: 'customer', text: 'Hi! I would like to set up a subscription for Busy Boss Diet.' },
                        { sender: 'staff', text: 'Hello! I am happy to help you select a package and customize today.' }
                      ];
                      const chatMessages: any[] = assocInquiry?.messages?.length ? assocInquiry.messages : defaultMessages;

                      return chatMessages.map((msg, i) => {
                        const isStaff = msg.sender === 'staff' || msg.sender_type === 'staff';
                        return (
                          <div 
                            key={i} 
                            className={`flex flex-col max-w-[85%] ${isStaff ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                          >
                            <span className="text-[9px] text-slate-400 font-semibold px-1 select-none">
                              {isStaff ? 'Operator' : selectedCust.name}
                            </span>
                            <div className={`p-2.5 rounded-2xl mt-0.5 text-xs font-medium leading-relaxed shadow-sm ${
                              isStaff 
                                ? 'bg-[#10b981] text-white rounded-tr-none' 
                                : 'bg-slate-100 text-slate-800 rounded-tl-none'
                            }`}>
                              {msg.text || msg.message_text}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Send chat input controls */}
                  <div className="flex gap-1.5 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      placeholder="Type response to subscriber..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const text = chatInput.trim();
                          if (!text) return;
                          const assocInquiry = inquiries.find(inq => inq.customer_id === selectedCust.id || inq.id === selectedCust.inquiry_id);
                          if (assocInquiry) {
                            const updatedInq = {
                              ...assocInquiry,
                              messages: [...assocInquiry.messages, { sender: 'staff' as const, text, timestamp: new Date().toISOString() }]
                            };
                            handleUpdateInquiry(updatedInq);
                          }
                          addAuditLog(selectedCust.id, selectedCust.name, `Sent communication message: "${text}"`, 'chat_sent');
                          setChatInput('');
                          showToast("✓ Chat message sent to customer", "success");
                        }
                      }}
                      className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs focus:ring-1 focus:ring-[#10b981] focus:bg-white text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const text = chatInput.trim();
                        if (!text) return;
                        const assocInquiry = inquiries.find(inq => inq.customer_id === selectedCust.id || inq.id === selectedCust.inquiry_id);
                        if (assocInquiry) {
                          const updatedInq = {
                            ...assocInquiry,
                            messages: [...assocInquiry.messages, { sender: 'staff' as const, text, timestamp: new Date().toISOString() }]
                          };
                          handleUpdateInquiry(updatedInq);
                        }
                        addAuditLog(selectedCust.id, selectedCust.name, `Sent communication message: "${text}"`, 'chat_sent');
                        setChatInput('');
                        showToast("✓ Chat message sent to customer", "success");
                      }}
                      className="px-3 py-2 bg-[#10b981] hover:bg-[#10b981]/90 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* 5. Feedback Tab */}
              {drawerTab === 'feedback' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subscriber Feedback Log</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerFeedbackText('');
                        setDrawerFeedbackPin(false);
                        setShowAddDrawerFeedback(!showAddDrawerFeedback);
                      }}
                      className="text-[#10b981] hover:underline text-xs font-bold"
                    >
                      {showAddDrawerFeedback ? 'Cancel' : '+ Add Feedback'}
                    </button>
                  </div>

                  {showAddDrawerFeedback && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs font-medium">
                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] uppercase block font-bold">Feedback Type</label>
                        <select
                          value={drawerFeedbackType}
                          onChange={(e) => setDrawerFeedbackType(e.target.value as any)}
                          className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white cursor-pointer font-semibold text-slate-800"
                        >
                          <option value="general">General Review</option>
                          <option value="inquiry">Client Complaint</option>
                          <option value="recommendation">Diet Recommendation</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px] uppercase block font-bold">Feedback Comments</label>
                        <textarea
                          rows={3}
                          placeholder="Log feedback comments..."
                          value={drawerFeedbackText}
                          onChange={(e) => setDrawerFeedbackText(e.target.value)}
                          className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-800 resize-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 select-none cursor-pointer">
                        <input
                          type="checkbox"
                          id="pinpoint-on-dashboard-drawer"
                          checked={drawerFeedbackPin}
                          onChange={(e) => setDrawerFeedbackPin(e.target.checked)}
                          className="w-4 h-4 text-[#10b981] border-slate-200 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                        <label htmlFor="pinpoint-on-dashboard-drawer" className="text-slate-600 block text-xs cursor-pointer">
                          Flag as Pinpoint on Dashboard Radar
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!drawerFeedbackText.trim()) return;
                          if (handleAddFeedback) {
                            handleAddFeedback({
                              customer_id: selectedCust.id,
                              customer_name: selectedCust.name,
                              feedback_type: drawerFeedbackType,
                              feedback_text: drawerFeedbackText.trim(),
                              is_pinpoint: drawerFeedbackPin,
                              timestamp: new Date().toISOString(),
                              staff_name: currentUser.name || 'Sarah Jenkins'
                            });
                          }
                          addAuditLog(selectedCust.id, selectedCust.name, `Logged feedback: "${drawerFeedbackText.trim()}"`, 'profile_edit');
                          setDrawerFeedbackText('');
                          setShowAddDrawerFeedback(false);
                          showToast("✓ Feedback logged successfully", "success");
                        }}
                        className="w-full py-2 bg-[#10b981] font-bold text-white rounded-lg hover:bg-[#10b981]/90 cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {(() => {
                      const clientFeedbacks = feedback.filter(f => f.customer_id === selectedCust.id || f.customer_name === selectedCust.name);
                      if (clientFeedbacks.length === 0) {
                        return (
                          <div className="py-8 text-center text-xs text-slate-400 italic">
                            No feedback records on file.
                          </div>
                        );
                      }
                      return clientFeedbacks.map(f => (
                        <div key={f.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5 relative group text-xs font-semibold">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase ${
                              f.feedback_type === 'recommendation' ? 'bg-emerald-100 text-emerald-800' :
                              f.feedback_type === 'inquiry' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                            }`}>
                              {f.feedback_type}
                            </span>
                            {f.is_pinpoint && (
                              <span className="text-emerald-600 font-bold text-[10px]">&#128204; Pinned</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                            "{f.feedback_text}"
                          </p>
                          <div className="text-[10px] text-slate-400 flex justify-between select-none font-medium mt-1">
                            <span>Admin: {f.staff_name}</span>
                            <span>{new Date(f.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      </div>
    </div>
  );
}
