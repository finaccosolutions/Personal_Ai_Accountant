import {
  LayoutDashboard,
  Upload,
  Wallet,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Building2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'upload', icon: Upload, label: 'Upload Statements' },
    { id: 'banks', icon: Building2, label: 'Manage Banks' },
    { id: 'transactions', icon: Wallet, label: 'Transactions' },
    { id: 'contacts', icon: Users, label: 'Contacts' },
    { id: 'reports', icon: TrendingUp, label: 'Reports & Analysis' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          FinanceAI
        </h1>
        <p className="text-gray-400 text-sm mt-1">Smart Accounting</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                  : 'hover:bg-gray-700/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-600/20 transition-all duration-200 text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
