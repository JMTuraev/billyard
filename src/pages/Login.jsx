import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        Google bilan kirish
      </button>
    </div>
  );
}
