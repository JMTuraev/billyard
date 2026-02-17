import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) return <Navigate to="/login" />;

  // 🔥 Agar create-company sahifasida bo‘lsa — redirect qilmaymiz
  if (
    userData?.role === "owner" &&
    !userData?.clubId &&
    location.pathname !== "/create-company"
  ) {
    return <Navigate to="/create-company" />;
  }

  return children;
}
