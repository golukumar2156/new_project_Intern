import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OwnerSignupPage } from './pages/OwnerSignupPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminStoresPage } from './pages/AdminStoresPage';
import { UserStoresPage } from './pages/UserStoresPage';
import { OwnerDashboard } from './pages/OwnerDashboard';

// ProtectedRoute: only allows authenticated users with the required role
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their role's default page
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <>{children}</>;
};

// GuestRoute: blocks logged-in users from visiting login/signup pages
// If already authenticated, redirect them to their role's home page
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">
        Loading session...
      </div>
    );
  }

  if (user) {
    if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return <>{children}</>;
};

// DefaultRedirect: decides where to send visitors to "/" or unknown routes
const DefaultRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'SYSTEM_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Guest-only routes: redirect if already logged in */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
              <Route path="/signup/owner" element={<GuestRoute><OwnerSignupPage /></GuestRoute>} />

              {/* System Administrator Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stores"
                element={
                  <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
                    <AdminStoresPage />
                  </ProtectedRoute>
                }
              />

              {/* Normal User Routes */}
              <Route
                path="/stores"
                element={
                  <ProtectedRoute allowedRoles={['NORMAL_USER']}>
                    <UserStoresPage />
                  </ProtectedRoute>
                }
              />

              {/* Store Owner Routes */}
              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STORE_OWNER']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="/" element={<DefaultRedirect />} />
              <Route path="*" element={<DefaultRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
