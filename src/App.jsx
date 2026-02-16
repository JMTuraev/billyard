import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Statistics from "./pages/Statistics";
import Unauthorized from "./pages/Unauthorized";
import Sessions from "./pages/Sessions";

import PrivateRoute from "./components/routes/PrivateRoute";
import RoleGuard from "./components/routes/RoleGuard";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* PUBLIC */}
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
        </Route>



      </Routes> 
    </AuthProvider>
  );
}

export default App;
