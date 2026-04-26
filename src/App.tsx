import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Toaster } from "./components/ui/sonner";
import { motion, useScroll, useSpring } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { CartPage } from "./pages/CartPage";
import { UserDashboard } from "./pages/UserDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StaffDashboard } from "./pages/StaffDashboard";
import { useEffect } from "react";
import { Mail } from "lucide-react";
import { Button } from "./components/ui/button";
import { UserRole } from "./types";

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: UserRole[] }) {
  const { isAuthenticated, user, loading, isEmailVerified, logout } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  if (!isEmailVerified) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="text-muted-foreground max-w-md">
          You need to verify your email address to access this page. 
          Please check your inbox for the verification link.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            I've verified
          </Button>
          <Button variant="ghost" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  const userRole = user?.role;
  
  if (roles && userRole) {
    if (!roles.includes(userRole)) {
       if (userRole === 'admin') return <Navigate to="/admin-dashboard" replace />;
       if (userRole === 'staff') return <Navigate to="/admin-dashboard" replace />;
       return <Navigate to="/shop" replace />;
    }
  }

  return <>{children}</>;
}

function AuthRedirect() {
  const { isAuthenticated, user, loading, isEmailVerified } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user && isEmailVerified) {
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/shop') {
        if (user.role === 'admin' || user.role === 'staff') {
           navigate('/admin-dashboard', { replace: true });
        } else {
           navigate('/shop', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, loading, navigate, isEmailVerified]);

  return null;
}

function AppContent() {
  const { scrollYProgress } = useScroll();
  const location = useLocation();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const isHomePage = location.pathname === '/' || location.pathname === '/shop';

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors duration-500">
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      <Navbar />
      
      <main className={isHomePage ? "" : "pt-24"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute roles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute roles={['admin', 'staff']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/staff-dashboard" 
            element={
              <ProtectedRoute roles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <Toaster position="top-center" expand={true} richColors />
      <AuthRedirect />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;