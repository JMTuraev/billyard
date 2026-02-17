import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import TableCard from "../components/tables/TableCard"; // 🔥 SHU QATOR YO‘Q EDI

export default function Tables() {
  const { userData } = useAuth();
  const clubId = userData?.clubId;

  const [tables, setTables] = useState([]);
  const [, forceUpdate] = useState(0);

  // 🔄 Realtime tables
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

  // 🔁 Har minut UI refresh (live timer uchun)
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((v) => v + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // ▶ START
  const startSession = async (table) => {
    const sessionRef = await addDoc(
      collection(db, "clubs", clubId, "sessions"),
      {
        tableId: table.id,
        tableNumber: table.number,
        pricePerHour: table.pricePerHour,
        openedAt: serverTimestamp(),
        status: "open",
        amountPaid: 0,
      }
    );

    await updateDoc(doc(db, "clubs", clubId, "tables", table.id), {
      status: "busy",
      currentSessionId: sessionRef.id,
    });
  };

  // ⏹ STOP
  const stopSession = async (table) => {
    const sessionSnap = await getDoc(
      doc(db, "clubs", clubId, "sessions", table.currentSessionId)
    );

    if (!sessionSnap.exists()) return;

    const session = sessionSnap.data();

    const now = new Date();
    const opened = session.openedAt.toDate();

    const minutes = Math.floor((now - opened) / 60000);

    const amount =
      Math.ceil(minutes / 60) * table.pricePerHour;

    await updateDoc(
      doc(db, "clubs", clubId, "sessions", table.currentSessionId),
      {
        closedAt: serverTimestamp(),
        status: "closed",
        amountPaid: amount,
      }
    );

    await updateDoc(doc(db, "clubs", clubId, "tables", table.id), {
      status: "free",
      currentSessionId: null,
    });
  };

  const getLiveMinutes = (openedAt) => {
    if (!openedAt) return 0;
    const now = new Date();
    const opened = openedAt.toDate();
    return Math.floor((now - opened) / 60000);
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-10">Tables</h1>

      <div className="grid grid-cols-4 gap-6">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            clubId={clubId}
            startSession={startSession}
            stopSession={stopSession}
            getLiveMinutes={getLiveMinutes}
          />
        ))}
      </div>
    </div>
  );
}
