import React, { useState } from 'react';
import { Order, DietCategory } from '../types';
import { 
  ShoppingBag, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  Truck, 
  Flame, 
  Filter, 
  PlusCircle, 
  Trash, 
  History, 
  Search, 
  Copy, 
  Check, 
  RefreshCw, 
  Calendar, 
  MapPin, 
  Tag, 
  Sparkles,
  Camera,
  UploadCloud,
  Clock,
  FileText,
  User,
  Coffee,
  X 
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  handleUpdateOrderStatus: (
    orderId: string, 
    status: Order['status'],
    payload?: {
      deliveredPhoto?: string;
      deliveredTimestamp?: string;
      deliveryNotes?: string;
      deliveryDuration?: number;
    }
  ) => void;
  handleDeleteOrder?: (id: string) => void;
  handleReorder?: (order: Order) => void;
  darkMode: boolean;
  filterCategory?: string;
  setFilterCategory?: (c: string) => void;
  filterStatus?: string;
  setFilterStatus?: (s: string) => void;
  filterDuration?: string;
  setFilterDuration?: (d: string) => void;
  handleTrackOrder?: (order: Order) => void;
  handleUpdateOrderSheetType?: (orderId: string, sheetType: Order['orderSheetType']) => void;
}

export function getOrderDuration(order: Order): number {
  if (order.deliveryDuration !== undefined) {
    return order.deliveryDuration;
  }
  const num = parseInt(order.id.replace(/\D/g, '')) || 0;
  return 10 + (num % 26);
}

export default function OrdersView({ 
  orders, 
  handleUpdateOrderStatus, 
  handleDeleteOrder, 
  handleReorder,
  darkMode,
  filterCategory: propFilterCategory,
  setFilterCategory: propSetFilterCategory,
  filterStatus: propFilterStatus,
  setFilterStatus: propSetFilterStatus,
  filterDuration: propFilterDuration,
  setFilterDuration: propSetFilterDuration,
  handleTrackOrder,
  handleUpdateOrderSheetType
}: OrdersViewProps) {
  // Fallback to local state if props are not passed
  const [localFilterCategory, localSetFilterCategory] = useState<string>('All');
  const [localFilterStatus, localSetFilterStatus] = useState<string>('All');
  const [localFilterDuration, localSetFilterDuration] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'sheets'>('cards');
  const [cardDensity, setCardDensity] = useState<'comfortable' | 'compact'>('compact');

  // Real-time delivery tracker inputs
  const [confirmingOrder, setConfirmingOrder] = useState<Order | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [viewingProofPhoto, setViewingProofPhoto] = useState<string | null>(null);

  const [deliveredPhoto, setDeliveredPhoto] = useState<string>('');
  const [deliveredTimestamp, setDeliveredTimestamp] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [deliveryDuration, setDeliveryDuration] = useState<number>(20);

  const startConfirmingDelivery = (ord: Order) => {
    setConfirmingOrder(ord);
    setDeliveredPhoto('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80');
    const nowTime = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    setDeliveredTimestamp(nowTime);
    setDeliveryNotes('Contactless handoff. Plant-based lockbox packaging delivered safely to receptionist desk.');
    const estDuration = getOrderDuration(ord);
    setDeliveryDuration(estDuration || 18);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Selected file is not an image. Please upload a camera preview/photo confirmation.');
      return;
    }
    
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(interval);
          return null;
        }
        return p + Math.floor(Math.random() * 25 + 15);
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        if (event.target?.result) {
          setDeliveredPhoto(event.target.result as string);
        }
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const PROOF_PRESETS = [
    {
      id: 'doorstep',
      label: 'Secure Door Placement',
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      description: 'Placed securely on clean entry rug'
    },
    {
      id: 'reception',
      label: 'Main Office Counter',
      url: 'https://images.unsplash.com/photo-1586769312891-44702737593c?w=600&auto=format&fit=crop&q=80',
      description: 'Signed in at reception desk'
    },
    {
      id: 'mailbox',
      label: 'Secured Lockbox',
      url: 'https://images.unsplash.com/photo-1566847438233-8667c169c510?w=600&auto=format&fit=crop&q=80',
      description: 'Stowed inside locker #22'
    },
    {
      id: 'person',
      label: 'Direct Client Handoff',
      url: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=600&auto=format&fit=crop&q=80',
      description: 'Handed directly to client'
    }
  ];

  const [historySearch, setHistorySearch] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyMealConfigToClipboard = (ord: Order) => {
    const configString = `${ord.mealName} (${ord.category} Diet Plan)\n` +
      `Macros: ${ord.totalKcal} kcal | P: ${ord.proteinGrams}g | C: ${ord.carbGrams}g | F: ${ord.fatGrams}g\n` +
      `Customer: ${ord.customerName}\n` +
      `Delivery Node: ${ord.address}`;
    navigator.clipboard.writeText(configString).then(() => {
      setCopiedId(ord.id);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy configuration', err);
    });
  };

  const filterCategory = propFilterCategory !== undefined ? propFilterCategory : localFilterCategory;
  const setFilterCategory = propSetFilterCategory || localSetFilterCategory;

  const filterStatus = propFilterStatus !== undefined ? propFilterStatus : localFilterStatus;
  const setFilterStatus = propSetFilterStatus || localSetFilterStatus;

  const filterDuration = propFilterDuration !== undefined ? propFilterDuration : localFilterDuration;
  const setFilterDuration = propSetFilterDuration || localSetFilterDuration;

  const filteredOrders = orders.filter((o) => {
    const matchesCategory = filterCategory === 'All' || o.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    
    let matchesDuration = true;
    if (filterDuration !== 'All') {
      const d = getOrderDuration(o);
      if (filterDuration === '10-15m') matchesDuration = d >= 10 && d < 15;
      else if (filterDuration === '15-20m') matchesDuration = d >= 15 && d < 20;
      else if (filterDuration === '20-25m') matchesDuration = d >= 20 && d < 25;
      else if (filterDuration === '25-30m') matchesDuration = d >= 25 && d < 30;
      else if (filterDuration === '30m+') matchesDuration = d >= 30;
    }
    
    return matchesCategory && matchesStatus && matchesDuration;
  });

  const getStatusBadgeColors = (status: Order['status']) => {
    switch (status) {
      case 'Placed':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-500/15',
          text: 'text-sky-600 dark:text-sky-400',
          border: 'border-sky-500/20 dark:border-sky-400/30',
          indicator: 'bg-sky-500'
        };
      case 'In Kitchen':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/15',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-500/20 dark:border-amber-400/30',
          indicator: 'bg-amber-500'
        };
      case 'Out for Delivery':
        return {
          bg: 'bg-indigo-505/10 bg-indigo-500/10 dark:bg-indigo-500/15',
          text: 'text-indigo-600 dark:text-indigo-400',
          border: 'border-indigo-500/20 dark:border-indigo-400/30',
          indicator: 'bg-indigo-500'
        };
      case 'Delivered':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-500/20 dark:border-emerald-400/30',
          indicator: 'bg-emerald-500'
        };
      default:
        return {
          bg: 'bg-zinc-500/10',
          text: 'text-zinc-600 dark:text-zinc-400',
          border: 'border-zinc-500/20',
          indicator: 'bg-zinc-500'
        };
    }
  };

  const getCategoryThemeColors = (category: string) => {
    switch (category) {
      case 'Keto':
        return { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', font: 'border border-rose-500/20' };
      case 'Vegan':
        return { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', font: 'border border-emerald-500/20' };
      case 'Paleo':
        return { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', font: 'border border-orange-500/20' };
      case 'High-Protein':
        return { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', font: 'border border-purple-500/20' };
      case 'Low-Carb':
        return { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-600 dark:text-cyan-400', font: 'border border-cyan-500/20' };
      default:
        return { bg: 'bg-zinc-550/10 dark:bg-zinc-800', text: 'text-zinc-650 dark:text-zinc-300', font: 'border border-zinc-700/20' };
    }
  };

  const renderActiveStepTimeline = (status: Order['status']) => {
    const steps = [
      { key: 'Placed', label: 'Ticket Placed', icon: ShoppingBag, color: 'text-sky-500' },
      { key: 'In Kitchen', label: 'In Kitchen', icon: Flame, color: 'text-amber-500' },
      { key: 'Out for Delivery', label: 'On Route', icon: Truck, color: 'text-indigo-500' },
      { key: 'Delivered', label: 'Handover Completed', icon: CheckCircle2, color: 'text-emerald-500' }
    ];

    const currentIdx = steps.findIndex(s => s.key === status);

    return (
      <div className="w-full py-3 px-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/45 border border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">operational timeline tracker</span>
          <span className="text-[10px] font-mono text-zinc-500">
            Phase {currentIdx + 1} of 4
          </span>
        </div>
        
        {/* Progress Grid */}
        <div className="mt-3.5 flex items-center justify-between relative">
          {steps.map((step, idx) => {
            const isDone = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isNext = idx > currentIdx;
            const StepIcon = step.icon;

            return (
              <React.Fragment key={step.key}>
                {/* Node */}
                <div className="flex flex-col items-center z-10 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    isCurrent 
                      ? `${step.color} bg-white dark:bg-zinc-900 border-[#1DB954] scale-110 shadow-sm animate-pulse`
                      : isDone
                        ? 'text-white bg-emerald-500 border-emerald-500 shadow-sm'
                        : 'text-zinc-400 dark:text-zinc-600 bg-zinc-105 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850'
                  }`}>
                    {isDone ? (
                      <Check className="w-4 h-4 text-white font-black" />
                    ) : (
                      <StepIcon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={`text-[9.5px] font-sans font-bold mt-1.5 transition-all ${
                    isCurrent 
                      ? 'text-zinc-900 dark:text-zinc-100 font-extrabold' 
                      : isDone
                        ? 'text-zinc-600 dark:text-zinc-400'
                        : 'text-zinc-400 dark:text-zinc-600'
                  }`}>
                    {step.key === 'Out for Delivery' ? 'In Shipment' : step.key}
                  </span>
                </div>

                {/* Line */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] bg-zinc-200 dark:bg-zinc-850 relative mx-1 -mt-5">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      style={{ width: isDone ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="orders-view" className="space-y-6 fade-in">
      
      {/* Search and Filters Controller tab */}
      <div className={`p-6 rounded-[32px] flex flex-col xl:flex-row xl:items-center justify-between gap-5 transition-all shadow-sm ${
        darkMode ? 'bg-zinc-900 border border-zinc-800/80 text-white' : 'bg-white border border-zinc-100'
      }`}>
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-2xl bg-emerald-500/10 text-[#1DB954] flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
            <ShoppingBag className="w-5 h-5 text-[#1DB954]" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Active Operations Ledger</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Live shipping statuses, macronutrient tallies, and kitchen dispatch controls</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 font-mono tracking-widest">REGULATE:</span>
          </div>

          {/* Diet style dropdown */}
          <select
            id="orders-filter-category"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold outline-none ring-offset-current focus:ring-1 focus:ring-[#1DB954] cursor-pointer transition-all border ${
              darkMode 
                ? 'bg-zinc-950 text-white border-zinc-800 hover:border-zinc-750' 
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <option value="All">All Diets</option>
            <option value="Keto">Keto</option>
            <option value="Vegan">Vegan</option>
            <option value="Paleo">Paleo</option>
            <option value="High-Protein">High-Protein</option>
            <option value="Low-Carb">Low-Carb</option>
          </select>

          {/* Status dropdown */}
          <select
            id="orders-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold outline-none ring-offset-current focus:ring-1 focus:ring-[#1DB954] cursor-pointer transition-all border ${
              darkMode 
                ? 'bg-zinc-950 text-white border-zinc-800 hover:border-zinc-750' 
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <option value="All">All Fluxes</option>
            <option value="Placed">Placed</option>
            <option value="In Kitchen">In Kitchen</option>
            <option value="Out for Delivery">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>

          {/* Speed / Duration dropdown */}
          <select
            id="orders-filter-duration"
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold outline-none ring-offset-current focus:ring-1 focus:ring-[#1DB954] cursor-pointer transition-all border ${
              darkMode 
                ? 'bg-zinc-950 text-white border-zinc-800 hover:border-zinc-750' 
                : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <option value="All">All Trip Speeds</option>
            <option value="10-15m">10–15 mins</option>
            <option value="15-20m">15–20 mins</option>
            <option value="20-25m">20–25 mins</option>
            <option value="25-30m">25–30 mins</option>
            <option value="30m+">Over 30 mins</option>
          </select>

          {/* Layout View Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Card Density Toggle (only shows when viewMode is 'cards') */}
            {viewMode === 'cards' && (
              <div className={`flex p-1 rounded-xl border transition-all duration-200 ${
                darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <button
                  id="density-toggle-compact"
                  onClick={() => setCardDensity('compact')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    cardDensity === 'compact' 
                      ? 'bg-emerald-500 text-white shadow-sm font-extrabold' 
                      : darkMode 
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                  title="Sleek, compact cards to prevent infinite scrolling"
                >
                  ⚡ Compact
                </button>
                <button
                  id="density-toggle-comfortable"
                  onClick={() => setCardDensity('comfortable')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    cardDensity === 'comfortable' 
                      ? 'bg-emerald-500 text-white shadow-sm font-extrabold' 
                      : darkMode 
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' 
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                  }`}
                  title="Spacious detailed card layout"
                >
                  🍃 Detailed
                </button>
              </div>
            )}

            <div className={`flex p-1 rounded-xl border transition-all duration-200 ${
              darkMode ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <button
                id="layout-toggle-cards"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === 'cards' 
                    ? 'bg-[#1DB954] text-white shadow-sm font-extrabold' 
                    : darkMode 
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                🎴 Cards View
              </button>
              <button
                id="layout-toggle-sheets"
                onClick={() => setViewMode('sheets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  viewMode === 'sheets' 
                    ? 'bg-[#1DB954] text-white shadow-sm font-extrabold' 
                    : darkMode 
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40' 
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
              >
                📋 Sheets View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Drill-down badge indicators */}
      {(filterCategory !== 'All' || filterStatus !== 'All' || filterDuration !== 'All') && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 text-xs font-medium border ${
          darkMode ? 'bg-zinc-950/60 border-zinc-800/60 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">operational filters:</span>
            {filterCategory !== 'All' && (
              <span className="px-2.5 py-1 rounded-full bg-[#1DB954]/10 text-[#1DB954] font-bold border border-[#1DB954]/20">
                Plan: {filterCategory}
              </span>
            )}
            {filterStatus !== 'All' && (
              <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-500 dark:text-blue-400 font-bold border border-blue-500/20">
                Status: {filterStatus}
              </span>
            )}
            {filterDuration !== 'All' && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-500 font-bold border border-amber-500/20">
                Trip duration: {filterDuration}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setFilterCategory('All');
              setFilterStatus('All');
              setFilterDuration('All');
            }}
            className="text-[11px] font-bold text-rose-500 hover:text-rose-400 hover:underline shrink-0 cursor-pointer"
          >
            Clear Filters ×
          </button>
        </div>
      )}

      {/* Order Views Selector */}
      {viewMode === 'sheets' ? (
        <div id="kitchen-prep-sheets-ledger" className={`p-6 rounded-[32px] border overflow-x-auto shadow-sm transition-all focus-within:ring-1 focus-within:ring-[#1DB954]/50 ${
          darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-5">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Active Kitchen Prep Sheets Ledger
                <span className="text-[10px] bg-[#1DB954]/10 text-[#1DB954] py-0.5 px-2.5 rounded-full border border-[#1DB954]/20 font-mono font-black">
                  {filteredOrders.length} active sheets
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Condensed multi-column spreadsheet matrix optimized for bulk weighings and dispatching printed batch labels.</p>
            </div>
            
            <button
              onClick={() => {
                const header = "ID,Customer Name,Plan Category,Recipe Name,Kcal,Protein (g),Carbs (g),Fat (g),Prep Sheet Type,Status,Shipping Destination\n";
                const rows = filteredOrders.map(o => {
                  return `"${o.id}","${o.customerName}","${o.category}","${o.mealName.replace(/"/g, '""')}",${o.totalKcal},${o.proteinGrams},${o.carbGrams},${o.fatGrams},"${o.orderSheetType || 'Standard Prep'}","${o.status}","${o.address.replace(/"/g, '""')}"`;
                }).join("\n");
                const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `BBD_Kitchen_Active_Prep_Sheets_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md select-none hover:scale-[1.02] active:scale-95"
              title="Export physical label records"
            >
              📥 Export Ledger (.CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-[950px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-black">Reference ID</th>
                  <th className="py-3.5 px-4 font-black">Subscriber Client</th>
                  <th className="py-3.5 px-4 font-black">Recipe Details</th>
                  <th className="py-3.5 px-4 font-black">Target Macros Balance</th>
                  <th className="py-3.5 px-4 font-black">Order Prep Flag</th>
                  <th className="py-3.5 px-4 font-black text-right">Unit Subtotal</th>
                  <th className="py-3.5 px-4 font-black text-center">Dispatch Status</th>
                  <th className="py-3.5 px-4 font-black text-right">Workflow Directive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-zinc-400 dark:text-zinc-500 font-mono text-xs">
                      No matching operational sheets found in cache ledger.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => {
                    const statusColors = getStatusBadgeColors(ord.status);
                    const typeColors = getCategoryThemeColors(ord.category);
                    return (
                      <tr key={`sheet-${ord.id}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/30 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-[#1DB954]">{ord.id}</td>
                        <td className="py-4 px-4">
                          <div className="font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                            <span className="w-2 h-2 rounded-full bg-[#1DB954]" />
                            {ord.customerName}
                          </div>
                          <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono truncate max-w-[190px] mt-0.5" title={ord.address}>{ord.address}</div>
                        </td>
                        <td className="py-4 px-4 font-sans">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wide font-black ${typeColors.bg} ${typeColors.text} ${typeColors.font}`}>
                              {ord.category}
                            </span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate" title={ord.mealName}>
                              {ord.mealName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5 font-mono text-[10px]">
                            <span className="text-zinc-700 dark:text-zinc-300 font-extrabold">{ord.totalKcal} kcal</span>
                            <span className="text-zinc-300 dark:text-zinc-700">|</span>
                            <span className="text-rose-500 font-semibold" title="Protein">P: {ord.proteinGrams}g</span>
                            <span className="text-amber-500 font-semibold" title="Carbs">C: {ord.carbGrams}g</span>
                            <span className="text-cyan-500 font-semibold" title="Fat">F: {ord.fatGrams}g</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={ord.orderSheetType || 'Standard Prep'}
                            onChange={(e) => handleUpdateOrderSheetType?.(ord.id, e.target.value as any)}
                            className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all ${
                              ord.orderSheetType === 'Allergen Guard' 
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                                : ord.orderSheetType === 'VIP Express Prep' 
                                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                  : ord.orderSheetType === 'Special Kitchen' 
                                    ? 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' 
                                    : darkMode 
                                      ? 'bg-zinc-950 text-zinc-400 border-zinc-805' 
                                      : 'bg-zinc-50 text-zinc-650 border-zinc-200'
                            }`}
                            title="Modifier Type Flag"
                          >
                            <option value="Standard Prep">📄 Standard Prep</option>
                            <option value="Special Kitchen">👨‍🍳 Special Kitchen</option>
                            <option value="VIP Express Prep">🚀 VIP Express</option>
                            <option value="Allergen Guard">⚠️ Allergen Guard</option>
                          </select>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-right text-zinc-900 dark:text-zinc-100">฿{ord.price.toFixed(2)}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-[9.5px] font-mono font-black px-2.5 py-1 rounded-full border uppercase tracking-wide inline-flex items-center gap-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.indicator} ${ord.status === 'In Kitchen' ? 'animate-ping' : ''}`} />
                            {ord.status === 'Out for Delivery' ? 'In Shipment' : ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ord.status === 'Placed' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'In Kitchen')}
                                className="px-3 py-1 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                              >
                                <Flame className="w-3 h-3 text-white" />
                                Start Cook
                              </button>
                            )}
                            {ord.status === 'In Kitchen' && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'Out for Delivery')}
                                className="px-3 py-1 bg-indigo-550 hover:bg-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                              >
                                <Truck className="w-3 h-3 text-white" />
                                Courier Dispatch
                              </button>
                            )}
                            {ord.status === 'Out for Delivery' && (
                              <button
                                onClick={() => startConfirmingDelivery(ord)}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm"
                              >
                                <CheckCircle2 className="w-3 h-3 text-white" />
                                Handoff
                              </button>
                            )}
                            {ord.status === 'Delivered' && (
                              <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold inline-flex items-center gap-1">
                                <Check className="w-3" /> Archive
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={cardDensity === 'compact' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4" 
          : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }>
        {filteredOrders.length === 0 ? (
          <div className={`col-span-full text-center py-20 rounded-[32px] border ${
            darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
          }`}>
            <ShoppingBag className="w-12 h-12 text-zinc-350 dark:text-zinc-650 mx-auto opacity-35 mb-3" />
            <p className="text-sm font-semibold text-zinc-400">No operational parcel items found for current regulatory metrics.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const statusColors = getStatusBadgeColors(ord.status);
            const typeColors = getCategoryThemeColors(ord.category);
            
            // Macro limits percentages matching calorie balance
            const proteinPercent = Math.min(100, Math.round((ord.proteinGrams / 50) * 100));
            const carbPercent = Math.min(100, Math.round((ord.carbGrams / 55) * 100));
            const fatPercent = Math.min(100, Math.round((ord.fatGrams / 35) * 100));

            return (
              <div 
                key={ord.id} 
                className={cardDensity === 'compact'
                  ? `p-4 rounded-2xl flex flex-col justify-between gap-3 relative transition-all duration-300 hover:shadow-md border group ${
                      darkMode 
                        ? 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-755 text-white shadow-[0_2px_12px_-5px_rgba(0,0,0,0.3)]' 
                        : 'bg-white border-zinc-150/80 hover:border-zinc-200 text-zinc-905 shadow-[0_2px_12px_-5px_rgba(24,24,27,0.06)]'
                    }`
                  : `p-6 rounded-[32px] flex flex-col justify-between gap-5 relative transition-all duration-300 hover:shadow-md border group ${
                      darkMode 
                        ? 'bg-zinc-900 border-zinc-800/80 hover:border-zinc-750 text-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]' 
                        : 'bg-white border-zinc-150/80 hover:border-zinc-205 text-zinc-905 shadow-[0_4px_20px_-8px_rgba(24,24,27,0.06)]'
                    }`
                }
              >
                {/* ID Header Tag Row */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`text-[9px] md:text-[9.5px] font-black font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColors.bg} ${typeColors.text} ${typeColors.font}`}>
                        {ord.category}
                      </span>
                      
                      <select
                        value={ord.orderSheetType || 'Standard Prep'}
                        onChange={(e) => handleUpdateOrderSheetType?.(ord.id, e.target.value as any)}
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded-full border cursor-pointer outline-none transition-all ${
                          ord.orderSheetType === 'Allergen Guard' 
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' 
                            : ord.orderSheetType === 'VIP Express Prep' 
                              ? 'bg-amber-500/10 text-[#cb9617] dark:text-amber-400 border-amber-500/20' 
                              : ord.orderSheetType === 'Special Kitchen' 
                                ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' 
                                : darkMode 
                                  ? 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700' 
                                  : 'bg-zinc-50 text-zinc-650 border-zinc-205 hover:border-zinc-300'
                        }`}
                        title="Kitchen sheet flow tag modifier"
                      >
                        <option value="Standard Prep">📄 Standard Prep</option>
                        <option value="Special Kitchen">👨‍🍳 Special Kitchen</option>
                        <option value="VIP Express Prep">🚀 VIP Express Prep</option>
                        <option value="Allergen Guard">⚠️ Allergen Guard</option>
                      </select>
                    </div>

                    <h3 className={`font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-[#1DB954] transition-colors duration-200 truncate ${
                      cardDensity === 'compact' ? 'text-sm mt-1.5' : 'text-base mt-2.5'
                    }`} title={ord.mealName}>
                      {ord.mealName}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-xs text-zinc-450 dark:text-zinc-400 mt-1">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 font-mono text-[9px] bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded">
                        {ord.id}
                      </span>
                      {cardDensity !== 'compact' && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-750 font-mono">•</span>
                          <span className="text-zinc-500">Scheduled: {ord.timestamp}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1 whitespace-nowrap ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                      <span className={`w-1 h-1 rounded-full ${statusColors.indicator} ${ord.status === 'In Kitchen' ? 'animate-ping' : ''}`} />
                      {ord.status === 'Out for Delivery' ? 'In Shipment' : ord.status}
                    </span>
                    <span className={`font-black tracking-tight font-mono text-zinc-900 dark:text-emerald-400 ${
                      cardDensity === 'compact' ? 'text-sm' : 'text-base mt-1'
                    }`}>
                      ฿{ord.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* VISUALIZED METRIC BLUEPRINT */}
                {cardDensity === 'compact' ? (
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">{ord.totalKcal} kcal</span>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
                        <span className="text-rose-500/90 font-semibold">P: {ord.proteinGrams}g</span>
                        <span>•</span>
                        <span className="text-amber-500/95 font-semibold">C: {ord.carbGrams}g</span>
                        <span>•</span>
                        <span className="text-cyan-500 font-semibold font-bold">F: {ord.fatGrams}g</span>
                      </div>
                    </div>
                    {/* Micro macronutrient bars representation */}
                    <div className="h-0.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden flex gap-px">
                      <div className="h-full bg-rose-500" style={{ width: `${proteinPercent}%` }} />
                      <div className="h-full bg-amber-500" style={{ width: `${carbPercent}%` }} />
                      <div className="h-full bg-cyan-400" style={{ width: `${fatPercent}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 space-y-3">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block font-mono font-bold tracking-wider uppercase">calories</span>
                        <strong className="text-zinc-800 dark:text-zinc-200 font-mono text-xs">{ord.totalKcal} kcal</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-rose-450 dark:text-rose-400 block font-mono font-bold tracking-wider uppercase">protein</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-mono text-xs">{ord.proteinGrams}g</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-amber-550 dark:text-amber-450 block font-mono font-bold tracking-wider uppercase">carbs</span>
                        <strong className="text-amber-600 dark:text-amber-500 font-mono text-xs">{ord.carbGrams}g</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-cyan-550 dark:text-cyan-450 block font-mono font-bold tracking-wider uppercase">fat</span>
                        <strong className="text-cyan-600 dark:text-cyan-400 font-mono text-xs">{ord.fatGrams}g</strong>
                      </div>
                    </div>

                    {/* Micro macronutrient bars representation */}
                    <div className="h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-rose-500" style={{ width: `${proteinPercent}%` }} title={`Protein: ${proteinPercent}%`} />
                      <div className="h-full bg-amber-500" style={{ width: `${carbPercent}%` }} title={`Carbs: ${carbPercent}%`} />
                      <div className="h-full bg-cyan-400" style={{ width: `${fatPercent}%` }} title={`Fat: ${fatPercent}%`} />
                    </div>
                  </div>
                )}

                {/* Stepper timeline tracking component */}
                {cardDensity === 'compact' ? (
                  <div className="py-2 px-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/45 border border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      <span>Logistics: {ord.status === 'Out for Delivery' ? 'In Shipment' : ord.status}</span>
                      <span>{ord.status === 'Placed' ? '1/4' : ord.status === 'In Kitchen' ? '2/4' : ord.status === 'Out for Delivery' ? '3/4' : '4/4'}</span>
                    </div>
                    {/* Compact bullets timeline */}
                    <div className="mt-1 flex items-center gap-1">
                      {['Placed', 'In Kitchen', 'Out for Delivery', 'Delivered'].map((stepName, stepIdx) => {
                        const currentIdx = ['Placed', 'In Kitchen', 'Out for Delivery', 'Delivered'].indexOf(ord.status);
                        const isDone = stepIdx < currentIdx;
                        const isCurrent = stepIdx === currentIdx;
                        
                        let dotColor = "bg-zinc-200 dark:bg-zinc-800";
                        if (isCurrent) {
                          dotColor = stepName === 'Placed' ? 'bg-sky-500 animate-pulse' : stepName === 'In Kitchen' ? 'bg-amber-500 animate-pulse' : stepName === 'Out for Delivery' ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500';
                        } else if (isDone) {
                          dotColor = "bg-emerald-500";
                        }
                        
                        return (
                          <div 
                            key={stepName} 
                            style={{ flexGrow: 1 }} 
                            className={`h-[3px] rounded-full transition-all duration-300 ${dotColor}`}
                            title={stepName}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  renderActiveStepTimeline(ord.status)
                )}

                {/* Delivery address details card */}
                {cardDensity === 'compact' ? (
                  <div className="py-2 px-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/45 border border-zinc-100 dark:border-zinc-800/80 space-y-1 text-left">
                    <div className="flex items-center justify-between text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <User className="w-2.5 h-2.5 text-[#1DB954]" />
                        {ord.customerName}
                      </span>
                      <span>⏱ {getOrderDuration(ord)}m</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 truncate" title={ord.address}>
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{ord.address}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-950/45 border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-zinc-400 dark:text-zinc-500 font-mono font-bold tracking-widest uppercase">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        Dispatch Node address
                      </span>
                      <span className="text-[#1DB954] font-bold">⏱ Transit: {getOrderDuration(ord)}m</span>
                    </div>
                    
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 select-all font-mono leading-normal">
                      {ord.address}
                    </div>
                    
                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono text-zinc-500">
                      <User className="w-3 h-3" />
                      <span>Recipient Subscriber: <span className="font-bold text-zinc-700 dark:text-zinc-300">{ord.customerName}</span></span>
                    </div>

                    {ord.assignedRiderName && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Rider Assigned Force: {ord.assignedRiderName}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Secure proof layout if delivered */}
                {ord.status === 'Delivered' && (
                  cardDensity === 'compact' ? (
                    <div className="p-2 rounded-xl bg-[#1DB954]/5 dark:bg-emerald-950/10 border border-emerald-500/10 flex items-center justify-between gap-2 text-left">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {ord.deliveredPhoto && (
                          <div className="w-7 h-7 rounded overflow-hidden bg-zinc-900 border shrink-0 relative group cursor-zoom-in">
                            <img 
                              src={ord.deliveredPhoto} 
                              alt="Proof" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onClick={(e) => { e.stopPropagation(); setViewingProofPhoto(ord.deliveredPhoto || ''); }}
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[8px] uppercase font-mono tracking-wider text-emerald-600 dark:text-emerald-450 font-bold block">Verified Proof</span>
                          <span className="text-[9.5px] text-zinc-500 truncate block italic">"{ord.deliveryNotes || 'Direct contactless handoff'}"</span>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400 shrink-0 font-bold">⏱ {ord.deliveryDuration || getOrderDuration(ord)}m</span>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-[#1DB954]/5 dark:bg-emerald-950/10 border border-emerald-500/10 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wide border-b border-emerald-500/15 pb-2">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-pulse" />
                          SECURE PROOF DOCUMENTED ({ord.deliveredTimestamp || ord.timestamp})
                        </span>
                        <span className="text-zinc-500">TRANSIT: {ord.deliveryDuration || getOrderDuration(ord)} MINS</span>
                      </div>
                      
                      <div className="flex gap-3.5 items-start text-left">
                        {ord.deliveredPhoto && (
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 relative group cursor-zoom-in shadow-inner">
                            <img 
                              src={ord.deliveredPhoto} 
                              alt="Handoff Confirmation Proof Document" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                              referrerPolicy="no-referrer"
                              onClick={() => setViewingProofPhoto(ord.deliveredPhoto || '')}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <Eye className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                        <div className="space-y-0.5 select-text">
                          <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 font-bold block">DISPATCH REMARKS:</span>
                          <p className="text-[11.5px] text-zinc-650 dark:text-zinc-350 leading-relaxed italic pr-1">
                            "{ord.deliveryNotes || 'Direct high-priority contactless handover.'}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* ACTION AND CONTROLS PROGRESSION ROW */}
                <div className={`flex items-center justify-between border-t border-zinc-100 dark:border-zinc-850 gap-2 ${
                  cardDensity === 'compact' ? 'pt-2.5' : 'pt-4'
                }`}>
                  <div className="flex items-center gap-1">
                    {/* Delete action */}
                    {handleDeleteOrder ? (
                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Cancel parcel order entry status"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[9px] text-zinc-500 font-mono">Verified</span>
                    )}

                    {/* Track route button */}
                    {handleTrackOrder && (
                      <button
                        onClick={() => handleTrackOrder(ord)}
                        className={`text-[#1DB954] hover:text-white bg-[#1DB954]/10 hover:bg-[#1DB954] border border-[#1DB954]/25 rounded-lg font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-sm ${
                          cardDensity === 'compact' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs font-bold'
                        }`}
                        title="Track Real-time GPS coordinates"
                      >
                        <MapPin className="w-3 h-3 text-[#1DB954] group-hover:text-white animate-pulse" />
                        Live Map
                      </button>
                    )}
                  </div>

                  {/* Operational dispatch buttons */}
                  <div className="flex items-center gap-1">
                    {ord.status === 'Placed' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'In Kitchen')}
                        className={`bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-lg font-sans flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm hover:scale-[1.02] ${
                          cardDensity === 'compact' ? 'px-2 py-1 text-[10px] font-semibold gap-1' : 'px-4 py-2 text-xs font-bold gap-1.5'
                        }`}
                      >
                        <Flame className={cardDensity === 'compact' ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'} />
                        Start Cook
                      </button>
                    )}
                    {ord.status === 'In Kitchen' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord.id, 'Out for Delivery')}
                        className={`bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-sans flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm hover:scale-[1.02] ${
                          cardDensity === 'compact' ? 'px-2 py-1 text-[10px] font-semibold gap-1' : 'px-4 py-2 text-xs font-bold gap-1.5'
                        }`}
                      >
                        <Truck className={cardDensity === 'compact' ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'} />
                        Dispatch Shipped
                      </button>
                    )}
                    {ord.status === 'Out for Delivery' && (
                      <button
                        onClick={() => startConfirmingDelivery(ord)}
                        className={`bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-sans flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md hover:scale-[1.02] ${
                          cardDensity === 'compact' ? 'px-2 py-1 text-[10px] font-semibold gap-1' : 'px-4 py-2 text-xs font-bold gap-1.5'
                        }`}
                      >
                        <CheckCircle2 className={cardDensity === 'compact' ? 'w-3 h-3 hover:scale-110 text-white' : 'w-4 h-4 hover:scale-110 text-white'} />
                        Handoff
                      </button>
                    )}
                    {ord.status === 'Delivered' && (
                      <span className={`font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20 inline-flex items-center justify-center gap-1 ${
                        cardDensity === 'compact' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs'
                      }`}>
                        <Check className={cardDensity === 'compact' ? 'w-3 h-3 text-emerald-500' : 'w-4 h-4 text-emerald-500'} /> Archived
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>
      )}

      {/* 📦 Completed Order History Section */}
      <div id="order-history-section" className={`p-6 rounded-[32px] shadow-sm space-y-6 border ${
        darkMode ? 'bg-zinc-900 border-zinc-805 text-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.4)]' : 'bg-white border-zinc-150/80 text-zinc-900'
      }`}>
        {/* Header structure */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/15">
              <History className="w-5 h-5 text-emerald-500" />
            </span>
            <div>
              <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                Completed Order History
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-mono py-0.5 px-2 rounded-full border border-emerald-500/20 font-black uppercase">
                  {orders.filter(o => o.status === 'Delivered').length} Archived
                </span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Audit previous customer macros, review delivery photographic proof, and clone previous dispatches</p>
            </div>
          </div>

          {/* Quick search and filters within archived context */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-52">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400" />
              </span>
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search recipient meal..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:ring-1 focus:ring-[#1DB954] outline-none ${
                  darkMode ? 'bg-zinc-950 border-zinc-800 text-white placeholder-zinc-700' : 'bg-zinc-50 border-zinc-205 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>

            <select
              value={historyCategoryFilter}
              onChange={(e) => setHistoryCategoryFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border outline-none focus:ring-1 focus:ring-[#1DB954] cursor-pointer ${
                darkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-205 text-zinc-700'
              }`}
            >
              <option value="All">All Diets</option>
              <option value="Keto">Keto</option>
              <option value="Vegan">Vegan</option>
              <option value="Paleo">Paleo</option>
              <option value="High-Protein">High-Protein</option>
              <option value="Low-Carb">Low-Carb</option>
            </select>
          </div>
        </div>

        {/* Content list or empty placeholder */}
        {orders.filter(o => o.status === 'Delivered').filter(o => {
          const matchesCategory = historyCategoryFilter === 'All' || o.category === historyCategoryFilter;
          const matchesSearch = historySearch === '' || 
            o.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
            o.mealName.toLowerCase().includes(historySearch.toLowerCase()) ||
            o.id.toLowerCase().includes(historySearch.toLowerCase());
          return matchesCategory && matchesSearch;
        }).length === 0 ? (
          <div className="text-center py-14 rounded-2xl bg-zinc-50/55 dark:bg-zinc-950/25 border border-dashed border-zinc-200 dark:border-zinc-800">
            <Coffee className="w-8 h-8 text-zinc-400 dark:text-zinc-600 mx-auto opacity-35 mb-2.5" />
            <p className="text-xs text-zinc-500 font-mono">No archived recipes found matching search parameters.</p>
          </div>
        ) : (
          <div className={cardDensity === 'compact'
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            : "grid grid-cols-1 md:grid-cols-2 gap-5"
          }>
            {orders.filter(o => o.status === 'Delivered').filter(o => {
              const matchesCategory = historyCategoryFilter === 'All' || o.category === historyCategoryFilter;
              const matchesSearch = historySearch === '' || 
                o.customerName.toLowerCase().includes(historySearch.toLowerCase()) ||
                o.mealName.toLowerCase().includes(historySearch.toLowerCase()) ||
                o.id.toLowerCase().includes(historySearch.toLowerCase());
              return matchesCategory && matchesSearch;
            }).map((ord) => {
              const typeColors = getCategoryThemeColors(ord.category);
              return (
                <div 
                  key={`hist-${ord.id}`}
                  className={`p-5 rounded-[24px] border transition-all duration-300 hover:border-[#1DB954]/55 group flex flex-col justify-between gap-4 bg-zinc-50/30 hover:bg-zinc-50/60 dark:bg-zinc-950/35 dark:border-zinc-800/80 dark:hover:bg-zinc-950/60`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9.5px] font-bold font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColors.bg} ${typeColors.text} ${typeColors.font}`}>
                          {ord.category}
                        </span>
                        
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold bg-zinc-100 dark:bg-zinc-900/60 px-1.5 py-0.5 rounded-md">
                          {ord.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">{ord.mealName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{ord.customerName}</span>
                        <span className="text-zinc-[400] dark:text-zinc-700">•</span>
                        <span className="font-mono text-zinc-500 text-[10.5px]">{ord.timestamp}</span>
                      </div>
                    </div>
                    
                    <span className="text-sm font-extrabold font-mono text-zinc-900 dark:text-emerald-400">฿{ord.price.toFixed(2)}</span>
                  </div>

                  {/* Macromedia specifications */}
                  <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-950/80 border border-zinc-200/50 dark:border-zinc-900 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 block font-mono">CALORIES</span>
                      <strong className="text-zinc-800 dark:text-zinc-300 font-mono font-bold">{ord.totalKcal} kcal</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-rose-500/80 block font-mono font-semibold">PROTEIN</span>
                      <strong className="text-rose-600 dark:text-rose-500 font-mono font-bold">{ord.proteinGrams}g</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-500/80 block font-mono font-semibold">CARBS</span>
                      <strong className="text-amber-600 dark:text-amber-500 font-mono font-bold">{ord.carbGrams}g</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-cyan-500/80 block font-mono font-semibold">FAT</span>
                      <strong className="text-cyan-600 dark:text-cyan-500 font-mono font-bold">{ord.fatGrams}g</strong>
                    </div>
                  </div>

                  {/* Secure proof layout block for past order history card */}
                  <div className="p-3.5 rounded-2xl bg-zinc-100/50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-900 space-y-2.5 text-left">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                        HANDOFF VERIFIED ({ord.deliveredTimestamp || ord.timestamp || '11:15 AM'})
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-500">TRIP LIMIT: {ord.deliveryDuration || getOrderDuration(ord)} MINS</span>
                    </div>
                    
                    <div className="flex items-start gap-3 pt-1">
                      {ord.deliveredPhoto && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 cursor-zoom-in relative group flex hover:scale-105 transition-transform duration-250">
                          <img 
                            src={ord.deliveredPhoto} 
                            alt="Archived Proof" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onClick={() => setViewingProofPhoto(ord.deliveredPhoto || '')}
                          />
                        </div>
                      )}
                      <div className="space-y-0.5 select-text">
                        <span className="text-[8.5px] uppercase font-mono tracking-widest text-zinc-400 dark:text-zinc-500 font-bold block">CONFIRM REMARKS:</span>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-350 leading-relaxed italic pr-1">
                          "{ord.deliveryNotes || 'Left securely on lobby parcel lockbox. Certified.'}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/50 dark:border-zinc-900 pt-2.5 mt-1">
                    <span className="flex items-center gap-1 font-mono text-zinc-500 hover:text-zinc-400 transition-colors w-1/2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500/80 shrink-0" />
                      <span className="truncate text-zinc-650 dark:text-zinc-400 text-[10px] select-all font-mono leading-none" title={ord.address}>{ord.address}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Clipboard copy recipe trigger */}
                      <button
                        onClick={() => copyMealConfigToClipboard(ord)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                          copiedId === ord.id 
                            ? 'bg-emerald-500/10 text-emerald-555 border border-emerald-500/20' 
                            : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-white border border-transparent dark:hover:border-zinc-800 text-zinc-505 dark:text-zinc-400'
                        }`}
                        title="Copy macro recipe details card"
                      >
                        {copiedId === ord.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            Saved!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Specs
                          </>
                        )}
                      </button>

                      {/* Quick Re-order Dispatch Clone Trigger */}
                      {handleReorder && (
                        <button
                          onClick={() => handleReorder(ord)}
                          className="px-3 py-1.5 bg-[#1DB954]/10 hover:bg-[#1DB954] text-[#1DB954] hover:text-white border border-[#1DB954]/20 hover:border-transparent rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 cursor-pointer active:scale-95 hover:scale-[1.02]"
                          title="Instant re-purchase recipe configuration"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin-reverse" />
                          Re-dispatch
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 📸 DELIVERY CONFIRMATION MODAL & PHOTO ZOOM STACK */}
      {confirmingOrder && (
        <div id="delivery-confirmation-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl border transition-all duration-300 scale-100 ${
            darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100 text-zinc-900'
          }`}>
            {/* Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              darkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-[#1DB954]/10 text-[#1DB954] flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                  <Truck className="w-5 h-5 text-[#1DB954]" />
                </span>
                <div className="text-left">
                  <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Confirm Customer Delivery Handoff</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Reference Badge: <span className="font-mono text-emerald-500 dark:text-emerald-400 font-bold">{confirmingOrder.id}</span> • Customer: <span className="font-semibold text-zinc-80 overlay-zinc-300">{confirmingOrder.customerName}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setConfirmingOrder(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-205 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-all font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-left">
              
              {/* Destination Information */}
              <div className={`p-4 rounded-2xl border flex items-start gap-4 ${
                darkMode ? 'bg-zinc-950/40 border-zinc-800/80' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="p-2 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center border border-rose-500/10 shrink-0">
                  <MapPin className="w-4 h-4 text-rose-500" />
                </span>
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#1DB954] font-bold">RECIPIENT SUBSCRIBER LOCATION</span>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-normal">{confirmingOrder.address}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Assigned Logistics Fleet: {confirmingOrder.assignedRiderName || 'BBD GreenBite Rider Fleet'}</p>
                </div>
              </div>

              {/* 1. PHOTO PROOF CAPTURE / UPLOAD */}
              <div className="space-y-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-405 flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-[#1DB954]" />
                  1. VISUAL CONFIRMATION PROOF PHOTO
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Col: Upload Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative min-h-[145px] ${
                      dragOver 
                        ? 'border-[#1DB954] bg-[#1DB954]/5' 
                        : darkMode 
                          ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/35 hover:bg-zinc-950/50' 
                          : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50 hover:bg-zinc-100/60'
                    }`}
                  >
                    <input 
                      type="file" 
                      id="photo-file-selector" 
                      accept="image/*" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                    />
                    <label htmlFor="photo-file-selector" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                      {uploadProgress !== null ? (
                        <div className="space-y-2.5">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1DB954]" />
                          <p className="text-xs font-bold font-mono text-zinc-500">Processing proof capture ({uploadProgress}%)...</p>
                        </div>
                      ) : deliveredPhoto.startsWith('data:') ? (
                        <div className="space-y-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
                            <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />
                          </div>
                          <p className="text-xs font-bold text-emerald-500 font-mono">Custom Proof Loaded Successfully</p>
                          <p className="text-[10.5px] text-zinc-400 hover:text-zinc-500 hover:underline">Select alternative image</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-9 h-9 rounded-full bg-[#1DB954]/10 flex items-center justify-center mx-auto text-[#1DB954]">
                            <UploadCloud className="w-4.5 h-4.5 text-[#1DB954]" />
                          </div>
                          <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">Drag & Drop Courier Proof</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">or click to choose active file system</p>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Right Col: Current Selection Preview */}
                  <div className={`rounded-2xl border overflow-hidden flex flex-col bg-zinc-950/40 relative ${darkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <div className="relative flex-1 min-h-[105px] flex items-center justify-center bg-zinc-950">
                      <img 
                        src={deliveredPhoto} 
                        alt="Delivery confirm proof" 
                        className="w-full h-full object-cover max-h-[105px]"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/85 text-[8.5px] text-emerald-400 font-mono py-0.5 px-2.5 rounded-full border border-emerald-500/20 font-black">
                        LIVE PREVIEW
                      </span>
                    </div>
                    <div className="p-2.5 text-[10px] text-zinc-400 dark:text-zinc-500 border-t border-zinc-200 dark:border-zinc-850">
                      <span className="font-semibold text-zinc-700 dark:text-zinc-400">Status Proof Source URL:</span>
                      <span className="truncate max-w-full font-mono text-[9px] block text-zinc-500 mt-0.5">{deliveredPhoto}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Preset Buttons */}
                <div className="space-y-2 text-left pt-1">
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider font-mono block">OR INSTANTLY TAP FROM PROOF PRESET STOCK:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PROOF_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => setDeliveredPhoto(preset.url)}
                        className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all text-xs cursor-pointer ${
                          deliveredPhoto === preset.url
                            ? 'border-[#1DB954] bg-[#1DB954]/5 text-[#1DB954] bg-[#1DB954]/5 outline-[#1DB954]'
                            : darkMode 
                              ? 'border-zinc-800 hover:border-zinc-750 hover:bg-zinc-950/40 text-zinc-400 bg-zinc-950/20' 
                              : 'border-zinc-200 hover:border-zinc-205 hover:bg-zinc-50 text-zinc-600 bg-white'
                        }`}
                      >
                        <span className="font-bold text-[10px] leading-tight block truncate text-zinc-850 dark:text-zinc-205">{preset.label}</span>
                        <span className="text-[9px] text-zinc-500 truncate font-mono mt-0.5">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. HANDOFF NOTES */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-405 flex items-center gap-1.5 font-mono">
                  <FileText className="w-4 h-4 text-[#1DB954]" />
                  2. PROOF CONFIRMATION REMARKS (MEMO EXECUTIVES)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  className={`w-full p-3 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-[#1DB954] border ${
                    darkMode ? 'bg-zinc-950 text-white border-zinc-800 placeholder-zinc-700' : 'bg-zinc-50 text-zinc-900 border-zinc-205 placeholder-zinc-400'
                  }`}
                  placeholder="Handoff logs (where parcel was security dropped, signed counter recipient index...)"
                />
              </div>

              {/* 3. TIME LOG CONTROLLER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1.5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-450 dark:text-zinc-405 flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-[#1DB954]" />
                    3. ACTUAL DELIVERED TIME STAMP
                  </label>
                  <input
                    type="text"
                    value={deliveredTimestamp}
                    onChange={(e) => setDeliveredTimestamp(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold focus:ring-1 focus:ring-[#1DB954] outline-none border ${
                      darkMode ? 'bg-zinc-950 text-white font-mono border-zinc-800' : 'bg-zinc-50 text-zinc-900 font-mono border-zinc-205'
                    }`}
                    placeholder="e.g. 11:45 AM"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-455 dark:text-zinc-405 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                      COURIER TRANSIT TRACK INDEX
                    </span>
                    <span className="text-[#1DB954] font-black">{deliveryDuration} mins</span>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <input
                      type="range"
                      min={5}
                      max={60}
                      value={deliveryDuration}
                      onChange={(e) => setDeliveryDuration(parseInt(e.target.value))}
                      className="flex-1 accent-[#1DB954] h-1.5 bg-zinc-350 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className={`p-6 border-t flex items-center justify-end gap-3.5 ${
              darkMode ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-100 bg-zinc-50'
            }`}>
              <button
                type="button"
                onClick={() => setConfirmingOrder(null)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-transparent dark:hover:border-zinc-700 transition-all cursor-pointer ${
                  darkMode ? 'text-zinc-400' : 'text-zinc-650'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateOrderStatus(confirmingOrder.id, 'Delivered', {
                    deliveredPhoto,
                    deliveredTimestamp,
                    deliveryNotes,
                    deliveryDuration
                  });
                  setConfirmingOrder(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-tr from-[#1DB954] to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg active:scale-95 transition-all flex items-center gap-1.5 hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                Complete Delivery & File Archives
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 PHOTO ZOOM OVERLAY */}
      {viewingProofPhoto && (
        <div 
          className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-md cursor-zoom-out animate-fade-in"
          onClick={() => setViewingProofPhoto(null)}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <img 
              src={viewingProofPhoto} 
              alt="Magnified Proof Document" 
              className="max-h-[80vh] max-w-full rounded-3xl object-contain shadow-2xl border border-zinc-805/80 animate-scale-up"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              onClick={() => setViewingProofPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-xs font-mono font-bold"
            >
              Close ✕
            </button>
            <p className="text-xs text-zinc-400 font-mono tracking-widest mt-4 bg-zinc-900/90 py-2 px-5 rounded-full border border-zinc-800">
              CLICK OUTSIDE TO CLOSE PREVIEW
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
