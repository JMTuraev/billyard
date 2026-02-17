import { useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

export default function CreateCompany() {
  const { user, userData, loading, setUserData } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  // 📱 Phone format function
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, ""); // faqat raqam
    if (digits.startsWith("998")) return "+" + digits;
    if (digits.startsWith("8")) return "+99" + digits;
    return "+998" + digits;
  };

  const handleCreate = async () => {
    if (!name.trim() || !phone.trim()) {
      return alert("Fill all fields");
    }

    if (userData?.clubId) {
      return alert("You already have a company");
    }

    try {
      setCreating(true);

      const formattedPhone = formatPhone(phone);

      // 🔥 Club ID = user.uid (qat’iy 1 user = 1 company)
      const clubRef = doc(db, "clubs", user.uid);

      await setDoc(clubRef, {
        name: name.trim(),
        phone: formattedPhone,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
      });

      // 🔥 User update
      await updateDoc(doc(db, "users", user.uid), {
        clubId: user.uid,
      });

      // 🔥 Context update
      setUserData({
        ...userData,
        clubId: user.uid,
      });

      navigate("/");

    } catch (err) {
      console.error("Create company error:", err);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-white p-8 rounded-xl w-80 space-y-4 shadow-lg">
        <h2 className="text-xl font-semibold text-center">
          Create Company
        </h2>

        <input
          placeholder="Billiard Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Phone (+998901234567)"
          className="w-full border p-2 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Company"}
        </button>
      </div>
    </div>
  );
}
