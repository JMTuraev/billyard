import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

import { startTable, stopTable } from "../api/tables";

import TablesGrid from "../components/tables/TablesGrid";
import AddTableModal from "../components/tables/AddTableModal";

export default function Tables() {
  const { userData } = useAuth();
  const clubId = userData?.clubId;

  const [tables, setTables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  /* ================= REALTIME TABLES ================= */
  useEffect(() => {
    if (!clubId) return;

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

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  /* ================= START ================= */
  const startSession = async (table) => {
    try {
      await startTable(clubId, table.id);
      console.log("START SUCCESS");
    } catch (err) {
      alert("Start error: " + err.response?.data?.error);
    }
  };

  /* ================= STOP ================= */
  const stopSession = async (table) => {
    try {
      await stopTable(clubId, table.id);
      console.log("STOP SUCCESS");
    } catch (err) {
      alert("Stop error: " + err.response?.data?.error);
    }
  };

  const getLiveMinutes = (openedAt) => {
    if (!openedAt) return 0;
    const now = new Date();
    const opened = openedAt.toDate();
    return Math.floor((now - opened) / 60000);
  };

  return (
    <div className="p-10 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tables</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md"
        >
          + Add Table
        </button>
      </div>

      <TablesGrid
        tables={tables}
        clubId={clubId}
        startSession={startSession}
        stopSession={stopSession}
        getLiveMinutes={getLiveMinutes}
      />

      {isModalOpen && (
        <AddTableModal
          clubId={clubId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
