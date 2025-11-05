import { Home, Landmark, Wallet, TrendingUp, Bell, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export const BottomNav = () => {
  const { currentPage, setCurrentPage } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'banks', label: 'Banks', icon: Landmark },
    { id: 'cash', label: 'Cash', icon: Wallet },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-2xl mx-auto flex justify-around items-center px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as any)}
              className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
