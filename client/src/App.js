// Author: Abedulalrazaq Altaih
// Student ID: S242815
// Date: 9/04/2026
// Project: Decentralized Healthcare System
// Honours Project
// Glasgow Caledonian University

import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { config } from './config/wagmi';

import HomePage            from './pages/Home';
import LoginRegisterPage from './pages/Loginregisterpage';
import PatientRegister     from './pages/patient/Register';
import PatientLogin        from './pages/patient/Login';
import PatientDashboard    from './pages/patient/Dashboard';
import DoctorRegister      from './pages/doctor/Register';
import AdminDashboard      from './pages/admin/Dashboard';
import DoctorDashboard     from './pages/doctor/Dashboard';
import BrowseDoctors       from './pages/patient/BrowseDoctors';
import PatientAppointments from './pages/patient/Appointments';
import MedicalRecords      from './pages/patient/MedicalRecords';
import ManageAccess        from './pages/patient/ManageAccess';
import NotificationBell    from './components/shared/NotificationBell';
import ConnectWallet       from './components/shared/ConnectWallet';


const queryClient = new QueryClient();

// These routes have their own navbar — hide the global one
const NO_GLOBAL_NAV = [
  '/',
  '/login',        
  '/patient/login',
  '/patient/register',
  '/patient/dashboard',
  '/patient/browse-doctors',
  '/patient/appointments',
  '/patient/records',
  '/patient/manage-access',
];

function NavBar() {
  const location = useLocation();
  const hide = NO_GLOBAL_NAV.some(r =>
    r === '/' ? location.pathname === '/' : location.pathname.startsWith(r)
  );
  if (hide) return null;
  return (
    <nav className="bg-white shadow px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Healthcare Management DApp</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}

// Add padding wrapper only for inner pages, not homepage
function PageWrapper({ children }) {
  const location = useLocation();
  if (location.pathname === '/') return <>{children}</>;
  return <div className="max-w-7xl mx-auto py-10 px-6">{children}</div>;
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <PageWrapper>
        <Routes>
          <Route path="/"                       element={<HomePage />} />
          <Route path="/login" element={<LoginRegisterPage />} />
          <Route path="/patient/login"          element={<PatientLogin />} />
          <Route path="/patient/register"       element={<PatientRegister />} />
          <Route path="/patient/dashboard"      element={<PatientDashboard />} />
          <Route path="/patient/browse-doctors" element={<BrowseDoctors />} />
          <Route path="/patient/appointments"   element={<PatientAppointments />} />
          <Route path="/patient/records"        element={<MedicalRecords />} />
          <Route path="/patient/manage-access"  element={<ManageAccess />} />
          <Route path="/doctor/register"        element={<DoctorRegister />} />
          <Route path="/doctor/dashboard"       element={<DoctorDashboard />} />
          <Route path="/admin/dashboard"        element={<AdminDashboard />} />
          
        </Routes>
      </PageWrapper>
    </>
  );
}

function App() {
  return (
    <PrivyProvider
      appId="cmmfon23t00wq0bl59sp17e8q"
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#3B82F6',
          logo: null,
        },
        loginMethods: ['email', 'passkey'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-100">
              <AppRoutes />
            </div>
          </BrowserRouter>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;