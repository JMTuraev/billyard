import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Statistics from "./pages/Statistics";
import Unauthorized from "./pages/Unauthorized";
import Sessions from "./pages/Sessions";
import CreateCompany from "./pages/CreateCompany";
import Settings from "./pages/Settings";

import PrivateRoute from "./components/routes/PrivateRoute";
import RoleGuard from "./components/routes/RoleGuard";
import DashboardLayout from "./layouts/DashboardLayout";

function AppRoutes() {
  const { user, userData, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>

      {/* PUBLIC */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}

      {/* USER BOR LEKIN CLUB YO‘Q */}
      {user && !userData?.clubId && (
        <>
          <Route
            path="/create-company"
            element={
              <PrivateRoute>
                <CreateCompany />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/create-company" />} />
        </>
      )}

      {/* USER BOR VA CLUB BOR */}
      {user && userData?.clubId && (
        <>
          <Route
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />

            <Route
              path="tables"
              element={
                <RoleGuard allow={["owner", "staff"]}>
                  <Tables />
                </RoleGuard>
              }
            />

            <Route
              path="stats"
              element={
                <RoleGuard allow={["owner"]}>
                  <Statistics />
                </RoleGuard>
              }
            />

            <Route
              path="sessions"
              element={
                <RoleGuard allow={["owner"]}>
                  <Sessions />
                </RoleGuard>
              }
            />

            {/* 🔥 SETTINGS LAYOUT ICHIDA */}
            <Route
              path="settings"
              element={
                <RoleGuard allow={["owner"]}>
                  <Settings />
                </RoleGuard>
              }
            />

            {/* UNAUTHORIZED HAM LAYOUT ICHIDA */}
            <Route path="unauthorized" element={<Unauthorized />} />

          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </>
      )}

    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
