import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RoleGuard({ children, allow }) {
  const { userData, loading } = useAuth();

  if (loading) return null;

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(userData.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
