import { useState, useEffect, FormEvent } from 'react';
import { Customer, Order, Staff, FinanceRecord, CustomerInquiry, CRMFeedback } from '../types';
import { 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Sparkle, 
  Bike, 
  ChevronRight, 
  MessageCircle, 
  Compass, 
  Moon, 
  Sun,
  UtensilsCrossed,
  ShieldCheck,
  Send,
  Zap,
  Users,
  AlertTriangle,
  Instagram,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  customers: Customer[];
  orders: Order[];
  staff: Staff[];
  finance: FinanceRecord[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  setActiveTab: (tab: string) => void;
  handleTrackOrder?: (order: Order) => void;
  inquiries?: CustomerInquiry[];
  feedback?: CRMFeedback[];
}

type SubTab = 'Overview' | 'Revenue' | 'Growth' | 'Inventory' | 'Operations';

export default function DashboardView({ 
  customers, 
  orders, 
  staff, 
  finance, 
  darkMode, 
  toggleDarkMode,
  setActiveTab,
  handleTrackOrder,
  inquiries = [],
  feedback = []
}: DashboardViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Overview');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Delivery simulation details
  const [deliveryProgress, setDeliveryProgress] = useState(45);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Pick the first order that is NOT delivered or placed
    const active = orders.find(o => o.status !== 'Delivered') || orders[0];
    if (active) {
      setTrackingOrder(active);
    }
  }, [orders]);

  // Map simulated progress ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setDeliveryProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 5;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // AI Diet generator function
  const handleAiConsult = (e: FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const responses: { [key: string]: string } = {
        'keto': '🥦 Recommended Keto Meal: Grilled Butter Salmon over cauliflower grain, laced with crushed walnuts. Target: 520 kcal (42g Protein, 4g Carbs, 38g Fat). Excludes allergy triggers.',
        'vegan': '🌱 Recommended Vegan Meal: Grilled Crispy Citrus Tofu with spinach, green asparagus, and tahini wild rice glaze. Target: 460 kcal (24g Protein, 48g Carbs, 14g Fat).',
        'low-carb': '🥩 Recommended Low-Carb Meal: Pan-Seared Sirloin with garlic-herb asparagus and light avocado smear. Target: 480 kcal (44g Protein, 8g Carbs, 28g Fats).',
        'high-protein': '🍗 Recommended High-Protein Builder: Double turkey breasts, quinoa, baked broccoli, macro lemon vinaigrette. Target: 650 kcal (62g Protein, 45g Carbs, 8g Fat).',
      };

      const lower = aiPrompt.toLowerCase();
      let match = responses['keto']; // default
      if (lower.includes('vegan') || lower.includes('plant') || lower.includes('tofu')) {
        match = responses['vegan'];
      } else if (lower.includes('protein') || lower.includes('muscle') || lower.includes('chicken')) {
        match = responses['high-protein'];
      } else if (lower.includes('carb') || lower.includes('shred') || lower.includes('low')) {
        match = responses['low-carb'];
      }

      setAiResponse(match);
      setIsGenerating(false);
    }, 1200); // quick mock feel
  };

  // Stat computations based on sub-tabs
  const totalSubscribing = customers.filter(c => c.status === 'Active Plan').length;
  const activeDeliveries = orders.filter(o => o.status === 'Out for Delivery' || o.status === 'In Kitchen').length;
  
  const totalRevenue = finance
    .filter(f => f.type === 'Income')
    .reduce((sum, current) => sum + current.amount, 0);

  // WORKFLOW 7: CRM DASHBOARD COMPUTATIONS
  const totalCustomers = customers.length;
  const todayStr = '2026-05-27'; // Fixed calendar baseline anchor
  
  const newInquiriesToday = inquiries.filter(i => {
    const rawDate = i.created_at || (i.timestamp ? i.timestamp.split(' ')[0] : '');
    return rawDate === todayStr;
  }).length;

  const totalInquiriesCount = inquiries.length;
  const convertedInquiriesCount = inquiries.filter(i => i.status === 'converted' || i.status === 'Converted').length;
  const conversionRate = totalInquiriesCount > 0 ? Math.round((convertedInquiriesCount / totalInquiriesCount) * 100) : 0;

  // WORKFLOW 6: Package expiration tracker (expire date in types is string: 'YYYY-MM-DD')
  const expiringPackagesCount = customers.filter(c => {
    const pkg = c.subscriptionPackage;
    if (!pkg) return false;
    // Check if the expiration profile status is expiring_soon or expired or we calculate manually:
    if (pkg.status === 'expired' || pkg.status === 'expiring_soon') return true;
    
    // Parse expiresDate or expired_at
    const dateStr = pkg.expired_at || pkg.expiresDate;
    if (!dateStr) return false;
    
    const today = new Date(todayStr);
    const expDate = new Date(dateStr);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Expiring within 7 days or already expired
    return diffDays <= 7;
  }).length;

  // Source distribution ratio grouping
  const sourceBreakdown = inquiries.reduce((acc, curr) => {
    const src = (curr.source || 'Website').toLowerCase();
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, { website: 0, messenger: 0, telegram: 0, instagram: 0 } as Record<string, number>);

  const stats = {
    Overview: {
      kpi1: { title: 'Caloric Target Success', value: '98.2%', helper: 'Compliance index', rate: '+1.4%' },
      kpi2: { title: 'Avg Order Value', value: '฿22.80', helper: 'Over last 100 dispatches', rate: '+8.2%' },
      insights: [
        { label: 'Avg delivery duration', val: '21.4 mins' },
        { label: 'Packaging efficiency', val: '99.4%' },
        { label: 'Active Subscriptions', val: `${totalSubscribing} plans` }
      ]
    },
    Revenue: {
      kpi1: { title: 'Total Revenue Gained', value: `฿${totalRevenue.toLocaleString()}`, helper: 'Sub + A La Carte', rate: '+12.4%' },
      kpi2: { title: 'Margin per Custom Diet', value: '62.4%', helper: 'Minus prime ingredients cost', rate: '+2.1%' },
      insights: [
        { label: 'Keto sales portion', val: '฿3,850' },
        { label: 'Vegan subscriptions', val: '฿2,100' },
        { label: 'Ingredient expense', val: '-฿650' }
      ]
    },
    Growth: {
      kpi1: { title: 'Weekly Diet Orders', value: `${orders.length * 4}`, helper: 'Forecasted next cycle', rate: '+15.2%' },
      kpi2: { title: 'Customer Lifetime Plan', value: '18 Weeks', helper: 'Highly consistent retention', rate: '+3.5%' },
      insights: [
        { label: 'Referral signup rate', val: '21.5%' },
        { label: 'Organic search volume', val: '+45%' },
        { label: 'Returning diners share', val: '88.4%' }
      ]
    },
    Inventory: {
      kpi1: { title: 'Safety Level Grams', value: '118,000g', helper: 'All fresh stocks combined', rate: '-2.4%' },
      kpi2: { title: 'Disposal Level', value: '0.4%', helper: 'Shrink due to expiration limits', rate: '-1.2%' },
      insights: [
        { label: 'Salmon stock level', val: '8,500g remaining' },
        { label: 'Avocados safety grams', val: '4,500g remaining' },
        { label: 'Safety Stock alerts', val: '0 pending critical' }
      ]
    },
    Operations: {
      kpi1: { title: 'Dispatch Readiness', value: '98%', helper: 'Ready riders status ratio', rate: '+0.5%' },
      kpi2: { title: 'First Attempt Deliveries', value: '100%', helper: 'Target locked first time', rate: 'Perfect' },
      insights: [
        { label: 'Avg chef cook speed', val: '8.5 mins' },
        { label: 'Hot spot radius', val: '4.2 miles' },
        { label: 'Courier availability', val: '3 riders ready' }
      ]
    }
  };

  const activeStats = stats[activeSubTab];

  return (
    <div id="dashboard-view" className="space-y-6">
      
      {/* 1. TOP HEADER WITH DYNAMIC TITLE AND BOLD GREEN BUTTON */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase font-sans">
            Business Performance
          </h1>
          <p className="text-xs text-zinc-500 dark:text-[#8C9A94] uppercase tracking-wider font-semibold font-mono mt-1">Delivery-only smart diet systems command panel</p>
        </div>
        
        {/* Dynamic header controllers */}
        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <button
            id="theme-dark-toggle"
            onClick={toggleDarkMode}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
              darkMode ? 'bg-[#1A221E] text-[#1DB954] border border-[#222A25]' : 'bg-white text-[#1DB954] border border-[#E5E9E7] shadow-sm'
            }`}
            title="Toggle Light/Dark Workspace Layout"
          >
            {darkMode ? <Sun className="w-5 h-5 animate-pulse" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Bold green action button */}
          <button
            id="header-btn-quick-meal"
            onClick={() => setActiveTab('customizer')}
            className="px-6 py-3.5 bg-[#1DB954] text-white hover:bg-[#1ed760] font-black rounded-full flex items-center gap-2.5 shadow-md hover:scale-[1.02] active:scale-95 transition-all text-xs tracking-wider uppercase font-sans"
          >
            <Plus className="w-4 h-4" />
            Launch Growth Action
          </button>
        </div>
      </header>

      {/* 2. SUB-PILLS NAVIGATION WITH BOLD THEME ACCENTS */}
      <div id="dashboard-subtabs-bar" className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Performance Sub Tabs">
        {(['Overview', 'Revenue', 'Growth', 'Inventory', 'Operations'] as SubTab[]).map((tab) => {
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              id={`sub-tab-${tab.toLowerCase()}`}
              onClick={() => setActiveSubTab(tab)}
              className={`px-5 py-2.5 text-xs font-black rounded-full tracking-widest uppercase transition-all ${
                isActive 
                  ? 'bg-[#1DB954] text-white shadow-md border border-transparent' 
                  : 'bg-[#F0F4F2] text-[#5A6C63] hover:text-[#1A1A1A] hover:bg-[#E5E9E7] dark:bg-[#131714] dark:text-[#8C9A94] dark:hover:text-white dark:border dark:border-[#222A25]'
              }`}
              role="tab"
              aria-selected={isActive}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 3. DYNAMIC METRIC CARDS ROW WITH HIGH-CONTRAST BOLD TYPOGRAPHY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* KPI 1 Widget - styled with massive numbers */}
        <div className={`col-span-1 md:col-span-1 lg:col-span-4 p-7 rounded-[32px] flex flex-col justify-between h-[230px] shadow-sm relative overflow-hidden group ${
          darkMode ? 'bg-[#111412] border border-[#222A25] text-white' : 'bg-white border border-[#E5E9E7] text-[#1A1A1A]'
        }`}>
          <div>
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-[10px] font-black font-mono tracking-widest uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#1DB954]" />
                {activeStats.kpi1.title.toUpperCase()}
              </span>
            </div>
            
            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-black tracking-tighter">{activeStats.kpi1.value}</span>
              <span className="inline-[#1DB954]/10 text-[#1DB954] px-2.5 py-0.5 rounded-full text-xs font-bold ml-2 font-mono">
                {activeStats.kpi1.rate}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-wider font-semibold">{activeStats.kpi1.helper}</p>
          </div>

          {/* Micro SVG Sparkline Graphic */}
          <div className="h-12 w-full mt-2">
            <svg className="w-full h-full" viewBox="0 0 100 20">
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1DB954" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1DB954" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,15 Q 15,5 30,12 T 60,4 T 90,14 T 100,2"
                fill="none"
                stroke="#1DB954"
                strokeWidth="2.5"
                className="stroke-[#1DB954]"
              />
              <path
                d="M 0,15 Q 15,5 30,12 T 60,4 T 90,14 T 100,2 L 100,20 L 0,20 Z"
                fill="url(#sparklineGrad)"
              />
            </svg>
          </div>
          <span className="absolute bottom-2.5 right-6 text-[8px] text-[#8C9A94] font-mono uppercase tracking-wider">vs last 7 days</span>
        </div>

        {/* KPI 2 Widget - Bold High Contrast green panel */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 p-7 rounded-[32px] flex flex-col justify-between h-[230px] shadow-lg relative bg-[#1DB954] text-white">
          <div>
            <div className="flex items-center justify-between text-[#e4feee]">
              <span className="text-[10px] font-black font-mono tracking-widest uppercase">
                {activeStats.kpi2.title.toUpperCase()}
              </span>
            </div>

            <div className="mt-4 flex items-baseline">
              <span className="text-5xl font-black tracking-tighter text-white">{activeStats.kpi2.value}</span>
              <span className="inline-block bg-white text-zinc-950 px-2.5 py-0.5 rounded-full text-xs font-bold ml-2 font-mono">
                {activeStats.kpi2.rate}
              </span>
            </div>
            <p className="text-xs text-[#e4feee] mt-1 font-mono uppercase tracking-wider font-semibold">{activeStats.kpi2.helper}</p>
          </div>

          {/* Micro Column style indicator from image */}
          <div className="flex items-end gap-1.5 h-10 w-full mt-2 group-hover:scale-y-110 transition-all duration-300">
            <div className="w-10 h-3 bg-white/40 rounded-full" style={{ height: '30%' }}></div>
            <div className="w-10 h-5 bg-white/60 rounded-full" style={{ height: '50%' }}></div>
            <div className="w-10 h-7 bg-white/80 rounded-full" style={{ height: '70%' }}></div>
            <div className="w-10 h-4 bg-white/50 rounded-full" style={{ height: '40%' }}></div>
            <div className="w-10 h-9 bg-white/90 rounded-full" style={{ height: '90%' }}></div>
            <div className="w-10 h-10 bg-white rounded-full animate-bounce" style={{ height: '100%', animationDuration: '3s' }}></div>
          </div>
          <span className="absolute bottom-2.5 right-6 text-[8px] text-[#eefdf5] font-mono uppercase tracking-wider">Realtime volume</span>
        </div>

        {/* Dynamic Dark Accent Feature card - matching "Unlock Advanced Agent Capability" layout */}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 p-7 rounded-[32px] flex flex-col justify-between h-[230px] shadow-sm relative text-white overflow-hidden bg-[#121614] border border-[#222A25]">
          {/* Ambient background aura */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-[#1DB954] opacity-20 rounded-full blur-3xl"></div>
          
          <div>
            <div className="flex items-center gap-1 text-[#1DB954]">
              <Sparkle className="w-4 h-4 fill-current animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-[10px] font-black font-mono tracking-widest uppercase">AI MEAL COADVISOR</span>
            </div>
            <h3 className="text-xl font-black tracking-tighter mt-1 leading-tight text-white uppercase">
              Unlock Diet AI advice
            </h3>
            <p className="text-[10px] text-[#8C9A94] uppercase tracking-wider font-semibold font-mono mt-0.5">Prompt specific macros or allergen audits</p>
          </div>

          <form onSubmit={handleAiConsult} className="relative z-10 flex gap-2">
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              type="text"
              placeholder="e.g. recommend low carb meal"
              className="flex-1 bg-zinc-950 border border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1DB954] placeholder-zinc-500 font-medium"
            />
            <button 
              type="submit" 
              className="bg-white text-zinc-950 rounded-xl px-3 hover:bg-[#1DB954] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
              title="Generate Diet Prescription"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* AI Output popup display */}
          {aiResponse && (
            <div className="absolute inset-x-2 bottom-2 p-3 bg-zinc-950 border border-zinc-850 text-white rounded-xl text-[10px] leading-relaxed flex flex-col gap-1 shadow-2xl z-20">
              <div className="flex justify-between items-center text-[#1DB954] font-black font-mono tracking-widest">
                <span>AI DIET DIAL:</span>
                <button type="button" onClick={() => setAiResponse(null)} className="hover:underline text-[9px] text-[#8C9A94]">Dismiss</button>
              </div>
              <p className="font-semibold text-zinc-200">{aiResponse}</p>
            </div>
          )}
        </div>

      </div>

      {/* 3B. CRM PIPELINE & OPERATIONS OVERVIEW */}
      <div className={`p-6 rounded-[32px] shadow-sm mb-6 ${
        darkMode ? 'bg-[#111412] border border-[#222A25] text-white' : 'bg-white border border-[#E5E9E7] text-[#1A1A1A]'
      }`}>
        <div className="flex items-center justify-between mb-5">
           <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1DB954]/10 text-[#1DB954] rounded-xl font-black">
                 <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                 <h3 className="text-sm font-black tracking-tight uppercase">Clinical CRM Workflows & Sales Intake</h3>
                 <p className="text-[9px] font-mono uppercase tracking-widest text-[#8C9A94]">Real-time pipeline analytics</p>
              </div>
           </div>
           
           <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-lg text-[9px] font-mono font-bold text-zinc-300 border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE PIPELINE QUEUE</span>
           </div>
        </div>

        {/* 4 CRM METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
           <div className="p-4 rounded-2xl bg-zinc-950/45 border border-zinc-850 flex flex-col justify-between h-[105px]">
              <div className="flex justify-between items-center text-zinc-400">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Total Managed Clients</span>
                 <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                 <strong className="text-2xl font-black font-mono tracking-tight text-white">{totalCustomers}</strong>
                 <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Enrolled subscriber profiles</p>
              </div>
           </div>

           <div className="p-4 rounded-2xl bg-zinc-950/45 border border-zinc-850 flex flex-col justify-between h-[105px]">
              <div className="flex justify-between items-center text-zinc-400">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Intake Leads Today</span>
                 <Plus className="w-4 h-4 text-[#1DB954]" />
              </div>
              <div>
                 <div className="flex items-baseline gap-1.5">
                    <strong className="text-2xl font-black font-mono tracking-tight text-white">{newInquiriesToday}</strong>
                    <span className="text-[8px] bg-[#1DB954]/10 text-[#1DB954] px-1 py-0.5 rounded font-black font-mono uppercase">+12%</span>
                 </div>
                 <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Incoming prospect inquiries</p>
              </div>
           </div>

           <div className="p-4 rounded-2xl bg-zinc-950/45 border border-zinc-850 flex flex-col justify-between h-[105px]">
              <div className="flex justify-between items-center text-zinc-300">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Inquiry Conversion</span>
                 <TrendingUp className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                 <strong className="text-2xl font-black font-mono tracking-tight text-white">{conversionRate}%</strong>
                 <p className="text-[9px] text-zinc-400 font-medium mt-0.5">Inquiries converted to customers</p>
              </div>
           </div>

           {/* Clickable Expiring Packages count */}
           <button 
              onClick={() => {
                localStorage.setItem('crm_initial_filter', 'expiring');
                setActiveTab('crm');
              }}
              className="p-4 rounded-2xl bg-amber-500/5 hover:bg-amber-500/10 border-2 border-dashed border-amber-500/25 hover:border-amber-500/55 flex flex-col justify-between h-[105px] text-left transition-all active:scale-[0.98] group cursor-pointer relative overflow-hidden"
           >
              <div className="absolute right-0 top-0 w-16 h-16 bg-amber-500/10 blur-2xl rounded-full"></div>
              <div className="flex justify-between items-center text-zinc-400">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Expiring Packages</span>
                 <div className="relative">
                   <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                   <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-red-500"></span>
                 </div>
              </div>
              <div>
                 <strong className="text-2xl font-black font-mono tracking-tight text-amber-500">{expiringPackagesCount}</strong>
                 <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[#1DB954] font-black uppercase tracking-wide group-hover:underline">
                    <span>Click to Filter Profiles</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                 </div>
              </div>
           </button>
        </div>

        {/* Channels Breakdown & Actionable Feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
           {/* Inquiry Sources Channels Breakdown */}
           <div className="p-4 rounded-2xl bg-zinc-950/25 border border-zinc-850">
              <h4 className="text-[10px] font-black font-mono uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                 Inquiry Sources Ratio
              </h4>
              <div className="space-y-3">
                 {(() => {
                    const total = Object.values(sourceBreakdown).reduce((a, b) => a + b, 0) || 1;
                    return Object.entries(sourceBreakdown).map(([source, count]) => {
                       const pct = Math.round((count / total) * 100);
                       const color = source === 'website' ? 'bg-[#1DB954]' : source === 'messenger' ? 'bg-blue-500' : source === 'telegram' ? 'bg-cyan-400' : 'bg-pink-500';
                       const label = source.charAt(0).toUpperCase() + source.slice(1);
                       const SourceIcon = source === 'website' ? Globe : source === 'instagram' ? Instagram : MessageCircle;
                       return (
                          <div key={source} className="space-y-1">
                             <div className="flex justify-between items-center text-xs">
                                <span className="flex items-center gap-1.5 text-zinc-300 font-semibold uppercase text-[10px]">
                                   <SourceIcon className="w-3.5 h-3.5 text-zinc-400" />
                                   {label}
                                </span>
                                <span className="font-mono font-bold text-white text-[10px]">{count} L ({pct}%)</span>
                             </div>
                             <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                             </div>
                          </div>
                       );
                    });
                 })()}
              </div>
           </div>

           {/* Active Pinpointed Action Feedbacks */}
           <div className="p-4 rounded-2xl bg-zinc-950/25 border border-zinc-850 flex flex-col justify-between">
              <div>
                 <h4 className="text-[10px] font-black font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Flagged Actions (Pinpointed Feedback)
                 </h4>
                 
                 <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
                    {feedback.filter(f => f.is_pinpoint).length === 0 ? (
                       <div className="text-center py-6 text-zinc-500 text-xs font-semibold">
                          No pinpointed actionable feedback flagged on radar.
                       </div>
                    ) : (
                       feedback.filter(f => f.is_pinpoint).map(feed => (
                          <div 
                             key={feed.id} 
                             className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex flex-col gap-1 cursor-pointer hover:bg-amber-500/10 transition-colors"
                             onClick={() => setActiveTab('crm')}
                          >
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-amber-500 uppercase">{feed.customer_name || 'Customer Feedback'}</span>
                                <span className="text-[8px] font-mono tracking-wider text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded font-bold uppercase text-[8px]">{feed.feedback_type}</span>
                             </div>
                             <p className="text-[10px] leading-tight text-zinc-300 italic font-medium">"{feed.feedback_text}"</p>
                             <div className="text-[8px] text-zinc-450 font-mono flex justify-between items-center mt-1">
                                <span>Logged by {feed.staff_name}</span>
                                <span>{feed.timestamp}</span>
                             </div>
                          </div>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

        {/* 4. MAIN CENTRAL PANEL: DELIVERY VECTOR LIVE MAP SIMULATOR & INSIGHTS GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Route Tracker Map widget */}
        <div className={`col-span-1 lg:col-span-8 p-6 rounded-[32px] flex flex-col justify-between shadow-sm ${
          darkMode ? 'bg-[#111412] border border-[#222A25] text-white' : 'bg-white border border-[#E5E9E7] text-[#1A1A1A]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1DB954]/10 text-[#1DB954] rounded-xl">
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
              </span>
              <div>
                <h3 className="text-md font-black tracking-tight uppercase">Active Delivery Vector</h3>
                <p className={`text-[10px] font-mono uppercase tracking-widest ${darkMode ? 'text-[#8C9A94]' : 'text-[#5A6C63]'}`}>Diet Food Express tracker</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {trackingOrder && handleTrackOrder && (
                <button
                  onClick={() => handleTrackOrder(trackingOrder)}
                  className="px-3.5 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-md active:scale-95 hover:scale-[1.02]"
                >
                  <span className="w-2 h-2 rounded-full bg-zinc-950 animate-ping"></span>
                  TRACK DETAILED DELIVERIES
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1DB954] animate-pulse"></span>
                <span className={`text-[9px] font-black font-mono uppercase tracking-widest ${darkMode ? 'text-[#8C9A94]' : 'text-[#5A6C63]'}`}>ONLINE DIAL</span>
              </div>
            </div>
          </div>

          {/* The Route Path Graphic with premium dark slate-navy color matching delivery tracking */}
          <div className="my-6 p-4 rounded-2xl bg-[#1a1c27] border border-[#2b2e3e] relative text-white flex flex-col justify-between h-[180px] shadow-lg shadow-black/15">
            {/* Grid overlay referencing slate colors */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a2d3d_2px,transparent_2px),linear-gradient(to_bottom,#2a2d3d_2px,transparent_2px)] bg-[size:1.5rem_1.5rem] opacity-35 rounded-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-bold text-[#7d829e] block uppercase tracking-widest">TRACKING ENVELOPE</span>
                <h4 className="text-xs font-black text-[#1DB954] uppercase tracking-wider">
                  {trackingOrder ? trackingOrder.mealName : 'N/A: Free Queue'}
                </h4>
                <p className="text-[10px] text-[#b0b6cf] font-mono mt-0.5">Dest: {trackingOrder ? trackingOrder.address : 'Locked'}</p>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-mono font-bold text-[#7d829e] block uppercase tracking-widest">DISPATCH VECTOR</span>
                <span className="text-xs font-bold text-zinc-100 font-mono">{trackingOrder?.assignedRiderName || 'Dash Miller (Rider)'}</span>
              </div>
            </div>

            {/* Custom Interactive Road Map progress bar representation */}
            <div className="relative z-10 mt-4 space-y-2">
              <div className="w-full h-1.5 bg-[#25283a] rounded-full relative">
                {/* Active Line Fill with cyan glow gradient */}
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-[#1DB954] to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                  style={{ width: `${deliveryProgress}%` }}
                ></div>
                
                {/* Point 1: Kitchen */}
                <div className="absolute left-0 -top-1 w-3.5 h-3.5 rounded-full bg-[#1DB954] ring-4 ring-[#1DB954]/20 flex items-center justify-center cursor-pointer" title="BBD Kitchen"></div>
                {/* Point 2: Hotbag transit - styled in Cyan */}
                <div className="absolute left-1/2 -ml-1.5 -top-1 w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20 flex items-center justify-center cursor-pointer" title="Hotbox insulation audit"></div>
                {/* Point 3: Customer Gateway */}
                <div className="absolute right-0 -top-1 w-3.5 h-3.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20 flex items-center justify-center cursor-pointer" title="Customer address"></div>

                {/* Bike Icon avatar gliding styled in high contrast cyan theme */}
                <motion.div 
                  className="absolute -top-3 w-7 h-7 rounded-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 flex items-center justify-center shadow-lg shadow-cyan-950/45 border-2 border-[#1a1c27] cursor-grab transition-all"
                  style={{ left: `calc(${deliveryProgress}% - 14px)` }}
                >
                  <Bike className="w-3.5 h-3.5 text-current shrink-0" />
                </motion.div>
              </div>

              {/* Checkpoint indicators with high-contrast text color */}
              <div className="flex justify-between text-[9px] text-[#8288a7] font-mono uppercase tracking-widest mt-1">
                <span>1. Kitchen Hub</span>
                <span>2. Thermo transit ({deliveryProgress}%)</span>
                <span>3. Client Gate</span>
              </div>
            </div>

          </div>

          {/* Core insights panel footer */}
          <div className="grid grid-cols-3 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            {activeStats.insights.map((insight, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[10px] text-zinc-400 font-black tracking-wider uppercase font-mono">{insight.label}</span>
                <strong className={`text-md font-black mt-0.5 ${darkMode ? 'text-white' : 'text-[#1A1A1A]'}`}>{insight.val}</strong>
              </div>
            ))}
          </div>

        </div>

        {/* Right CRM & Active Operations checklist cards - matching right items from image */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* Messages & Actions group */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setActiveTab('crm')} 
              className={`p-4 rounded-[24px] text-left flex flex-col justify-between h-[100px] shadow-sm hover:scale-[1.03] transition-all cursor-pointer ${
                darkMode ? 'bg-[#111412] border border-[#222A25] text-white' : 'bg-white border border-[#E5E9E7] text-[#1A1A1A]'
              }`}
            >
              <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl self-start">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span className="text-xs font-black tracking-tight uppercase mt-2 block">CRM Directory</span>
            </button>

            <button 
              onClick={() => setActiveTab('customizer')}
              className={`p-4 rounded-[24px] text-left flex flex-col justify-between h-[100px] shadow-sm hover:scale-[1.03] transition-all cursor-pointer ${
                darkMode 
                  ? 'bg-[#111412] border border-[#222A25] text-white' 
                  : 'bg-white border border-[#E5E9E7] text-[#1A1A1A]'
              }`}
            >
              <span className="p-2 bg-[#1DB954]/10 text-[#1DB954] rounded-xl self-start max-w-max">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-black tracking-tight uppercase mt-2 block font-sans">Build Meal</span>
            </button>
          </div>

          {/* Quick List Widgets */}
          <div className={`p-6 rounded-[32px] flex flex-col gap-4 shadow-sm flex-1 ${
            darkMode ? 'bg-[#111412] border border-[#222A25] text-white' : 'bg-white border border-[#E5E9E7]'
          }`}>
            <h3 className="text-[10px] font-black font-mono text-zinc-400 tracking-widest uppercase">Active Dispatch Queue</h3>

            <div className="space-y-3.5">
              {orders.slice(0, 3).map((ord) => (
                <div 
                  key={ord.id} 
                  onClick={() => handleTrackOrder && handleTrackOrder(ord)}
                  className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer hover:border-[#1DB954]/55 hover:scale-[1.01] transition-all group ${
                    darkMode ? 'bg-zinc-950/55 border-[#222A25] hover:bg-zinc-900' : 'bg-[#F8FAF9] border-[#E5E9E7] hover:bg-[#F2F5F3]'
                  }`}
                  title="Click to track detailed delivery history"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      ord.status === 'Delivered' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : ord.status === 'Out for Delivery' 
                          ? 'bg-amber-500/10 text-amber-500' 
                          : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {ord.category.charAt(0)}
                    </span>
                    <div>
                      <span className="text-xs font-black block truncate max-w-[140px]">{ord.customerName}</span>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">{ord.id} • {ord.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[#1DB954] font-mono tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all duration-200">Track</span>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#1DB954] transition-colors" />
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => setActiveTab('orders')}
                className="w-full text-center py-2 text-xs font-black uppercase tracking-wider text-[#1DB954] hover:underline flex items-center justify-center gap-1 cursor-pointer"
              >
                Open Complete Delivery Ledger <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick trust metric badge */}
            <div className="mt-2 p-3 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-[10px] text-zinc-400 leading-normal">
                All food parcels insulated at <span className="text-white font-bold font-mono">140°F</span> for strict hazard audits compliance.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
