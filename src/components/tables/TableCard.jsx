import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useEffect, useState } from "react";

export default function TableCard({
  table,
  clubId,
  startSession,
  stopSession,
  getLiveMinutes,
}) {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!table.currentSessionId) return;

    const unsub = onSnapshot(
      doc(db, "clubs", clubId, "sessions", table.currentSessionId),
      (snap) => {
        if (snap.exists()) {
          setSession(snap.data());
        }
      }
    );

    return () => unsub();
  }, [table.currentSessionId, clubId]);

  const minutes =
    session?.openedAt ? getLiveMinutes(session.openedAt) : 0;

  const liveAmount =
    Math.ceil(minutes / 60) * table.pricePerHour;

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-white/10">
      <div className="text-lg font-semibold mb-2">
        Table #{table.number}
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Price: {table.pricePerHour} so'm
      </div>

      {table.status === "busy" && session && (
        <>
          <div className="text-yellow-400 mb-2">
            ⏱ {minutes} min
          </div>
          <div className="text-green-400 mb-4">
            💰 {liveAmount} so'm
          </div>
        </>
      )}

      {table.status === "free" ? (
        <button
          onClick={() => startSession(table)}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Start
        </button>
      ) : (
        <button
          onClick={() => stopSession(table)}
          className="px-4 py-2 bg-red-600 rounded"
        >
          Stop
        </button>
      )}
    </div>
  );
}
