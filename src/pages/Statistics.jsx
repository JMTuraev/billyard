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

export default function Statistics() {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    generateMockData();
  }, []);

  const generateMockData = () => {
    const last30 = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);

      const fullDate = d.toISOString().split("T")[0];

      const randomAmount =
        Math.random() > 0.2
          ? Math.floor(Math.random() * 5000000)
          : 0;

      last30.push({
        date: fullDate.slice(5),
        amount: randomAmount,
      });
    }

    setChartData(last30);
  };

  const formatMoney = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-10 pt-10">

      <h1 className="text-2xl font-semibold mb-8">
        Last 30 Days Revenue
      </h1>

      <div className="w-full h-[260px]">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>

            {/* faqat horizontal line */}
            <CartesianGrid
              vertical={false}
              stroke="#1e293b"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={4}   // har 5 kunda bir
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                value >= 1000000
                  ? `${value / 1000000}M`
                  : value >= 1000
                  ? `${value / 1000}K`
                  : value
              }
            />

            <Tooltip
              cursor={false}
              formatter={(value) =>
                `${formatMoney(value)} so'm`
              }
              contentStyle={{
                backgroundColor: "#111827",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{
                r: 4,
                stroke: "#60a5fa",
                strokeWidth: 2,
                fill: "#0f172a",
              }}
              activeDot={{
                r: 6,
                fill: "#60a5fa",
              }}
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}
