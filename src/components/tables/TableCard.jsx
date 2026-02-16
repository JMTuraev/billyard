import {
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TableCard({ table, clubId }) {
  if (!table || !clubId) return null;

  const tableRef = doc(db, "clubs", clubId, "tables", table.id);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  const isActive = table.status === "active";

  useEffect(() => {
    let interval;

    if (isActive && table.startedAt?.seconds) {
      interval = setInterval(() => {
        const start = table.startedAt.seconds * 1000;
        const now = Date.now();
        const diff = Math.floor((now - start) / 60000);
        setElapsedMinutes(diff);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, table.startedAt]);

  const pricePerHour = table.activePrice || table.pricePerHour;

  const currentAmount = isActive
    ? Math.floor((elapsedMinutes / 60) * pricePerHour)
    : 0;

  const formatMoney = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  // 🔥 START
  const handleStart = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // 1️⃣ Table active qilamiz
      await updateDoc(tableRef, {
        status: "active",
        startedAt: serverTimestamp(),
        activePrice: table.pricePerHour,
      });

      // 2️⃣ Sessions ga yozamiz (status: open)
      await addDoc(collection(db, "clubs", clubId, "sessions"), {
        tableNumber: table.number,
        openedAt: serverTimestamp(),
        closedAt: null,
        amountPaid: 0,
        status: "open",
        workDate: today,
      });

    } catch (err) {
      console.error("Start error:", err);
    }
  };

  // 🔥 STOP
  const handleStop = async () => {
    try {
      if (!table.startedAt?.seconds) return;

      const start = table.startedAt.seconds * 1000;
      const now = Date.now();
      const minutes = Math.floor((now - start) / 60000);
      const amount = Math.floor((minutes / 60) * table.activePrice);

      const today = new Date().toISOString().split("T")[0];

      // 1️⃣ Open sessionni topamiz
      const q = query(
        collection(db, "clubs", clubId, "sessions"),
        where("tableNumber", "==", table.number),
        where("status", "==", "open")
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const sessionDoc = snapshot.docs[0];

        // 2️⃣ Closed ga update qilamiz
        await updateDoc(sessionDoc.ref, {
          closedAt: serverTimestamp(),
          amountPaid: amount,
          status: "closed",
        });
      }

      // 3️⃣ Table idle qilamiz
      await updateDoc(tableRef, {
        status: "idle",
        startedAt: null,
        activePrice: null,
      });

      setElapsedMinutes(0);

    } catch (err) {
      console.error("Stop error:", err);
    }
  };

  const handleDelete = async () => {
    if (isActive) return alert("Active table cannot be deleted");
    if (!window.confirm(`Delete table #${table.number}?`)) return;
    await deleteDoc(tableRef);
  };

  return (
    <div className="w-full h-[210px]">
      <div className="relative h-full w-full rounded-2xl p-2 bg-gradient-to-br from-amber-900 via-amber-700 to-amber-900 shadow-lg">

        <div
          className={`relative h-full w-full rounded-xl overflow-hidden
          bg-gradient-to-br
          ${
            isActive
              ? "from-green-600 via-green-500 to-green-700"
              : "from-green-800 via-green-700 to-green-900"
          }
          shadow-inner`}
        >

          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <PencilIcon className="w-4 h-4 text-white/70 hover:text-white cursor-pointer transition" />
            <TrashIcon
              onClick={handleDelete}
              className="w-4 h-4 text-white/70 hover:text-red-400 cursor-pointer transition"
            />
          </div>

          <div className="flex h-full text-white px-6">

            <div className="w-1/3 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                {table.number}
              </div>
            </div>

            <div className="w-2/3 flex flex-col justify-center">

              <div className="text-sm tracking-wide">
                {isActive ? "ACTIVE" : "IDLE"}
              </div>

              <div className="mt-1 text-sm opacity-90">
                {formatMoney(table.pricePerHour)} so'm / hour
              </div>

              {isActive && (
                <>
                  <div className="mt-1 text-xs text-white/80">
                    {elapsedMinutes} min
                  </div>

                  <div className="mt-1 text-sm font-semibold text-yellow-300">
                    {formatMoney(currentAmount)} so'm
                  </div>
                </>
              )}

              <div className="mt-4">
                {isActive ? (
                  <button
                    onClick={handleStop}
                    className="px-4 py-1.5 bg-white text-green-700 rounded-md text-sm font-medium hover:opacity-90 transition"
                  >
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="px-4 py-1.5 bg-black text-white rounded-md text-sm font-medium hover:opacity-90 transition"
                  >
                    Start
                  </button>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
