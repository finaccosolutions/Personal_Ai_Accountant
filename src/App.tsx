import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthPage } from './components/Auth/AuthPage';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { BanksPage } from './components/Banks/BanksPage';
import { CashPage } from './components/Cash/CashPage';
import { InsightsPage } from './components/Insights/InsightsPage';
import { RemindersPage } from './components/Reminders/RemindersPage';
import { SettingsPage } from './components/Settings/SettingsPage';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currentPage } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Dashboard />;
      case 'banks':
        return <BanksPage />;
      case 'cash':
        return <CashPage />;
      case 'insights':
        return <InsightsPage />;
      case 'reminders':
        return <RemindersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return <MainLayout>{renderPage()}</MainLayout>;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
