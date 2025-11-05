import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { Sidebar } from './components/Layout/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { BanksView } from './components/Banks/BanksView';
import { UploadView } from './components/Upload/UploadView';
import { TransactionsView } from './components/Transactions/TransactionsView';
import { ReportsView } from './components/Reports/ReportsView';
import { NotificationsView } from './components/Notifications/NotificationsView';
import { ContactsView } from './components/Contacts/ContactsView';
import { SettingsView } from './components/Settings/SettingsView';

function MainApp() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggleMode={() => setAuthMode('signup')} />
    ) : (
      <SignUp onToggleMode={() => setAuthMode('login')} />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'banks':
        return <BanksView />;
      case 'upload':
        return <UploadView />;
      case 'transactions':
        return <TransactionsView />;
      case 'contacts':
        return <ContactsView />;
      case 'reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 ml-64">
        <main className="min-h-screen">{renderView()}</main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
