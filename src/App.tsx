import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { DebugProvider } from "@/providers/DebugProvider";
import { SecurityWrapper } from "@/components/SecurityWrapper";
import { CurrencyProvider } from "@/providers/CurrencyProvider";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import { DebugPanel } from "./components/DebugPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import SharedAccounts from "./pages/SharedAccounts";
import Auth from "./pages/Auth";
import Reminders from "./pages/Reminders";
import Analytics from "./pages/Analytics";
import Motivation from "./pages/Motivation";
import Profile from "./pages/Profile";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import NotFound from "./pages/NotFound";
import TestError from "./pages/TestError";

const queryClient = new QueryClient();

const Router = process.env.NODE_ENV === 'production' ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
    <ThemeProvider defaultTheme="light" storageKey="finska-ui-theme">
      <CurrencyProvider>
        <DebugProvider>
          <SecurityWrapper>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <DebugPanel />
          <Router>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="shared-accounts" element={<SharedAccounts />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="motivation" element={<Motivation />} />
            <Route path="profile" element={<Profile />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="income" element={<Income />} />
            <Route path="test-error" element={<TestError />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          </TooltipProvider>
        </SecurityWrapper>
      </DebugProvider>
      </CurrencyProvider>
    </ThemeProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
