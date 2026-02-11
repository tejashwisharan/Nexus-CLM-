import React from 'react';
import { LayoutDashboard, UserPlus, Search, ListChecks, Bell, ShieldCheck, UserCheck, Flag, Bot, RefreshCw, UserMinus } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus },
    { id: 'ai-log', label: 'AI Agent Log', icon: Bot },
    { id: 'peer-review', label: 'Peer Review', icon: UserCheck },
    { id: 'pkyc', label: 'PKYC / Monitoring', icon: RefreshCw },
    { id: 'offboarding', label: 'Off-boarding', icon: UserMinus }, // New Tab
    { id: 'queue', label: 'EDD Queue', icon: ListChecks }, 
    { id: 'waivers', label: 'Waiver Assessment', icon: Flag },
    { id: 'search', label: 'Entity Search', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-700">
          <ShieldCheck className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Nexus CLM</h1>
            <p className="text-xs text-slate-400">Compliance & Risk</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 text-slate-400 text-sm">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              KA
            </div>
            <div>
              <p className="text-white">KYC Analyst</p>
              <p className="text-xs">Logged in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 capitalize">
            {navItems.find(n => n.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;