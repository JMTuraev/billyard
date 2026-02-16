import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const clubId = "club_1"; // Hozircha statik qilamiz

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "clubs", clubId, "sessions")
        );

        console.log("Session count:", snapshot.size);

        const data = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          order: index + 1,
          ...doc.data(),
        }));

        // eng oxirgi ochilgan session tepada
        data.sort((a, b) =>
          b.openedAt.seconds - a.openedAt.seconds
        );

        setSessions(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchSessions();
  }, []);

  const formatMoney = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const formatDate = (ts) => {
    if (!ts) return "-";
    return new Date(ts.seconds * 1000).toLocaleString();
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-semibold mb-8">
        Daily Sessions Report
      </h1>

      <div className="bg-[#111827] rounded-xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">

          <thead className="bg-[#0b1220] text-gray-400">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Table</th>
              <th className="p-4 text-left">Opened</th>
              <th className="p-4 text-left">Closed</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Work Date</th>
            </tr>
          </thead>

          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-400">
                  No sessions yet
                </td>
              </tr>
            )}

            {sessions.map((s) => (
              <tr
                key={s.id}
                className="border-t border-white/5 hover:bg-[#1f2937]"
              >
                <td className="p-4">{s.order}</td>
                <td className="p-4">#{s.tableNumber}</td>
                <td className="p-4">{formatDate(s.openedAt)}</td>
                <td className="p-4">{formatDate(s.closedAt)}</td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      s.status === "closed"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>

                <td className="p-4 font-semibold text-yellow-300">
                  {formatMoney(s.amountPaid)} so'm
                </td>

                <td className="p-4">{s.workDate}</td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}
