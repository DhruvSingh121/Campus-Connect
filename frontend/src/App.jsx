import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Clubs from "./pages/Clubs";
import MyClubs from "./pages/MyClubs";
import Members from "./pages/Members";
import Requests from "./pages/Requests";
import Students from "./pages/Students";
import ClubAdmins from "./pages/ClubAdmins";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading CampusConnect...</div>;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
              <Route path="/clubs" element={<ProtectedRoute><Clubs /></ProtectedRoute>} />
              <Route path="/my-clubs" element={<ProtectedRoute allowedRoles={["student"]}><MyClubs /></ProtectedRoute>} />
              <Route path="/members" element={<ProtectedRoute allowedRoles={["clubadmin"]}><Members /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute allowedRoles={["clubadmin", "superadmin"]}><Requests /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute allowedRoles={["superadmin"]}><Students /></ProtectedRoute>} />
              <Route path="/club-admins" element={<ProtectedRoute allowedRoles={["superadmin"]}><ClubAdmins /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
