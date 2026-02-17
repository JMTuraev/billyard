import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";

export default function Sessions() {
  const { userData } = useAuth();
  const clubId = userData?.clubId;

  const [sessions, setSessions] = useState([]);
  const [openDays, setOpenDays] = useState({});

  useEffect(() => {
    if (!clubId) return;

    const fetchSessions = async () => {
      const snapshot = await getDocs(
        collection(db, "clubs", clubId, "sessions")
      );

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      data.sort(
        (a, b) => b.openedAt?.seconds - a.openedAt?.seconds
      );

      setSessions(data);
    };

    fetchSessions();
  }, [clubId]);

  const formatMoney = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const formatTime = (ts) => {
    if (!ts) return "-";
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateKey = (ts) => {
    const date = new Date(ts.seconds * 1000);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDurationMinutes = (open, close) => {
    if (!open || !close) return 0;
    return Math.floor(
      (close.seconds * 1000 - open.seconds * 1000) / 60000
    );
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours && mins) return `${hours} soat ${mins} min`;
    if (hours) return `${hours} soat`;
    return `${mins} min`;
  };

  const grouped = sessions.reduce((acc, s) => {
    const key = formatDateKey(s.openedAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const toggleDay = (date) => {
    setOpenDays((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-semibold mb-8">
        Daily Sessions Report
      </h1>

      {Object.entries(grouped).map(([date, daySessions]) => {
        const totalMinutes = daySessions.reduce(
          (sum, s) =>
            sum + getDurationMinutes(s.openedAt, s.closedAt),
          0
        );

        const totalAmount = daySessions.reduce(
          (sum, s) => sum + (s.amountPaid || 0),
          0
        );

        const isOpen = openDays[date];

        return (
          <div key={date} className="mb-6">
            <div
              onClick={() => toggleDay(date)}
              className="flex items-center justify-between bg-[#111827] border border-white/10 rounded-xl px-6 py-4 cursor-pointer hover:bg-[#1f2937] transition"
            >
              <div className="flex items-center gap-4">
                {isOpen ? (
                  <ChevronDownIcon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-indigo-400" />
                )}

                <span className="text-lg font-semibold text-indigo-400">
                  {date}
                </span>
              </div>

              <div className="flex gap-6 text-sm">
                <div className="text-gray-400">
                  Jami vaqt:
                  <span className="ml-2 text-white font-medium">
                    {formatDuration(totalMinutes)}
                  </span>
                </div>

                <div className="text-gray-400">
                  Jami summa:
                  <span className="ml-2 text-yellow-300 font-semibold">
                    {formatMoney(totalAmount)} so'm
                  </span>
                </div>
              </div>
            </div>

            {isOpen && (
              <div className="mt-3 bg-[#0b1220] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="text-gray-400 border-b border-white/5">
                    <tr>
                      <th className="p-4 text-left">Table</th>
                      <th className="p-4 text-left">Time</th>
                      <th className="p-4 text-left">Duration</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Amount</th>
                      <th className="p-4 text-left">Comment</th>
                    </tr>
                  </thead>

                  <tbody>
                    {daySessions.map((s) => {
                      const minutes = getDurationMinutes(
                        s.openedAt,
                        s.closedAt
                      );

                      return (
                        <tr
                          key={s.id}
                          className="border-t border-white/5 hover:bg-[#1f2937]"
                        >
                          <td className="p-4">#{s.tableNumber}</td>
                          <td className="p-4">
                            {formatTime(s.openedAt)} —{" "}
                            {formatTime(s.closedAt)}
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                              {formatDuration(minutes)}
                            </span>
                          </td>
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
                          <td className="p-4 text-yellow-300 font-semibold">
                            {formatMoney(s.amountPaid)} so'm
                          </td>
                          <td className="p-4">
                            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
