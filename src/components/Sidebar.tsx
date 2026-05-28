import { 
  LayoutDashboard, 
  Lightbulb, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  TrendingUp,
  UserCheck,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  userEmail: string;
  pendingApprovalsCount?: number;
}

export default function Sidebar({ activeTab, setActiveTab, darkMode, userEmail, pendingApprovalsCount = 0 }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'customizer', label: 'MEAL CUSTOMIZER', icon: Lightbulb },
    { id: 'orders', label: 'ORDERS QUEUE', icon: ShoppingBag },
    { id: 'crm', label: 'CRM CLIENTS', icon: Users },
    { id: 'approvals', label: 'APPROVALS', icon: CheckSquare, badgeCount: pendingApprovalsCount },
    { id: 'hrm', label: 'HRM STAFF', icon: UserCheck },
    { id: 'finance', label: 'FINANCE LEDGER', icon: DollarSign },
    { id: 'inventory', label: 'INVENTORY STOCK', icon: Package },
    { id: 'analytics', label: 'HEALTH ANALYTICS', icon: TrendingUp },
  ];

  const getNameFromEmail = (email: string) => {
    if (!email) return 'Ops User';
    const namePart = email.split('@')[0];
    return namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const userName = getNameFromEmail(userEmail);
  const userInitial = userName.charAt(0);

  return (
    <aside 
      id="main-sidebar"
      className={`fixed top-0 left-0 bottom-0 h-full flex flex-col justify-between transition-all duration-300 z-50 border-r ${
        darkMode 
          ? 'bg-[#111412] border-[#222A25] text-[#8C9A94]' 
          : 'bg-white border-zinc-200 text-slate-600'
      } lg:w-64 md:w-20 w-20`}
    >
      {/* Brand logo at the top */}
      <div className="p-6 flex flex-col items-center lg:items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white font-black text-xs shadow-sm">
            G
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-white hidden lg:block">
            GreenBite
          </h1>
        </div>
      </div>

      {/* Menu Icons list navigation */}
      <nav className="flex-1 px-4 space-y-1.5 flex flex-col justify-start" aria-label="Main Navigation">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          const activeBg = darkMode ? 'bg-[#1A221E] text-[#10b981]' : 'bg-emerald-50 text-[#10b981]';
          const inactiveBg = darkMode ? 'hover:bg-[#151916] hover:text-white' : 'hover:bg-zinc-100 hover:text-slate-800';

          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all font-medium text-[13px] ${
                isActive ? activeBg : inactiveBg
              } w-full md:justify-center lg:justify-start justify-center relative group border border-transparent`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] absolute left-2 lg:relative lg:left-0 block shrink-0" />
              )}
              <IconComponent className="w-4 h-4 shrink-0" />
              <span className="hidden lg:block truncate">{item.label}</span>
              {'badgeCount' in item && (item.badgeCount as number) > 0 && (
                <span className="lg:flex hidden shrink-0 ml-auto bg-amber-500 text-white font-black text-[10px] w-5 h-5 rounded-full items-center justify-center">
                  {item.badgeCount}
                </span>
              )}

              {/* Floating Tooltip Label (Responsive design fallback for small screen state) */}
              <div 
                id={`tooltip-${item.id}`} 
                className="absolute left-24 px-3 py-1.5 bg-zinc-950 border border-zinc-800 text-white rounded-lg shadow-xl text-[10px] font-bold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 lg:group-hover:opacity-0 transition-opacity duration-200 z-50 font-mono tracking-widest uppercase"
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* User profile avatar / placeholder */}
      <div className={`p-6 border-t ${darkMode ? 'border-[#222A25] bg-[#0E110F]' : 'border-[#E5E9E7] bg-[#FDFDFD]'}`}>
        <div className="flex items-center space-x-3 justify-center lg:justify-start">
          <div 
            id="sidebar-user-avatar"
            className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center font-bold text-[#1DB954] shrink-0 border border-[#1DB954]/30 relative"
            title={userName}
          >
            {userInitial}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1DB954] ring-2 ring-white dark:ring-[#111412]"></span>
          </div>
          <div className="hidden lg:block truncate">
            <p className="text-xs font-black text-zinc-800 dark:text-zinc-200">{userName}</p>
            <p className="text-[10px] text-zinc-500 dark:text-[#8C9A94] font-medium font-mono uppercase tracking-widest truncate">{userEmail.split('@')[0]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
