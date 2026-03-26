import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GymProvider } from "@/context/GymContext";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import AddMember from "@/pages/AddMember";
import CheckIn from "@/pages/CheckIn";
import Members from "@/pages/Members";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GymProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/add-member" element={<AppLayout><AddMember /></AppLayout>} />
            <Route path="/check-in" element={<AppLayout><CheckIn /></AppLayout>} />
            <Route path="/members" element={<AppLayout><Members /></AppLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GymProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
