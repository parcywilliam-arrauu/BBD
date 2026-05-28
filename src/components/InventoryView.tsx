import { useState } from 'react';
import { InventoryItem } from '../types';
import { Package, HelpCircle, ShieldAlert, ArrowUpRight, Scale, RefreshCw } from 'lucide-react';

interface InventoryViewProps {
  inventory: InventoryItem[];
  handleRestockItem: (id: string, grams: number) => void;
  darkMode: boolean;
}

export default function InventoryView({ inventory, handleRestockItem, darkMode }: InventoryViewProps) {
  const [restockAmount, setRestockAmount] = useState<{ [id: string]: number }>({});

  const handleApplyRestock = (id: string) => {
    const amount = restockAmount[id] || 2500; // default 2.5kg
    handleRestockItem(id, amount);
    
    // Clear field
    setRestockAmount(prev => ({
      ...prev,
      [id]: 0
    }));
  };

  const isLowStock = (item: InventoryItem) => item.quantityGrams < item.reorderPoint;

  return (
    <div id="inventory-view" className="space-y-6">

      {/* Header bar */}
      <div className={`p-6 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center">
            <Package className="w-5 h-5 text-[#1DB954]" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Food Ingredient Inventory</h2>
            <p className="text-xs text-zinc-400">Fresh calorie-dense ingredients, reorder metrics, and expiration limits</p>
          </div>
        </div>

        {/* Status markers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>GOOD RESERVE</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>NEEDS REORDER</span>
          </div>
        </div>
      </div>

      {/* Inventory table listing */}
      <div className={`p-6 rounded-[32px] overflow-x-auto shadow-sm ${
        darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
      }`}>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
              <th className="py-3 px-2">ID</th>
              <th className="py-3 px-2">Ingredient Name</th>
              <th className="py-3 px-2">Current Grams</th>
              <th className="py-3 px-2">Reorder Benchmark</th>
              <th className="py-3 px-2">Safety Health State</th>
              <th className="py-3 px-2">Macros / 100g</th>
              <th className="py-3 px-2 text-right">Quick Restock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-xs">
            {inventory.map((item) => {
              const low = isLowStock(item);
              return (
                <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/45 transition-colors">
                  <td className="py-4 px-2 font-mono text-zinc-500 font-bold">{item.id}</td>
                  <td className="py-4 px-2">
                    <strong className="font-semibold block">{item.name}</strong>
                    <span className="text-[10px] text-zinc-400 font-mono">Expires {item.expiryDate}</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="font-mono font-bold text-sm bg-zinc-950/20 px-2 py-1 rounded">
                      {(item.quantityGrams / 1000).toFixed(1)} kg
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-1 font-mono">{item.quantityGrams}g</span>
                  </td>
                  <td className="py-4 px-2 font-mono text-zinc-400 font-bold">{(item.reorderPoint / 1000).toFixed(1)} kg</td>
                  <td className="py-4 px-2">
                    {low ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Critically Low
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Safe Level
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex flex-col gap-1 text-[10px] font-mono leading-none">
                      <span className="font-black text-zinc-300 font-bold">{item.caloriesPer100g} kcal/100g</span>
                      <span>P: {item.proteinPer100g}g • C: {item.carbPer100g}g • F: {item.fatPer100g}g</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="inline-flex items-center gap-2">
                      <label htmlFor={`input-restock-grams-${item.id}`} className="sr-only">Restock Grams for {item.name}</label>
                      <input
                        id={`input-restock-grams-${item.id}`}
                        type="number"
                        placeholder="Grams (e.g. 5000)"
                        value={restockAmount[item.id] || ''}
                        onChange={(e) => setRestockAmount(prev => ({
                          ...prev,
                          [item.id]: Number(e.target.value)
                        }))}
                        className={`w-28 p-1.5 text-xs text-center rounded-lg border-0 outline-none focus:ring-1 focus:ring-[#1DB954] ${
                          darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100'
                        }`}
                      />
                      <button
                        onClick={() => handleApplyRestock(item.id)}
                        className="p-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold rounded-lg hover:scale-105 active:scale-95 transition-all text-xs cursor-pointer"
                        title="Deduct or Add stock grams"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
