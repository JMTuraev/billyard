import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddTableModal({ clubId, onClose }) {
  const [number, setNumber] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!number || !price) return;

    try {
      setLoading(true);

      await addDoc(
        collection(db, "clubs", clubId, "tables"),
        {
          number: Number(number),
          pricePerHour: Number(price),
          status: "free",
          createdAt: new Date(),
        }
      );

      onClose();
    } catch (err) {
      console.error("Add table error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl w-96">
        <h2 className="text-xl font-semibold mb-6">
          Add New Table
        </h2>

        <input
          type="number"
          placeholder="Table number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-800 border border-white/10"
        />

        <input
          type="number"
          placeholder="Price per hour"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mb-6 p-2 rounded bg-gray-800 border border-white/10"
        />

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleAdd}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 rounded"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
