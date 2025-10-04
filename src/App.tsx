import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AccessibilityProvider } from './components/Accessibility/AccessibilityProvider';
import AccessibilityPanel from './components/Accessibility/AccessibilityPanel';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import WireframeGallery from './components/Wireframes/WireframeGallery';
import UserProfile from './components/UserProfile/UserProfile';
import UserManagement from './components/UserManagement/UserManagement';
import AppointmentManagement from './components/AppointmentManagement/AppointmentManagement';
import DoctorManagement from './components/DoctorManagement/DoctorManagement';
import Reports from './components/Reports/Reports';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DatabaseStatus from './components/DatabaseStatus/DatabaseStatus';

const AuthPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {isRegisterMode ? (
          <RegisterForm onSwitchToLogin={() => setIsRegisterMode(false)} />
        ) : (
          <LoginForm onSwitchToRegister={() => setIsRegisterMode(true)} />
        )}
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['dashboard']);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handlePageChange = (page: string) => {
    if (page !== currentPage) {
      setNavigationHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
    }
  };

  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      const previousPage = newHistory.pop();
      setNavigationHistory(newHistory);
      if (previousPage) {
        setCurrentPage(previousPage);
      }
    } else {
      setCurrentPage('dashboard');
    }
  };

  const showBackButton = currentPage !== 'dashboard';
  const getBackLabel = () => {
    const lastPage = navigationHistory[navigationHistory.length - 1];
    switch (lastPage) {
      case 'dashboard':
        return 'Volver al Dashboard';
      case 'perfil':
        return 'Volver al Perfil';
      case 'citas':
        return 'Volver a Citas';
      default:
        return 'Atrás';
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'perfil':
        return <UserProfile onBack={handleBack} />;
      case 'wireframes':
        return <WireframeGallery onBack={handleBack} />;
      case 'usuarios':
        return <UserManagement onBack={handleBack} />;
      case 'citas':
        return <AppointmentManagement onBack={handleBack} />;
      case 'medicos':
        return <DoctorManagement onBack={handleBack} />;
      case 'reportes':
        return <Reports />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximamente</h2>
            <p className="text-gray-600">Esta funcionalidad estará disponible pronto.</p>
            {showBackButton && (
              <button
                onClick={handleBack}
                className="mt-4 flex items-center space-x-2 mx-auto text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver</span>
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar 
          currentPage={currentPage}
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col">
          <Header 
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            showSidebar={sidebarOpen}
            showBackButton={showBackButton}
            onBack={handleBack}
            backLabel={getBackLabel()}
            onOpenAccessibility={() => setAccessibilityPanelOpen(true)}
          />
          
          <main id="main-content" className="flex-1 p-6" role="main">
            {renderCurrentPage()}
          </main>
        </div>
      </div>

      <AccessibilityPanel
        isOpen={accessibilityPanelOpen}
        onClose={() => setAccessibilityPanelOpen(false)}
      />

      <DatabaseStatus />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </AccessibilityProvider>
  );
};

export default App;