import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddTable({ clubId }) {
  const [number, setNumber] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!number || !pricePerHour) return;

    setLoading(true);

    await addDoc(
      collection(db, "clubs", clubId, "tables"),
      {
        number: Number(number),
        pricePerHour: Number(pricePerHour),
        status: "idle",
        startedAt: null,
        activePrice: null,
        createdAt: serverTimestamp(),
      }
    );

    setNumber("");
    setPricePerHour("");
    setLoading(false);
  };

  return (
    <div className="flex gap-3">
      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Table number..."
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none w-32"
      />

      <input
        type="number"
        value={pricePerHour}
        onChange={(e) => setPricePerHour(e.target.value)}
        placeholder="Price per hour..."
        className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none w-40"
      />

      <button
        onClick={handleAdd}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-white font-medium disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Table"}
      </button>
    </div>
  );
}
