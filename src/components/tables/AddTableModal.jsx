import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddTableModal({ clubId, onClose }) {
  const [number, setNumber] = useState("");
  const [price, setPrice] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!number || !price || !deviceId) {
      setError("All fields are required");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await addDoc(
        collection(db, "clubs", clubId, "tables"),
        {
          number: Number(number),
          pricePerHour: Number(price),
          deviceId: deviceId.trim(),
          status: "free",
          currentSessionId: null,
          createdAt: serverTimestamp(),
        }
      );

      onClose();
    } catch (err) {
      console.error("Add table error:", err);
      setError("Failed to add table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl w-96 border border-white/10">
        <h2 className="text-xl font-semibold mb-6 text-white">
          Add New Table
        </h2>

        <input
          type="number"
          placeholder="Table number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-white/10 text-white"
        />

        <input
          type="number"
          placeholder="Price per hour"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-white/10 text-white"
        />

        <input
          type="text"
          placeholder="Tuya Device ID"
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-white/10 text-white"
        />

        {error && (
          <div className="text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded text-white"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-white disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
