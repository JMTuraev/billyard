import {
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function TableCard({ table, clubId }) {
  if (!table) return null;

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

  const handleStart = async () => {
    await updateDoc(tableRef, {
      status: "active",
      startedAt: serverTimestamp(),
      activePrice: table.pricePerHour,
    });
  };

const handleStop = async () => {
  if (!table.startedAt?.seconds) return;

  const start = table.startedAt.seconds * 1000;
  const now = Date.now();
  const minutes = Math.floor((now - start) / 60000);
  const amount = Math.floor((minutes / 60) * table.activePrice);

  const today = new Date().toISOString().split("T")[0];

  await addDoc(collection(db, "clubs", clubId, "sales"), {
    tableNumber: table.number,
    startedAt: table.startedAt,
    endedAt: serverTimestamp(),
    minutes,
    amount,
    date: today,
  });

  await updateDoc(tableRef, {
    status: "idle",
    startedAt: null,
    activePrice: null,
  });

  setElapsedMinutes(0);
};

  const handleDelete = async () => {
    if (isActive) return alert("Active table cannot be deleted");
    if (!window.confirm(`Delete table #${table.number}?`)) return;
    await deleteDoc(tableRef);
  };

  return (
    <div className="w-full h-[210px]">
      {/* Wooden frame */}
      <div className="relative h-full w-full rounded-2xl p-2 bg-gradient-to-br from-amber-900 via-amber-700 to-amber-900 shadow-lg">

        {/* Felt */}
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
          {/* 🎱 Pockets */}
          <div className="absolute w-6 h-6 bg-black rounded-full -top-3 -left-3" />
          <div className="absolute w-6 h-6 bg-black rounded-full -top-3 -right-3" />
          <div className="absolute w-6 h-6 bg-black rounded-full -bottom-3 -left-3" />
          <div className="absolute w-6 h-6 bg-black rounded-full -bottom-3 -right-3" />
          <div className="absolute w-6 h-6 bg-black rounded-full -top-3 left-1/2 -translate-x-1/2" />
          <div className="absolute w-6 h-6 bg-black rounded-full -bottom-3 left-1/2 -translate-x-1/2" />

          {/* Top Icons */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <PencilIcon className="w-4 h-4 text-white/70 hover:text-white cursor-pointer transition" />
            <TrashIcon
              onClick={handleDelete}
              className="w-4 h-4 text-white/70 hover:text-red-400 cursor-pointer transition"
            />
          </div>

          {/* 2 SECTION LAYOUT */}
          <div className="flex h-full text-white px-6">

            {/* LEFT SIDE — TABLE NUMBER */}
            <div className="w-1/3 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                {table.number}
              </div>
            </div>

            {/* RIGHT SIDE — INFO */}
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
