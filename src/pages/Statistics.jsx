import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function Statistics({ clubId }) {
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [salesCount, setSalesCount] = useState(0);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    const snapshot = await getDocs(
      collection(db, "clubs", clubId, "sales")
    );

    const data = snapshot.docs.map((doc) => doc.data());
    setSalesCount(data.length);

    const totalSum = data.reduce((acc, s) => acc + s.amount, 0);
    setTotal(totalSum);

    const today = new Date().toISOString().split("T")[0];
    const todaySum = data
      .filter((s) => s.date === today)
      .reduce((acc, s) => acc + s.amount, 0);

    setTodayTotal(todaySum);

    // 30 kun
    const last30 = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const formatted = d.toISOString().split("T")[0];

      last30.push({
        date: formatted.slice(5),
        full: formatted,
        amount: 0,
      });
    }

    data.forEach((sale) => {
      const index = last30.findIndex((d) => d.full === sale.date);
      if (index !== -1) {
        last30[index].amount += sale.amount;
      }
    });

    setChartData(last30);
  };

  const formatMoney = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="lg:pl-72 min-h-screen bg-[#0b1120] text-white p-10">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-semibold mb-12">
          Sales Statistics
        </h1>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Total Revenue" value={`${formatMoney(total)} so'm`} />
          <StatCard title="Today's Revenue" value={`${formatMoney(todayTotal)} so'm`} />
          <StatCard title="Sales Count" value={salesCount} />
        </div>

        {/* DARK CHART */}
        <div className="bg-[#111827] rounded-2xl p-8 shadow-2xl border border-white/5">

          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1f2937",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />

              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-[#111827] rounded-2xl p-6 border border-white/5 shadow-lg">
      <div className="text-gray-400 text-sm">
        {title}
      </div>
      <div className="text-2xl font-bold mt-3">
        {value}
      </div>
    </div>
  );
}
