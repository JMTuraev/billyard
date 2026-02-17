import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Statistics() {
  const { userData } = useAuth();
  const clubId = userData?.clubId;

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!clubId) return;
    fetchRevenue();
  }, [clubId]);

  const fetchRevenue = async () => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "clubs", clubId, "sessions"),
          where("status", "==", "closed")
        )
      );

      const sessions = snapshot.docs.map((doc) => doc.data());

      const now = new Date();
      const last30 = [];

      // 🔹 30 kunlik array yaratish
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);

        const fullDate = d.toISOString().split("T")[0];

        last30.push({
          date: fullDate.slice(5), // MM-DD
          full: fullDate,
          amount: 0,
        });
      }

      // 🔹 sessionlardan amount yig‘ish
      sessions.forEach((s) => {
        if (!s.closedAt) return;

        const closed = s.closedAt.toDate();
        const fullDate = closed.toISOString().split("T")[0];

        const index = last30.findIndex(
          (d) => d.full === fullDate
        );

        if (index !== -1) {
          last30[index].amount += Number(s.amountPaid) || 0;
        }
      });

      setChartData(last30);

    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-10">
      <h1 className="text-2xl font-semibold mb-8">
        Last 30 Days Revenue
      </h1>

      <div className="w-full h-[350px] bg-[#111827] p-6 rounded-xl border border-white/10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid
              vertical={false}
              stroke="#1e293b"
            />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
