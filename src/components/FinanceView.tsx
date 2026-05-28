import { useState, FormEvent } from 'react';
import { FinanceRecord } from '../types';
import { DollarSign, Landmark, Coins, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, Calculator, Plus } from 'lucide-react';

interface FinanceViewProps {
  financeList: FinanceRecord[];
  handleAddFinanceRecord: (record: Partial<FinanceRecord>) => void;
  darkMode: boolean;
}

export default function FinanceView({ financeList, handleAddFinanceRecord, darkMode }: FinanceViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  
  // New transaction forms state
  const [category, setCategory] = useState<FinanceRecord['category']>('Subscription Sales');
  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState(150);
  const [description, setDescription] = useState('');

  // Scenario Simulator variables
  const [simClientsCount, setSimClientsCount] = useState(48);
  const [simWeeklyRate, setSimWeeklyRate] = useState(125);
  const [simIngredientCost, setSimIngredientCost] = useState(38);
  const [simRiderCost, setSimRiderCost] = useState(18);

  const handleCreateRecord = (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // Expenses represent negative cashflow
    const finalAmount = type === 'Expense' ? -Math.abs(amount) : Math.abs(amount);

    const newRec: Partial<FinanceRecord> = {
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amount: finalAmount,
      description
    };

    handleAddFinanceRecord(newRec);
    setIsAdding(false);
    
    setDescription('');
    setAmount(100);
  };

  // Computations
  const totalInflows = financeList
    .filter(f => f.type === 'Income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalOutflows = financeList
    .filter(f => f.type === 'Expense')
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);

  const netBalance = totalInflows - totalOutflows;

  // Simulator results
  const simWeeklyRev = simClientsCount * simWeeklyRate;
  const simWeeklyExpenses = simClientsCount * (simIngredientCost + simRiderCost);
  const simWeeklyNet = simWeeklyRev - simWeeklyExpenses;
  const simMargin = simWeeklyRev > 0 ? (simWeeklyNet / simWeeklyRev) * 100 : 0;

  return (
    <div id="finance-view" className="space-y-6">

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Inflow box */}
        <div className={`p-6 rounded-[32px] shadow-sm flex flex-col justify-between h-[150px] border ${
          darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span className="font-bold tracking-widest uppercase">Income cash flow</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-emerald-400">+฿{totalInflows.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <p className="text-[10px] text-zinc-500 mt-1">Verified gross in-bounds</p>
          </div>
        </div>

        {/* Total Outflow box */}
        <div className={`p-6 rounded-[32px] shadow-sm flex flex-col justify-between h-[150px] border ${
          darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100'
        }`}>
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span className="font-bold tracking-widest uppercase">Outflow expenses</span>
            <ArrowDownLeft className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-zinc-400">-฿{totalOutflows.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <p className="text-[10px] text-zinc-500 mt-1">Stock, packing, rider pays</p>
          </div>
        </div>

        {/* Operating Surplus box */}
        <div className="p-6 rounded-[32px] shadow-sm flex flex-col justify-between h-[150px] bg-zinc-950 text-white relative overflow-hidden">
          {/* subtle aura */}
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#1DB954] opacity-10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center text-xs font-mono text-zinc-500 relative z-10">
            <span className="font-bold tracking-widest uppercase text-zinc-400">OPERATING SURPLUS</span>
            <Landmark className="w-4 h-4 text-[#1DB954]" />
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-black font-mono text-[#1DB954]">฿{netBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <p className="text-[10px] text-zinc-400 mt-1">Direct operational margin balance</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Ledger Register of Transactions */}
        <div className={`col-span-1 lg:col-span-7 p-6 rounded-[32px] flex flex-col gap-6 shadow-sm ${
          darkMode ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white'
        }`}>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#1DB954]/20 text-[#1DB954] rounded-xl">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-md font-bold">Comprehensive Ledger Register</h3>
                <p className="text-xs text-zinc-400 font-mono">Verified income matches receipts logs</p>
              </div>
            </div>

            <button
              id="fin-btn-toggle-add"
              onClick={() => setIsAdding(!isAdding)}
              className="px-3.5 py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              {isAdding ? 'Show Ledger' : 'Post Transaction'}
            </button>
          </div>

          {isAdding ? (
            /* Inside Transaction Creation form */
            <form onSubmit={handleCreateRecord} className="space-y-4 border-t border-zinc-800/80 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label htmlFor="fin-new-type" className="font-bold text-zinc-400">CASHFLOW DEPL</label>
                  <select
                    id="fin-new-type"
                    value={type}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setType(t);
                      setCategory(t === 'Income' ? 'Subscription Sales' : 'Kitchen Stock');
                    }}
                    className={`w-full p-2 text-xs rounded-lg outline-none ${
                      darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100'
                    }`}
                  >
                    <option value="Income">Income Flow (+)</option>
                    <option value="Expense">Expense Flow (-)</option>
                  </select>
                </div>

                <div className="space-y-1 text-xs">
                  <label htmlFor="fin-new-category" className="font-bold text-zinc-400">LEDGER ACC CATEGORY</label>
                  <select
                    id="fin-new-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full p-2 text-xs rounded-lg outline-none ${
                      darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100'
                    }`}
                  >
                    {type === 'Income' ? (
                      <>
                        <option value="Subscription Sales">Subscription Sales</option>
                        <option value="A la Carte Orders">A la Carte Orders</option>
                      </>
                    ) : (
                      <>
                        <option value="Kitchen Stock">Kitchen Stock</option>
                        <option value="Rider Compensation">Rider Compensation</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Packaging">Packaging</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label htmlFor="fin-new-amount" className="font-bold text-zinc-400">AMOUNT CAPITAL (฿)</label>
                  <input
                    id="fin-new-amount"
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`w-full p-2 text-xs rounded-lg outline-none ${
                      darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100'
                    }`}
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label htmlFor="fin-new-desc" className="font-bold text-zinc-400">STATEMENT DESCRIPTION</label>
                  <input
                    id="fin-new-desc"
                    required
                    type="text"
                    placeholder="E.g. Recruits marketing spend"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-2 text-xs rounded-lg outline-none ${
                      darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100'
                    }`}
                  />
                </div>
              </div>

              <button
                id="fin-btn-submit-post"
                type="submit"
                className="w-full py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold rounded-xl text-xs hover:scale-105 active:scale-95 transition-all text-center"
              >
                Post Entry to Accounting System
              </button>
            </form>
          ) : (
            /* Items List */
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {financeList.map((rec, index) => (
                <div 
                  key={`${rec.id}-${index}`} 
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                    darkMode ? 'bg-zinc-950 border-zinc-850' : 'bg-zinc-50 border-zinc-100'
                  }`}
                >
                  <div>
                    <span className="text-[9px] text-zinc-500 font-mono block">{rec.date} • {rec.category.toUpperCase()}</span>
                    <strong className="text-xs font-bold block mt-0.5">{rec.description}</strong>
                  </div>

                  <strong className={`text-xs font-mono font-bold ${
                    rec.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {rec.amount > 0 ? `+฿${rec.amount.toLocaleString()}` : `-฿${Math.abs(rec.amount).toLocaleString()}`}
                  </strong>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Side: Interactive Scenario profit calculator */}
        <div className={`col-span-1 lg:col-span-5 p-6 rounded-[32px] flex flex-col gap-5 shadow-sm ${
          darkMode ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Calculator className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-md font-bold">Ops Projections Scenario Simulator</h3>
              <p className="text-xs text-zinc-400">Slide volume dynamics to view margin forecasts</p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* 1. Monthly Subscriber Counts */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">1. Subscribing Diet Clinicians:</span>
                <strong className="text-[#1DB954]">{simClientsCount} clients</strong>
              </div>
              <input
                id="sim-clients-count-slider"
                type="range"
                min={20}
                max={200}
                value={simClientsCount}
                onChange={(e) => setSimClientsCount(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
            </div>            {/* 2. Monthly price per client */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">2. Weekly Plan Premium Charge:</span>
                <strong>฿{simWeeklyRate}/wk</strong>
              </div>
              <input
                id="sim-weekly-rate-slider"
                type="range"
                min={80}
                max={250}
                value={simWeeklyRate}
                onChange={(e) => setSimWeeklyRate(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
            </div>

            {/* 3. Ingredient Costs */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">3. Raw Ingredient costs per sub:</span>
                <strong className="text-rose-400">฿{simIngredientCost}/wk</strong>
              </div>
              <input
                id="sim-ingredient-cost-slider"
                type="range"
                min={20}
                max={80}
                value={simIngredientCost}
                onChange={(e) => setSimIngredientCost(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
            </div>

            {/* 4. Courier transport cost */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">4. Courier dispatch cost per sub:</span>
                <strong className="text-rose-400">฿{simRiderCost}/wk</strong>
              </div>
              <input
                id="sim-rider-cost-slider"
                type="range"
                min={10}
                max={40}
                value={simRiderCost}
                onChange={(e) => setSimRiderCost(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#1DB954]"
              />
            </div>

          </div>

          {/* Forecasted calculation sheet */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 mt-2 space-y-2 text-white">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Gross Weekly Inflow:</span>
              <span>+฿{simWeeklyRev.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Weekly Prime Costs:</span>
              <span>-฿{simWeeklyExpenses.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-zinc-800/80 pt-2 flex justify-between h-[50px] items-center">
              <div>
                <span className="text-[10px] text-zinc-500 block font-mono">WEEKLY SURPLUS</span>
                <strong className="text-lg text-[#1DB954] font-mono">+฿{simWeeklyNet.toLocaleString()}</strong>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block font-mono">SURPLUS RATIO</span>
                <strong className="text-lg text-emerald-400 font-mono">{simMargin.toFixed(1)}%</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
