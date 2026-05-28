import { useState } from 'react';
import { CRMApproval, Customer } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  DollarSign, 
  UserMinus, 
  Eye, 
  ArrowRight,
  ChevronDown,
  User,
  Percent,
  AlertTriangle
} from 'lucide-react';

interface ApprovalsViewProps {
  approvals: CRMApproval[];
  handleResolveApproval: (
    id: string, 
    status: 'approved' | 'rejected' | 'partially_approved', 
    note?: string, 
    partialAmount?: number
  ) => void;
  customers: Customer[];
  darkMode: boolean;
}

export default function ApprovalsView({ 
  approvals = [], 
  handleResolveApproval, 
  customers = [],
  darkMode 
}: ApprovalsViewProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedApprovalId, setExpandedApprovalId] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});
  const [partialRefundAmounts, setPartialRefundAmounts] = useState<Record<string, string>>({});
  const [showNotification, setShowNotification] = useState(false);

  const filteredApprovals = approvals.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getApprovalIcon = (type: CRMApproval['type']) => {
    switch (type) {
      case 'pkg_discount':
        return <Percent className="w-4 h-4 text-emerald-500 animate-pulse" />;
      case 'cust_edit':
        return <User className="w-4 h-4 text-sky-500" />;
      case 'cust_deactivate':
        return <UserMinus className="w-4 h-4 text-rose-500" />;
      case 'refund_request':
        return <DollarSign className="w-4 h-4 text-amber-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    }
  };

  const getApprovalLabel = (type: CRMApproval['type']) => {
    switch (type) {
      case 'pkg_discount':
        return 'Discount Discount Approval';
      case 'cust_edit':
        return 'Sensitive Profile Edit';
      case 'cust_deactivate':
        return 'Customer Soft-Deactivation';
      case 'refund_request':
        return 'Service Refund Claim';
      default:
        return 'Standard Security Review';
    }
  };

  const getStatusBadge = (status: CRMApproval['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" /> PENDING
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> APPROVED
          </span>
        );
      case 'partially_approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-3 h-3" /> PARTIAL APP
          </span>
        );
      case 'rejected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> REJECTED
          </span>
        );
    }
  };

  const handleAction = (id: string, status: 'approved' | 'rejected' | 'partially_approved') => {
    const note = rejectionNotes[id] || '';
    const partAmt = status === 'partially_approved' ? parseFloat(partialRefundAmounts[id]) : undefined;
    
    handleResolveApproval(id, status, note, partAmt);
    
    // Clear local inputs
    setExpandedApprovalId(null);
    setRejectionNotes(prev => ({ ...prev, [id]: '' }));
    setPartialRefundAmounts(prev => ({ ...prev, [id]: '' }));
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Stats Counters
  const totalPending = approvals.filter(a => a.status === 'pending').length;
  const totalApproved = approvals.filter(a => a.status === 'approved' || a.status === 'partially_approved').length;
  const totalRejected = approvals.filter(a => a.status === 'rejected').length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#15803d]/90 text-white font-bold p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>Approval Action submitted successfully! Database updated.</span>
        </div>
      )}

      {/* Primary Header Section */}
      <div className={`p-8 rounded-2xl border ${
        darkMode ? 'bg-gradient-to-r from-[#121814] to-[#0A0D0B] border-[#1E2521]' : 'bg-white border-[#E5E9E7]'
      } shadow-sm overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1DB954]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-[#1DB954]" />
              <span className="text-[10px] tracking-[0.2em] font-black text-[#1DB954] uppercase font-mono">Vault Controls</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Manager Approvals Desk</h2>
            <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Authorize high-risk discount exceptions, sensitive patient profile editing, refund disbursements, and record deletions.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#1DB954] bg-[#1DB954]/10 px-4 py-2 rounded-xl border border-[#1DB954]/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role Check: Administrator Mode</span>
          </div>
        </div>

        {/* Top Aggregate Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-dashed dark:border-[#222A25] border-[#E5E9E7]">
          <div className="p-4 rounded-xl dark:bg-[#151A17] bg-zinc-50 border dark:border-[#222A25] border-zinc-100">
            <p className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Pending Review</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{totalPending}</p>
          </div>
          <div className="p-4 rounded-xl dark:bg-[#151A17] bg-zinc-50 border dark:border-[#222A25] border-zinc-100">
            <p className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Approved Actions</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{totalApproved}</p>
          </div>
          <div className="p-4 rounded-xl dark:bg-[#151A17] bg-zinc-50 border dark:border-[#222A25] border-zinc-100">
            <p className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Rejected Claims</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{totalRejected}</p>
          </div>
          <div className="p-4 rounded-xl dark:bg-[#151A17] bg-zinc-50 border dark:border-[#222A25] border-zinc-100">
            <p className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">Total Logged Audits</p>
            <p className="text-2xl font-black text-[#1DB954] mt-1">{approvals.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs segment */}
      <div className="flex items-center gap-2 border-b border-[#E5E9E7] dark:border-[#222A25] pb-px">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setExpandedApprovalId(null);
            }}
            className={`px-6 py-3 border-b-2 font-bold text-xs uppercase transition-all tracking-wider relative ${
              activeTab === tab
                ? 'border-[#1DB954] text-[#1DB954]'
                : 'border-transparent text-zinc-400 dark:hover:text-[#8C9A94] hover:text-[#1A1A1A]'
            }`}
          >
            {tab}
            {tab === 'pending' && totalPending > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white uppercase font-mono">
                {totalPending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Approvals Table/Desk */}
      {filteredApprovals.length === 0 ? (
        <div className={`p-16 text-center rounded-2xl border ${
          darkMode ? 'bg-[#111412] border-[#222A25]' : 'bg-white border-[#E5E9E7]'
        }`}>
          <ShieldCheck className="w-12 h-12 mx-auto text-zinc-500 mb-4" />
          <h3 className="font-extrabold text-[14px]">No approvals in this queue</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Excellent job! No items match the {activeTab} stage at this time.
          </p>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl border ${
          darkMode ? 'bg-[#111412] border-[#222A25]' : 'bg-white border-[#E5E9E7]'
        } shadow-sm`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b border-[#E5E9E7] dark:border-[#222A25] transition-colors ${
                  darkMode ? 'bg-[#151917]' : 'bg-zinc-50'
                }`}>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Class</th>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Claims Officer</th>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Client / Target</th>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Date Logged</th>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400">Status</th>
                  <th className="p-4 text-[10px] font-mono uppercase tracking-wider text-zinc-400 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E7] dark:divide-[#222A25]">
                {filteredApprovals.map((app) => {
                  const isExpanded = expandedApprovalId === app.id;
                  return (
                    <tr 
                      key={app.id} 
                      className={`hover:bg-zinc-100/30 dark:hover:bg-zinc-900/10 transition-colors ${
                        isExpanded ? 'dark:bg-[#151C18] bg-emerald-50/10' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                            {getApprovalIcon(app.type)}
                          </div>
                          <div>
                            <span className="text-xs font-black tracking-tight block">
                              {getApprovalLabel(app.type)}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500 lowercase">
                              ID: {app.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4 font-black text-xs text-zinc-800 dark:text-zinc-300">
                        {app.requested_by}
                      </td>

                      <td className="p-4">
                        <p className="text-xs font-extrabold">{app.customer_name}</p>
                        <p className="text-[10px] font-mono text-zinc-500">{app.customer_id}</p>
                      </td>

                      <td className="p-4 text-xs font-mono text-zinc-500">
                        {app.created_at}
                      </td>

                      <td className="p-4">
                        {getStatusBadge(app.status)}
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setExpandedApprovalId(isExpanded ? null : app.id)}
                          className="px-3 py-1.5 rounded-lg border dark:border-zinc-800 border-zinc-200 text-xs font-bold hover:bg-[#1DB954] dark:hover:border-[#1DB954] hover:text-white transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expanded Approval Card Detail Panel */}
      {expandedApprovalId && (
        (() => {
          const app = approvals.find(a => a.id === expandedApprovalId);
          if (!app) return null;
          const payload = app.payload || {};
          return (
            <div className={`p-6 rounded-2xl border animate-fadeIn transition-all ${
              darkMode ? 'bg-[#121614] border-[#1D2521]' : 'bg-[#FAFAF9] border-[#DCE2DF]'
            } shadow-md`}>
              
              <div className="flex justify-between items-start pb-4 border-b dark:border-[#222A25] border-zinc-200 mb-6">
                <div>
                  <h4 className="text-sm font-black text-[#1DB954]">Audit Evaluation Worksheet</h4>
                  <p className="text-xs text-zinc-500 mt-1">Analyzing original parameters versus requested exceptions</p>
                </div>
                <div className="text-zinc-400 dark:hover:text-amber-400 transition-colors cursor-pointer" onClick={() => setExpandedApprovalId(null)}>
                  <XCircle className="w-5 h-5" />
                </div>
              </div>

              {/* 1. PACKAGE DISCOUNT CASE CUSTOM RENDERS */}
              {app.type === 'pkg_discount' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="font-extrabold text-[13px] uppercase tracking-wider text-zinc-400">Discount Breakdowns</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-white border dark:border-[#222A25] border-zinc-200">
                        <p className="text-[10px] font-mono text-zinc-400">Before Discount</p>
                        <p className="text-lg font-black line-through text-zinc-400 mt-1">฿{payload.original_price?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-white border dark:border-[#222A25] border-zinc-200">
                        <p className="text-[10px] font-mono text-zinc-400">Exception Rate</p>
                        <p className="text-lg font-black text-rose-400 mt-1">{payload.discount_percent}% OFF</p>
                      </div>
                      <div className="p-4 rounded-xl border-emerald-500/30 bg-emerald-500/5 dark:bg-[#1A2E22] border p-4 rounded-xl">
                        <p className="text-[10px] font-mono text-[#1DB954]">Post Discount</p>
                        <p className="text-lg font-black text-emerald-400 mt-1">฿{payload.final_price?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-zinc-100/50">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-[#1DB954] uppercase">Package Target</p>
                      <p className="text-xs font-extrabold mt-1 text-zinc-800 dark:text-zinc-200">{payload.packageName || "N/A Meal Plan"}</p>
                      <p className="text-xs text-zinc-500 mt-1">Account Level Tier: {payload.accountLevel || "Standard"}</p>
                    </div>
                    <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-zinc-100/50">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-amber-500 uppercase">Reason for Exception</p>
                      <p className="text-xs italic mt-1 font-medium">{payload.reason || "None recorded by agent"}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl dark:bg-[#151D18] bg-[#F1F6F3] border dark:border-[#202924] border-[#DFECE5] flex flex-col justify-between">
                    <div>
                      <h6 className="font-extrabold text-[12px] flex items-center gap-1.5 mb-2 text-zinc-700 dark:text-zinc-300">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Manager Clearance</span>
                      </h6>
                      <p className="text-[11px] text-zinc-500">
                        Discounts greater than 10% require administrator override. Confirming this action will immediately activate the package for {app.customer_name}.
                      </p>
                    </div>
                    {app.status === 'pending' ? (
                      <div className="space-y-3 mt-6">
                        <input
                          type="text"
                          placeholder="Provide approval/rejection note..."
                          value={rejectionNotes[app.id] || ''}
                          onChange={(e) => setRejectionNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none dark:bg-zinc-950 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAction(app.id, 'approved')}
                            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Approve ✓
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'rejected')}
                            className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Reject ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t dark:border-zinc-800 border-zinc-200 text-xs space-y-1">
                        <p className="font-bold">Decision: <span className="uppercase text-emerald-400">{app.status}</span></p>
                        <p className="text-zinc-500">Actioned BY: {app.actioned_by || 'Administrator'}</p>
                        <p className="text-zinc-500">Date: {app.actioned_at || app.created_at}</p>
                        {app.action_note && <p className="text-zinc-500 italic">"Note: {app.action_note}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. CUSTOMER FIELD EDITS - SIDE-BY-SIDE RENDER */}
              {app.type === 'cust_edit' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="font-extrabold text-[13px] uppercase tracking-wider text-zinc-400 mb-4">Proposed Side-By-Side Profile Changes</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Original / Active */}
                      <div className="p-4 rounded-xl dark:bg-[#1D1717] bg-rose-50/20 border border-rose-500/10">
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">Original Active Value</span>
                        </div>
                        <div className="space-y-3">
                          {Object.keys(payload.original || {}).map(field => (
                            <div key={field} className="border-b dark:border-zinc-900 border-zinc-100 pb-2 text-xs">
                              <span className="font-bold block tracking-tight uppercase text-[9px] text-zinc-400">{field.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-zinc-600 dark:text-zinc-300 truncate font-mono block">{payload.original[field] || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Proposed Changes */}
                      <div className="p-4 rounded-xl dark:bg-[#171D1A] bg-emerald-50/25 border border-emerald-500/15">
                        <div className="flex items-center gap-1.5 mb-3">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 block animate-pulse"></span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Proposed Override Value</span>
                        </div>
                        <div className="space-y-3">
                          {Object.keys(payload.proposed || {}).map(field => {
                            const changed = payload.original[field] !== payload.proposed[field];
                            return (
                              <div key={field} className="border-b dark:border-zinc-900 border-zinc-100 pb-2 text-xs">
                                <span className="font-bold block tracking-tight uppercase text-[9px] text-zinc-400">{field.replace(/([A-Z])/g, ' $1')}</span>
                                <span className={`font-mono block truncate ${changed ? 'text-amber-400 font-extrabold' : 'text-zinc-500'}`}>
                                  {payload.proposed[field] || '—'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl dark:bg-[#151D18] bg-[#F1F6F3] border dark:border-[#202924] border-[#DFECE5] flex flex-col justify-between">
                    <div>
                      <h6 className="font-extrabold text-[12px] flex items-center gap-1.5 mb-2 text-zinc-700 dark:text-zinc-300">
                        <AlertTriangle className="w-4 h-4 text-sky-500 shrink-0" />
                        <span>Data Integrity Guard</span>
                      </h6>
                      <p className="text-[11px] text-zinc-500">
                        To maintain secure contact points and clinical accuracy of dietary records, changes to email, phone, or medical history require manager approval.
                      </p>
                    </div>
                    {app.status === 'pending' ? (
                      <div className="space-y-3 mt-6">
                        <input
                          type="text"
                          placeholder="Approval note / rejection feedback..."
                          value={rejectionNotes[app.id] || ''}
                          onChange={(e) => setRejectionNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none dark:bg-zinc-950 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAction(app.id, 'approved')}
                            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Approve Action
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'rejected')}
                            className="p-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Reject Rollback
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t dark:border-zinc-800 border-zinc-200 text-xs space-y-1">
                        <p className="font-bold">Decision: <span className="uppercase text-emerald-400">{app.status}</span></p>
                        <p className="text-zinc-500">Actioned BY: {app.actioned_by || 'Administrator'}</p>
                        <p className="text-zinc-500">Date: {app.actioned_at || app.created_at}</p>
                        {app.action_note && <p className="text-zinc-500 italic">"Note: {app.action_note}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3. REFUND REQUESTS */}
              {app.type === 'refund_request' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="font-extrabold text-[13px] uppercase tracking-wider text-zinc-400">Refund Summary & Claim Arguments</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-white border dark:border-[#222A25] border-zinc-200">
                        <p className="text-[10px] font-mono text-zinc-400">Claimed Refund Sum</p>
                        <p className="text-xl font-black text-rose-400 mt-1">฿{payload.refund_amount?.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-white border dark:border-[#222A25] border-zinc-200">
                        <p className="text-[10px] font-mono text-zinc-400">Evidence Link</p>
                        <p className="text-xs font-extrabold mt-2 text-zinc-800 dark:text-zinc-200">{payload.evidence || "Case attachment reviewed"}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-zinc-100/50">
                      <p className="text-[10px] font-mono font-bold tracking-wider text-amber-500 uppercase">Reason for Claim</p>
                      <p className="text-xs mt-1 text-zinc-800 dark:text-zinc-200">{payload.reason || "None recorded by agent"}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl dark:bg-[#151D18] bg-[#F1F6F3] border dark:border-[#202924] border-[#DFECE5] flex flex-col justify-between">
                    <div>
                      <h6 className="font-extrabold text-[12px] flex items-center gap-1.5 mb-2 text-zinc-700 dark:text-zinc-300">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Refund Disbursement Controls</span>
                      </h6>
                      <p className="text-[11px] text-zinc-500">
                        Select Full approval, Partial approval with a custom authorized amount, or reject the reimbursement request.
                      </p>
                    </div>
                    {app.status === 'pending' ? (
                      <div className="space-y-3 mt-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">If Partial Approval, Enter Authorized Sum (฿):</label>
                          <input
                            type="number"
                            placeholder="Partial amount..."
                            value={partialRefundAmounts[app.id] || ''}
                            onChange={(e) => setPartialRefundAmounts(prev => ({ ...prev, [app.id]: e.target.value }))}
                            className="w-full text-xs p-2 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none dark:bg-zinc-950 bg-white font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Notes or reason description..."
                          value={rejectionNotes[app.id] || ''}
                          onChange={(e) => setRejectionNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none dark:bg-zinc-950 bg-white font-sans"
                        />
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => handleAction(app.id, 'approved')}
                            className="p-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black leading-none cursor-pointer"
                          >
                            Full ✓
                          </button>
                          <button
                            onClick={() => {
                              if (!partialRefundAmounts[app.id]) {
                                alert("Validation Error: Please specify the partial authorized amount first.");
                                return;
                              }
                              handleAction(app.id, 'partially_approved');
                            }}
                            className="p-2 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black leading-none cursor-pointer"
                          >
                            Partial $
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'rejected')}
                            className="p-2 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black leading-none cursor-pointer"
                          >
                            Reject ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t dark:border-zinc-800 border-zinc-200 text-xs space-y-1">
                        <p className="font-bold">Decision: <span className="uppercase text-emerald-400">{app.status}</span></p>
                        <p className="text-zinc-500">Actioned BY: {app.actioned_by || 'Administrator'}</p>
                        <p className="text-zinc-500">Date: {app.actioned_at || app.created_at}</p>
                        {app.action_note && <p className="text-zinc-500 italic">"Note: {app.action_note}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. CUSTOMER SOFT DEACTIVATION */}
              {app.type === 'cust_deactivate' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <h5 className="font-extrabold text-[13px] uppercase tracking-wider text-rose-400">Deactivation Case Analysis</h5>
                    <div className="p-4 rounded-xl border-dashed border-rose-500/30 bg-rose-500/5 dark:bg-[#1D1212] border">
                      <p className="text-[10px] font-mono text-zinc-400">Deactivation Cause / Argument</p>
                      <p className="text-xs italic font-bold mt-1 text-zinc-800 dark:text-zinc-200">
                        "{payload.reason || "No explicit reason stated by requester"}"
                      </p>
                    </div>
                    <div className="p-4 rounded-xl dark:bg-[#181E1B] bg-zinc-100/50 text-xs space-y-2">
                       <p className="font-extrabold text-zinc-400">Historical Customer Records to Keep:</p>
                       <ul className="list-disc pl-5 space-y-0.5 text-zinc-500">
                         <li>Weight progress history is preserved for retention diagnostics.</li>
                         <li>Outstanding delivery packages will be immediately suspended upon approval.</li>
                         <li>The record is soft-deleted, hidden from master lists but retrievable.</li>
                       </ul>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl dark:bg-[#151D18] bg-[#F1F6F3] border dark:border-[#202924] border-[#DFECE5] flex flex-col justify-between">
                    <div>
                      <h6 className="font-extrabold text-[12px] flex items-center gap-1.5 mb-2 text-zinc-700 dark:text-zinc-300">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-bounce" />
                        <span>Security Deactivation Clearance</span>
                      </h6>
                      <p className="text-[11px] text-zinc-500 py-1">
                        Soft delete deactivates customer status instantly. There are no direct automated overrides; manager review is required.
                      </p>
                    </div>
                    {app.status === 'pending' ? (
                      <div className="space-y-3 mt-6">
                        <input
                          type="text"
                          placeholder="Provide approval/rejection note..."
                          value={rejectionNotes[app.id] || ''}
                          onChange={(e) => setRejectionNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-800 focus:outline-none dark:bg-zinc-950 bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAction(app.id, 'approved')}
                            className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Approve Delete
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'rejected')}
                            className="p-2.5 rounded-xl bg-stone-500 hover:bg-stone-600 text-white text-xs font-bold leading-none cursor-pointer"
                          >
                            Reject & Retain
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 pt-4 border-t dark:border-zinc-800 border-zinc-200 text-xs space-y-1">
                        <p className="font-bold">Decision: <span className="uppercase text-emerald-400">{app.status}</span></p>
                        <p className="text-zinc-500">Actioned BY: {app.actioned_by || 'Administrator'}</p>
                        <p className="text-zinc-500">Date: {app.actioned_at || app.created_at}</p>
                        {app.action_note && <p className="text-zinc-500 italic">"Note: {app.action_note}"</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          );
        })()
      )}

    </div>
  );
}
