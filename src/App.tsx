import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { GymProvider } from "@/context/GymContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AddMember from "@/pages/AddMember";
import CheckIn from "@/pages/CheckIn";
import Members from "@/pages/Members";
import Auth from "@/pages/Auth";
import SetupGym from "@/pages/SetupGym";
import GymSettings from "@/pages/GymSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, hasGym, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!hasGym && location.pathname !== "/setup-gym") return <Navigate to="/setup-gym" replace />;
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup-gym" element={<ProtectedRoute><SetupGym /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><GymProvider><AppLayout><Dashboard /></AppLayout></GymProvider></ProtectedRoute>} />
            <Route path="/add-member" element={<ProtectedRoute><GymProvider><AppLayout><AddMember /></AppLayout></GymProvider></ProtectedRoute>} />
            <Route path="/check-in" element={<ProtectedRoute><GymProvider><AppLayout><CheckIn /></AppLayout></GymProvider></ProtectedRoute>} />
            <Route path="/members" element={<ProtectedRoute><GymProvider><AppLayout><Members /></AppLayout></GymProvider></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><GymProvider><AppLayout><GymSettings /></AppLayout></GymProvider></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
