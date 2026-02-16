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
  const clubId = "club_1"; // vaqtincha hardcode

  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "clubs", clubId, "sessions"),
          where("status", "==", "closed")
        )
      );

      console.log("Docs found:", snapshot.size);

      const sessions = snapshot.docs.map(doc => doc.data());

      const now = new Date();
      const last30 = [];

      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const fullDate = d.toISOString().split("T")[0];

        last30.push({
          date: fullDate.slice(5),
          full: fullDate,
          amount: 0,
        });
      }

      sessions.forEach((s) => {
        const index = last30.findIndex(
          (d) => d.full === s.workDate
        );

        if (index !== -1) {
          last30[index].amount += Number(s.amountPaid) || 0;
        }
      });

      setChartData(last30);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-10">
      <h1 className="text-2xl font-semibold mb-8">
        Last 30 Days Revenue
      </h1>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#60a5fa"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
