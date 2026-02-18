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

/* ================= AUTH ROUTING ================= */

function AppRoutes() {
  const { user, userData, loading } = useAuth();

  /* 🔥 LOADING STATE */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  return (
    <Routes>

      {/* ================= PUBLIC ================= */}
      {!user && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      {/* ================= USER BOR LEKIN CLUB YO‘Q ================= */}
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
          <Route
            path="*"
            element={<Navigate to="/create-company" replace />}
          />
        </>
      )}

      {/* ================= USER + CLUB BOR ================= */}
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

            <Route
              path="settings"
              element={
                <RoleGuard allow={["owner"]}>
                  <Settings />
                </RoleGuard>
              }
            />

            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}

    </Routes>
  );
}

/* ================= APP ROOT ================= */

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
