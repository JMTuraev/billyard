import { Dialog } from "@headlessui/react";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function AddTableModal({ open, setOpen, clubId }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");

  const handleSubmit = async () => {
    if (!name || !number || !pricePerHour) return;

    await addDoc(
      collection(db, "clubs", clubId, "tables"),
      {
        name,
        number: Number(number),
        pricePerHour: Number(pricePerHour),
        status: "idle",
        startedAt: null,
        createdAt: new Date(),
      }
    );

    setName("");
    setNumber("");
    setPricePerHour("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-50">
      <div className="fixed inset-0 bg-black/60" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-gray-900 p-6 text-white shadow-xl">

          <Dialog.Title className="text-lg font-semibold mb-4">
            Add New Table
          </Dialog.Title>

          <div className="space-y-4">

            <input
              placeholder="Table name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
            />

            <input
              placeholder="Table number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
            />

            <input
              placeholder="Price per hour"
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
              >
                Add
              </button>
            </div>

          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
