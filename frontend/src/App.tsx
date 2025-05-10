import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Drives from "./pages/Drives";
import Reports from "./pages/Reports";
import Layout from "./Layout";
import Login from "./pages/Login";

// Auth check function
const isAuthenticated = () => {
  return (
    sessionStorage.getItem('isAuthenticated') === 'true' ||
    localStorage.getItem('isAuthenticated') === 'true'
  );
};

// Protected route wrapper component
const ProtectedWrapper = () => {
  return isAuthenticated() ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />;
};

export default function App() {
  useEffect(() => {
    const expireTime = 30 * 60 * 1000; // 30 minutes
    const loginTime = localStorage.getItem('loginTime') || sessionStorage.getItem('loginTime');

    if (loginTime && Date.now() - Number(loginTime) > expireTime) {
      sessionStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('loginTime');
      localStorage.removeItem('loginTime');
    }
  }, []);
  return (
    <MantineProvider>
      <Notifications position="top-center" />
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes wrapper */}
        <Route element={<ProtectedWrapper />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/drives" element={<Drives />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </MantineProvider>
  );
}