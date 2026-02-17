import { useState, useEffect, useCallback } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function Settings() {
  const { userData } = useAuth();
  const clubId = userData?.clubId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [staffEmail, setStaffEmail] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [addingStaff, setAddingStaff] = useState(false);

  // ================= FETCH CLUB =================
  useEffect(() => {
    if (!clubId) return;

    const fetchClub = async () => {
      try {
        const snap = await getDoc(doc(db, "clubs", clubId));
        if (snap.exists()) {
          setName(snap.data().name || "");
          setPhone(snap.data().phone || "");
        }
      } catch (err) {
        console.error("Fetch club error:", err);
      }
    };

    fetchClub();
  }, [clubId]);

  // ================= FETCH STAFF =================
  const fetchStaff = useCallback(async () => {
    if (!clubId) return;

    try {
      const snapshot = await getDocs(
        collection(db, "clubs", clubId, "staff")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setStaffList(data);
    } catch (err) {
      console.error("Fetch staff error:", err);
    }
  }, [clubId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ================= SAVE COMPANY =================
  const handleSave = async () => {
    try {
      setSaving(true);

      await updateDoc(doc(db, "clubs", clubId), {
        name,
        phone,
      });

      alert("Updated successfully");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ================= ADD STAFF =================
  const handleAddStaff = async () => {
    const email = staffEmail.trim().toLowerCase();

    if (!email) return;
    if (!email.includes("@")) return alert("Invalid email format");

    // ❌ Owner o‘zini staff qila olmaydi
    if (email === userData?.email?.toLowerCase()) {
      return alert("Owner cannot be added as staff");
    }

    // duplicate check
    if (staffList.some((s) => s.email === email)) {
      return alert("This email already added");
    }

    try {
      setAddingStaff(true);

      await addDoc(
        collection(db, "clubs", clubId, "staff"),
        {
          email,
          role: "staff",
          createdAt: serverTimestamp(),
        }
      );

      setStaffEmail("");
      await fetchStaff(); // ✅ endi mavjud
    } catch (err) {
      console.error("Add staff error:", err);
    } finally {
      setAddingStaff(false);
    }
  };

  // ================= DELETE STAFF =================
  const handleDeleteStaff = async (id) => {
    try {
      await deleteDoc(doc(db, "clubs", clubId, "staff", id));
      await fetchStaff();
    } catch (err) {
      console.error("Delete staff error:", err);
    }
  };

  // ================= ONLY OWNER =================
  if (userData?.role !== "owner") {
    return (
      <div className="text-white">
        Only owner can edit company settings.
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-12 text-white">

      {/* COMPANY SETTINGS */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          Company Settings
        </h1>

        <div className="space-y-4">

          <div>
            <label className="block mb-1 text-sm text-gray-400">
              Company Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-white/10"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-400">
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 rounded bg-gray-800 border border-white/10"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 rounded text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>

      {/* STAFF MANAGEMENT */}
      <div className="space-y-6 border-t border-white/10 pt-8">

        <h2 className="text-xl font-semibold">
          Staff Management
        </h2>

        <div className="flex gap-3">
          <input
            type="email"
            placeholder="staff@gmail.com"
            value={staffEmail}
            onChange={(e) => setStaffEmail(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-800 border border-white/10"
          />
          <button
            onClick={handleAddStaff}
            disabled={addingStaff}
            className="px-4 py-2 bg-green-600 rounded text-white disabled:opacity-50"
          >
            {addingStaff ? "Adding..." : "Add Staff"}
          </button>
        </div>

        <div className="space-y-3">
          {staffList.length === 0 && (
            <div className="text-gray-400 text-sm">
              No staff added yet
            </div>
          )}

          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between bg-gray-800 border border-white/10 rounded-lg px-4 py-3"
            >
              <div>
                <div className="font-medium">
                  {staff.email}
                </div>
                <div className="text-xs text-gray-400">
                  {staff.role}
                </div>
              </div>

              <button
                onClick={() => handleDeleteStaff(staff.id)}
                className="text-red-400 hover:text-red-300 transition"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
