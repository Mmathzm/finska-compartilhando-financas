import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { DebugProvider } from "@/providers/DebugProvider";
import Layout from "./components/Layout";
import { DebugPanel } from "./components/DebugPanel";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import SharedAccounts from "./pages/SharedAccounts";
import Auth from "./pages/Auth";
import Reminders from "./pages/Reminders";
import Analytics from "./pages/Analytics";
import Motivation from "./pages/Motivation";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="finska-ui-theme">
      <DebugProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <DebugPanel />
          <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="shared-accounts" element={<SharedAccounts />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="motivation" element={<Motivation />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DebugProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
