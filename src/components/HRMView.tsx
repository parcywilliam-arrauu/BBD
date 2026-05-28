import { useState, FormEvent, useEffect } from 'react';
import { Staff, StaffKPI, StaffPayroll, StaffLeaveRequest, StaffAsset } from '../types';
import { 
  UserCheck, 
  Star, 
  Bike, 
  ShieldAlert, 
  Utensils, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Trash,
  Award,
  DollarSign,
  Calendar,
  Layers,
  Check,
  Send,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Activity,
  UserX,
  X
} from 'lucide-react';

interface HRMViewProps {
  staffList: Staff[];
  handleUpdateStaffStatus: (staffId: string, status: Staff['status']) => void;
  handleAddStaff: (staff: Partial<Staff>) => void;
  handleDeleteStaff?: (id: string) => void;
  handleUpdateStaff?: (staff: Staff) => void;
  darkMode: boolean;
}

export default function HRMView({ staffList, handleUpdateStaffStatus, handleAddStaff, handleDeleteStaff, handleUpdateStaff, darkMode }: HRMViewProps) {
  const [filterRole, setFilterRole] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);

  // Schema Sub-state manager for detail Deep Dive modal
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [hrmSubTab, setHrmSubTab] = useState<'kpi' | 'payroll' | 'leave' | 'assets'>('kpi');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync selected staff reference if parent list changes
  useEffect(() => {
    if (selectedStaff) {
      const match = staffList.find(s => s.id === selectedStaff.id);
      if (match) {
        setSelectedStaff(match);
      }
    }
  }, [staffList]);

  // KPI fields
  const [kpiPeriod, setKpiPeriod] = useState('June 2026');
  const [kpiTargetScore, setKpiTargetScore] = useState(90);
  const [kpiActualScore, setKpiActualScore] = useState(95);
  const [kpiComment, setKpiComment] = useState('');

  // Payroll fields
  const [payMonth, setPayMonth] = useState('June 2026');
  const [payBasic, setPayBasic] = useState(3000);
  const [payAllowances, setPayAllowances] = useState(300);
  const [payDeductions, setPayDeductions] = useState(50);
  const [payBonus, setPayBonus] = useState(250);

  // Leave fields
  const [leaveType, setLeaveType] = useState<'Vacation' | 'Sick' | 'Personal' | 'Maternity/Paternity'>('Vacation');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // Asset fields
  const [assetName, setAssetName] = useState('');

  const triggerSaveNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  // KPI Action Creator
  const handleAddKPI = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !handleUpdateStaff) return;

    const newKPI: StaffKPI = {
      id: `KPI-${Math.floor(1000 + Math.random() * 9000)}`,
      period: kpiPeriod,
      targetScore: Number(kpiTargetScore),
      actualScore: Number(kpiActualScore),
      reviewComment: kpiComment || 'Standard monthly scorecard',
      reviewedBy: 'Ops Lead',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = selectedStaff.kpisScorecard ? [...selectedStaff.kpisScorecard, newKPI] : [newKPI];
    const updated: Staff = { ...selectedStaff, kpisScorecard: updatedList };
    handleUpdateStaff(updated);
    setSelectedStaff(updated);
    setKpiComment('');
    triggerSaveNotification('KPI scorecard review row persisted!');
  };

  // Payroll Action Creator
  const handleAddPayroll = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !handleUpdateStaff) return;

    const basicSalary = Number(payBasic);
    const allowances = Number(payAllowances);
    const deductions = Number(payDeductions);
    const bonus = Number(payBonus);
    const netSalary = basicSalary + allowances + bonus - deductions;

    const newPayroll: StaffPayroll = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      month: payMonth,
      basicSalary,
      allowances,
      deductions,
      bonus,
      netSalary,
      status: 'Paid',
      paidAt: new Date().toISOString().split('T')[0]
    };

    const updatedList = selectedStaff.payrollsList ? [...selectedStaff.payrollsList, newPayroll] : [newPayroll];
    const updated: Staff = { ...selectedStaff, payrollsList: updatedList };
    handleUpdateStaff(updated);
    setSelectedStaff(updated);
    triggerSaveNotification('Payroll slip booked & written to ledger!');
  };

  // Leave Action Creator
  const handleAddLeave = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !handleUpdateStaff || !leaveStart || !leaveEnd) return;

    const days = Math.max(1, Math.round((new Date(leaveEnd).getTime() - new Date(leaveStart).getTime()) / (24 * 60 * 60 * 1000)) + 1);

    const newLeave: StaffLeaveRequest = {
      id: `LV-${Math.floor(1000 + Math.random() * 9000)}`,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      totalDays: days,
      reason: leaveReason || 'Standard leave slot',
      status: 'Approved'
    };

    const updatedList = selectedStaff.leaveRequests ? [...selectedStaff.leaveRequests, newLeave] : [newLeave];
    const updated: Staff = { ...selectedStaff, leaveRequests: updatedList };
    handleUpdateStaff(updated);
    setSelectedStaff(updated);
    setLeaveReason('');
    triggerSaveNotification('Leave request slot logged and AUTO-APPROVED!');
  };

  // Asset Action Creator
  const handleAddAsset = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !handleUpdateStaff || !assetName.trim()) return;

    const newAsset: StaffAsset = {
      id: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
      assetName,
      status: 'In Use',
      issuedDate: new Date().toISOString().split('T')[0]
    };

    const updatedList = selectedStaff.allocatedAssets ? [...selectedStaff.allocatedAssets, newAsset] : [newAsset];
    const updated: Staff = { ...selectedStaff, allocatedAssets: updatedList };
    handleUpdateStaff(updated);
    setSelectedStaff(updated);
    setAssetName('');
    triggerSaveNotification('Hardware asset deployment ticket logged!');
  };

  // New staff states
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Chef' | 'Nutritionist' | 'Delivery Rider' | 'Ops Lead'>('Delivery Rider');
  const [phone, setPhone] = useState('');

  const filteredStaff = staffList.filter(s => filterRole === 'All' || s.role === filterRole);

  const handleCreateStaff = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStaff: Partial<Staff> = {
      name,
      role,
      status: 'Ready',
      phone: phone || '+1 (555) 101-9999',
      rating: role === 'Delivery Rider' ? 5.0 : undefined,
      deliveriesCount: role === 'Delivery Rider' ? 0 : undefined
    };

    handleAddStaff(newStaff);
    setIsAdding(false);

    setName('');
    setPhone('');
    setRole('Delivery Rider');
  };

  const getStatusStyle = (status: Staff['status']) => {
    switch (status) {
      case 'Ready':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
      case 'Busy':
        return 'bg-amber-500/15 text-amber-500 border border-amber-500/20';
      case 'Off-Duty':
        return 'bg-zinc-500/15 text-zinc-400 border border-zinc-700';
    }
  };

  return (
    <div id="hrm-view" className="space-y-6">
      
      {/* Search and filter bar */}
      <div className={`p-6 rounded-[32px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
        darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-[#1DB954]/20 text-[#1DB954] flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-[#1DB954]" />
          </span>
          <div>
            <h2 className="text-xl font-bold tracking-tight font-sans">HRM Staff Registry</h2>
            <p className="text-xs text-zinc-400">Manage cooks, dietary supervisors, and green delivery couriers</p>
          </div>
        </div>

        {/* Action and list buttons */}
        <div className="flex items-center gap-3">
          <select
            id="hrm-role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`p-2.5 rounded-xl text-xs font-semibold border-0 outline-none focus:ring-1 focus:ring-[#1DB954] cursor-pointer ${
              darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-150 text-zinc-900'
            }`}
          >
            <option value="All">All Departments</option>
            <option value="Chef">Kitchen Chefs</option>
            <option value="Delivery Rider">Delivery Riders</option>
            <option value="Nutritionist">Dietitians</option>
            <option value="Ops Lead">Operations Lead</option>
          </select>

          <button
            id="hrm-btn-new-staff"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4.5 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {isAdding ? 'Show Staff Roster' : 'Hire New Personnel'}
          </button>
        </div>
      </div>

      {isAdding ? (
        /* Add Staff Form */
        <form onSubmit={handleCreateStaff} className={`p-6 rounded-[32px] gap-6 flex flex-col shadow-sm max-w-lg mx-auto ${
          darkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white'
        }`}>
          <div>
            <h3 className="text-md font-bold">Deploy New Operative Personnel</h3>
            <p className="text-xs text-zinc-400 mt-1">Registers new personnel directly into the core BBD dispatch lists</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="hrm-new-staff-name" className="font-semibold text-zinc-400">STAFF FULL NAME</label>
              <input
                id="hrm-new-staff-name"
                required
                type="text"
                placeholder="E.g. Gabriel West"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-0 focus:ring-2 focus:ring-[#1DB954] outline-none ${
                  darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100/80 text-zinc-900'
                }`}
              />
            </div>

            {/* Department */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="hrm-new-staff-role" className="font-semibold text-zinc-400">ASSIGNED DEPT ROLE</label>
              <select
                id="hrm-new-staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border-0 focus:ring-2 focus:ring-[#1DB954] outline-none ${
                  darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100/80 text-zinc-900'
                }`}
              >
                <option value="Delivery Rider">Delivery Rider (Eco Courier)</option>
                <option value="Chef">Kitchen Specialist (Chef)</option>
                <option value="Nutritionist">Dietitian / Consultant</option>
                <option value="Ops Lead">Operations Lead</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1.5 text-xs">
              <label htmlFor="hrm-new-staff-phone" className="font-semibold text-zinc-400">CONTACT SHIFT PHONE</label>
              <input
                id="hrm-new-staff-phone"
                type="text"
                required
                placeholder="E.g. +1 (555) 101-7788"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full p-2.5 rounded-xl border-0 focus:ring-2 focus:ring-[#1DB954] outline-none ${
                  darkMode ? 'bg-zinc-800 text-white' : 'bg-zinc-100/80 text-zinc-900'
                }`}
              />
            </div>
          </div>

          <button
            id="hrm-btn-submit-staff"
            type="submit"
            className="w-full py-3 bg-[#1DB954] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#1ed760] transition-all cursor-pointer text-sm"
          >
            Deploy Staff Member
          </button>
        </form>
      ) : (
        /* Staff Roster Listing Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((person) => (
            <div
              key={person.id}
              className={`p-6 rounded-[32px] shadow-sm flex flex-col justify-between gap-5 relative border ${
                darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-100'
              }`}
            >
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Small round icon based on role */}
                  <span className="w-10 h-10 rounded-full bg-zinc-950 dark:bg-zinc-950/80 flex items-center justify-center text-white border border-zinc-800">
                    {person.role === 'Chef' ? <Utensils className="w-4 h-4 text-rose-400" /> : <Bike className="w-4 h-4 text-[#1DB954]" />}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold block">{person.name}</h3>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold block uppercase mt-0.5">{person.role}</span>
                  </div>
                </div>

                <span className={`text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-0.5 rounded-full ${getStatusStyle(person.status)}`}>
                  {person.status}
                </span>
              </div>

              {/* Courier specific stats */}
              {person.role === 'Delivery Rider' && (
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl text-center border border-zinc-100 dark:border-zinc-850">
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono">DELIVERIES</span>
                    <strong className="text-xs font-bold font-mono text-zinc-300">{person.deliveriesCount || 0} runs</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 block font-mono">SCORE</span>
                    <strong className="text-xs font-bold font-mono text-[#1DB954] flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" />
                      {person.rating?.toFixed(1) || '5.0'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Extra shift guidelines */}
              <div className="text-[10px] text-zinc-400 font-mono flex flex-col gap-0.5 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <span>Phone: {person.phone}</span>
                <span>Node: BBD Sector 1</span>
              </div>

              {/* Dossier deep dive trigger */}
              <button 
                type="button"
                onClick={() => {
                  setSelectedStaff(person);
                  setHrmSubTab('kpi');
                }}
                className="w-full py-2 px-3 rounded-xl bg-zinc-950 dark:bg-zinc-950 border border-zinc-805 text-[#1DB954] text-[10px] font-bold font-mono tracking-wider uppercase hover:bg-zinc-900 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-[#1DB954]" /> Open Dossier Ledger
              </button>

              {/* Update Status and Delete button row */}
              <div className="flex items-center justify-between mt-1">
                {handleDeleteStaff ? (
                  <button
                    onClick={() => handleDeleteStaff(person.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                    title="Terminate shift ticket"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span></span>
                )}

                {/* Direct loop switcher */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase mr-1">Shift State:</span>
                  <button
                    id={`btn-hrm-status-busy-${person.id}`}
                    onClick={() => handleUpdateStaffStatus(person.id, 'Busy')}
                    className="p-1 text-[9px] font-bold uppercase rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                    title="Set shift to busy"
                  >
                    Busy
                  </button>
                  <button
                    id={`btn-hrm-status-ready-${person.id}`}
                    onClick={() => handleUpdateStaffStatus(person.id, 'Ready')}
                    className="p-1 text-[9px] font-bold uppercase rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                    title="Set shift to ready"
                  >
                    Ready
                  </button>
                  <button
                    id={`btn-hrm-status-off-${person.id}`}
                    onClick={() => handleUpdateStaffStatus(person.id, 'Off-Duty')}
                    className="p-1 text-[9px] font-bold uppercase rounded bg-zinc-800 text-zinc-400"
                    title="Set shift to off duty"
                  >
                    Off
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ============== ERD DOSSIER DIALOG OVERLAY SLIDEOUT ============== */}
      {selectedStaff && (
        <div id="hrm-dossier-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-[490px] max-h-[85vh] overflow-y-auto rounded-[28px] bg-[#1a1c27] border border-[#2b2e3e] text-white p-5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] flex flex-col gap-4.5 scrollbar-none">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-bold shrink-0">
                  {selectedStaff.role === 'Chef' ? <Utensils className="w-4 h-4 text-rose-400" /> : <Bike className="w-4 h-4 text-[#1DB954]" />}
                </span>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-[15px] font-black tracking-tight leading-none text-white">{selectedStaff.name}</h3>
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono font-extrabold tracking-wider">{selectedStaff.role}</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1 font-mono leading-none">ID: {selectedStaff.id} • {selectedStaff.department || 'Operations'} • {selectedStaff.status}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all cursor-pointer border border-transparent hover:border-zinc-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Save Status Alert Banner */}
            {saveSuccessMsg && (
              <div id="hrm-success-banner" className="p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] flex items-center gap-1.5 animate-bounce uppercase tracking-wider font-bold">
                <Check className="w-3.5 h-3.5 shrink-0" />
                {saveSuccessMsg}
              </div>
            )}

            {/* Ledger Navigation Header */}
            <div className="flex border-b border-zinc-800 pb-0.5 overflow-x-auto gap-1 text-[10px] font-bold scrollbar-none">
              <button
                type="button"
                onClick={() => setHrmSubTab('kpi')}
                className={`pb-2 px-2.5 border-b-2 font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  hrmSubTab === 'kpi' 
                    ? 'border-[#1DB954] text-[#1DB954]' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🏆 KPI ({selectedStaff.kpisScorecard?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setHrmSubTab('payroll')}
                className={`pb-2 px-2.5 border-b-2 font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  hrmSubTab === 'payroll' 
                    ? 'border-[#1DB954] text-[#1DB954]' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                💵 Slips ({selectedStaff.payrollsList?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setHrmSubTab('leave')}
                className={`pb-2 px-2.5 border-b-2 font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  hrmSubTab === 'leave' 
                    ? 'border-[#1DB954] text-[#1DB954]' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                📅 Leaves ({selectedStaff.leaveRequests?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setHrmSubTab('assets')}
                className={`pb-2 px-2.5 border-b-2 font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  hrmSubTab === 'assets' 
                    ? 'border-[#1DB954] text-[#1DB954]' 
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                🛠️ Hardware ({selectedStaff.allocatedAssets?.length || 0})
              </button>
            </div>

            {/* SUBTAB CONTENT: KPI EVALS */}
            {hrmSubTab === 'kpi' && (
              <div className="space-y-3 animate-fadeIn text-[11px] leading-relaxed">
                {/* List Container */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {!selectedStaff.kpisScorecard || selectedStaff.kpisScorecard.length === 0 ? (
                    <div className="p-3 text-center text-zinc-500 font-mono italic bg-zinc-950/60 rounded-xl border border-zinc-800">
                      No previous evaluations recorded.
                    </div>
                  ) : (
                    selectedStaff.kpisScorecard.map(kpi => (
                      <div key={kpi.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-[#a0a8c2] font-bold">PERIOD: <strong className="text-white font-black">{kpi.period}</strong></span>
                          <span className="text-zinc-500">on {kpi.createdAt}</span>
                        </div>
                        <div className="flex gap-4 bg-zinc-900 border border-zinc-800/60 p-1.5 rounded-lg text-center font-mono text-[9px] justify-around">
                          <div>
                            <span className="text-zinc-550 block text-[8px]">TARGET RATING</span>
                            <span className="text-zinc-350 font-bold">{kpi.targetScore}%</span>
                          </div>
                          <div className="border-l border-zinc-800 h-6 my-auto"></div>
                          <div>
                            <span className="text-zinc-550 block text-[8px]">ACTUAL SCORE</span>
                            <span className="text-[#1DB954] font-bold">{kpi.actualScore}%</span>
                          </div>
                        </div>
                        <p className="text-zinc-300 font-serif leading-relaxed italic bg-zinc-900/10 p-1.5 rounded text-[9.5px]">
                          &ldquo;{kpi.reviewComment}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Addition form */}
                <form onSubmit={handleAddKPI} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-2.5">
                  <span className="font-mono text-[9px] text-[#1DB954] font-extrabold block uppercase tracking-wider">Book New KPI Scorecard</span>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">PERIOD</label>
                      <input
                        type="text"
                        required
                        value={kpiPeriod}
                        onChange={(e) => setKpiPeriod(e.target.value)}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] focus:ring-1 focus:ring-[#1DB954] outline-none"
                        placeholder="Q2-2026"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">TARGET_SCORE</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={kpiTargetScore}
                        onChange={(e) => setKpiTargetScore(Number(e.target.value))}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] focus:ring-1 focus:ring-[#1DB954] outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">ACTUAL_SCORE</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={kpiActualScore}
                        onChange={(e) => setKpiActualScore(Number(e.target.value))}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] focus:ring-1 focus:ring-[#1DB954] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8.5px] text-zinc-500 font-mono block">REVIEWER COMMENTARY</label>
                    <textarea
                      required
                      placeholder="Comment on staff speed levels, diet compliance, etc..."
                      rows={1}
                      value={kpiComment}
                      onChange={(e) => setKpiComment(e.target.value)}
                      className="w-full p-2 rounded bg-zinc-900 border border-zinc-800 text-white text-[10.5px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 text-[10.5px] font-black font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01]"
                  >
                    <Award className="w-3.5 h-3.5 shrink-0" /> Commit KPI evaluation
                  </button>
                </form>
              </div>
            )}

            {/* SUBTAB CONTENT: PAYROLL SLIPS */}
            {hrmSubTab === 'payroll' && (
              <div className="space-y-3 animate-fadeIn text-[11px] leading-relaxed">
                {/* List Container */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {!selectedStaff.payrollsList || selectedStaff.payrollsList.length === 0 ? (
                    <div className="p-3 text-center text-zinc-500 font-mono italic bg-zinc-950/60 rounded-xl border border-zinc-800">
                      No previous salary slips found.
                    </div>
                  ) : (
                    selectedStaff.payrollsList.map(pay => (
                      <div key={pay.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-853 space-y-1.5 font-mono text-[9px]">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
                          <span className="text-zinc-500 font-extrabold">{pay.id}</span>
                          <span className="text-white font-extrabold">{pay.month}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase font-black text-[7.5px] tracking-wider">Settled</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center text-[#9ea5c0] bg-zinc-900 p-1.5 rounded text-[8px]">
                          <div>
                            <span>Basic</span>
                            <span className="block text-white font-bold">฿{pay.basicSalary}</span>
                          </div>
                          <div>
                            <span>Allow</span>
                            <span className="block text-white font-bold">฿{pay.allowances}</span>
                          </div>
                          <div>
                            <span>Ded.</span>
                            <span className="block text-zinc-500 font-bold">-฿{pay.deductions}</span>
                          </div>
                          <div>
                            <span>Bonus</span>
                            <span className="block text-emerald-400 font-bold">+฿{pay.bonus}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white uppercase font-black">
                          <span>Bank Wire Transferred</span>
                          <span className="text-[#1DB954] text-[11.5px] font-black">฿{pay.netSalary}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Addition form */}
                <form onSubmit={handleAddPayroll} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-2.5">
                  <span className="font-mono text-[9px] text-[#1DB954] font-extrabold block uppercase tracking-wider">Compile New Salary Slip Record</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">MONTH</label>
                      <input
                        type="text"
                        required
                        value={payMonth}
                        onChange={(e) => setPayMonth(e.target.value)}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] focus:ring-1 focus:ring-[#1DB954] outline-none"
                        placeholder="E.g. December 2026"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">BASIC SALARY (฿)</label>
                      <input
                        type="number"
                        required
                        value={payBasic}
                        onChange={(e) => setPayBasic(Number(e.target.value))}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] focus:ring-1 focus:ring-[#1DB954] outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">ALLOWANCES</label>
                      <input
                        type="number"
                        value={payAllowances}
                        onChange={(e) => setPayAllowances(Number(e.target.value))}
                        className="w-full p-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-[11.5px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">DEDUCTIONS</label>
                      <input
                        type="number"
                        value={payDeductions}
                        onChange={(e) => setPayDeductions(Number(e.target.value))}
                        className="w-full p-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-[11.5px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">BONUS AMOUNT</label>
                      <input
                        type="number"
                        value={payBonus}
                        onChange={(e) => setPayBonus(Number(e.target.value))}
                        className="w-full p-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-white text-[11.5px]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 text-[10.5px] font-black font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01]"
                  >
                    <DollarSign className="w-3.5 h-3.5 shrink-0" /> Commit Payroll slip
                  </button>
                </form>
              </div>
            )}

            {/* SUBTAB CONTENT: LEAVE REQUEST ROSTER */}
            {hrmSubTab === 'leave' && (
              <div className="space-y-3 animate-fadeIn text-[11px] leading-relaxed">
                {/* List Container */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {!selectedStaff.leaveRequests || selectedStaff.leaveRequests.length === 0 ? (
                    <div className="p-3 text-center text-zinc-500 font-mono italic bg-zinc-950/60 rounded-xl border border-zinc-800">
                      No shift leave logged yet.
                    </div>
                  ) : (
                    selectedStaff.leaveRequests.map(lv => (
                      <div key={lv.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 space-y-1 font-mono text-[9px]">
                        <div className="flex justify-between items-center">
                          <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded uppercase font-extrabold text-[7.5px]">{lv.type}</span>
                          <span className="text-zinc-500 font-mono">ID: {lv.id}</span>
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded uppercase font-black text-[7.5px]">Approved</span>
                        </div>
                        <div className="text-white text-[10px] font-bold">
                          {lv.startDate} to {lv.endDate} ({lv.totalDays} calendar days)
                        </div>
                        <p className="text-[#a0a8c2] italic font-sans text-[9.5px]">
                          Reason: &ldquo;{lv.reason}&rdquo;
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Addition Form */}
                <form onSubmit={handleAddLeave} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-2.5">
                  <span className="font-mono text-[9px] text-[#1DB954] font-extrabold block uppercase tracking-wider">Log Leave Request</span>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">LEAVE_TYPE</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as any)}
                        className="w-full p-2 py-1.5 bg-zinc-900 border border-zinc-800 rounded outline-none text-[11px] text-white"
                      >
                        <option value="Vacation">Annual Paid Vacation</option>
                        <option value="Sick">Aesthetic Sick Leave</option>
                        <option value="Personal">Personal Crisis Duty</option>
                        <option value="Maternity/Paternity">Parental Maternity</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[8.5px] text-zinc-500 font-mono block">START DATE</label>
                        <input
                          type="date"
                          required
                          value={leaveStart}
                          onChange={(e) => setLeaveStart(e.target.value)}
                          className="w-full p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] font-mono outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8.5px] text-zinc-500 font-mono block">END DATE</label>
                        <input
                          type="date"
                          required
                          value={leaveEnd}
                          onChange={(e) => setLeaveEnd(e.target.value)}
                          className="w-full p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] text-zinc-500 font-mono block">REASON</label>
                      <input
                        type="text"
                        required
                        placeholder="E.g. Viral recovery, relative support, health tracking"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 text-[10.5px] font-black font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01]"
                  >
                    <Calendar className="w-3.5 h-3.5 shrink-0" /> Log and Auto-Approve Leave
                  </button>
                </form>
              </div>
            )}

            {/* SUBTAB CONTENT: ISSUED HARDWARE ASSETS */}
            {hrmSubTab === 'assets' && (
              <div className="space-y-3 animate-fadeIn text-[11px] leading-relaxed">
                {/* List Container */}
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {!selectedStaff.allocatedAssets || selectedStaff.allocatedAssets.length === 0 ? (
                    <div className="p-3 text-center text-zinc-500 font-mono italic bg-zinc-950/60 rounded-xl border border-zinc-800">
                      No hardware tools allocated.
                    </div>
                  ) : (
                    selectedStaff.allocatedAssets.map(ast => (
                      <div key={ast.id} className="p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-850 flex justify-between items-center font-mono text-[9px]">
                        <div>
                          <strong className="text-white block font-bold">{ast.assetName}</strong>
                          <span className="text-zinc-500 text-[8px]">Issued on {ast.issuedDate}</span>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded text-[7.5px] uppercase font-bold text-center">Active: In Use</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Addition Form */}
                <form onSubmit={handleAddAsset} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-850 space-y-2.5">
                  <span className="font-mono text-[9px] text-[#1DB954] font-extrabold block uppercase tracking-wider">Allocate Hardware or Vessel</span>
                  <div className="space-y-1">
                    <label className="text-[8.5px] text-zinc-500 font-mono block">ASSET NAME</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Vespa Electro-E3, Chef Slicer Set Prime"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full p-2 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-white text-[11px] outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-[#1DB954] hover:bg-[#1ed760] text-zinc-950 text-[10.5px] font-black font-mono tracking-wider uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 hover:scale-[1.01]"
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" /> Commit Asset Allocation
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
