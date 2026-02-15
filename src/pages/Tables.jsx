import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

import TableCard from "../components/tables/TableCard";
import AddTableModal from "../components/tables/AddTableModal";

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const clubId = "club_1";

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "clubs", clubId, "tables"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTables(data);
      }
    );

    return () => unsub();
  }, [clubId]);

  return (
    <div className="p-8">

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-white">
          Tables
        </h1>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition"
        >
          Add Table
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-gray-400">
          No tables yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              clubId={clubId}
            />
          ))}
        </div>
      )}

      <AddTableModal
        open={modalOpen}
        setOpen={setModalOpen}
        clubId={clubId}
      />
    </div>
  );
}
