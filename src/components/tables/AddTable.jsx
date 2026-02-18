import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddTable({ clubId }) {
  const [number, setNumber] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!number || !pricePerHour || !deviceId) return;

    setLoading(true);

    await addDoc(
      collection(db, "clubs", clubId, "tables"),
      {
        number: Number(number),
        pricePerHour: Number(pricePerHour),
        deviceId: deviceId.trim(),
        status: "free",
        currentSessionId: null,
        createdAt: serverTimestamp(),
      }
    );

    setNumber("");
    setPricePerHour("");
    setDeviceId("");
    setLoading(false);
  };

  return (
    <div className="flex gap-3 flex-wrap">
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Table number"
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 w-32"
      />

      <input
        type="number"
        value={pricePerHour}
        onChange={(e) => setPricePerHour(e.target.value)}
        placeholder="Price per hour"
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 w-40"
      />

      <input
        type="text"
        value={deviceId}
        onChange={(e) => setDeviceId(e.target.value)}
        placeholder="Tuya Device ID"
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 w-64"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Table"}
      </button>
    </div>
  );
}
