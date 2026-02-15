import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Statistics from "./pages/Statistics"; // 🔥 TO‘G‘RI IMPORT
import Unauthorized from "./pages/Unauthorized";

import PrivateRoute from "./components/routes/PrivateRoute";
import RoleGuard from "./components/routes/RoleGuard";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* PROTECTED + LAYOUT */}
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Tables */}
          <Route
            path="tables"
            element={
              <RoleGuard allow={["owner", "staff"]}>
                <Tables />
              </RoleGuard>
            }
          />

          {/* Statistics */}
          <Route
            path="stats"
            element={
              <RoleGuard allow={["owner"]}>
                <Statistics />   {/* 🔥 TO‘G‘RI COMPONENT */}
              </RoleGuard>
            }
          />
        </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;
