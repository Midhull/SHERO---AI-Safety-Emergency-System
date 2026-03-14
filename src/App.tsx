import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import SOSActivation from "./pages/SOSActivation";
import LiveTracking from "./pages/LiveTracking";
import AdminDashboard from "./pages/AdminDashboard";
import Contacts from "./pages/Contacts";
import About from "./pages/About";
import HowToUse from "./pages/HowToUse";
import Timer from "./pages/Timer";

import Navbar from "./components/Navbar";
import FloatingSOS from "./components/FloatingSOS";
import ParticleBackground from "./components/ParticleBackground";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <ParticleBackground />
        <BrowserRouter>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sos" element={<SOSActivation />} />
              <Route path="/map" element={<LiveTracking />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/about" element={<About />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
          <FloatingSOS />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
