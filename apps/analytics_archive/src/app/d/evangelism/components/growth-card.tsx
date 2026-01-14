"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface GrowthChartProps {
  data?: Array<{
    month: string;
    souls_saved: number;
    souls_filled: number;
    souls_healed: number;
  }>;
}

const defaultData = [
  { month: "Jan", souls_saved: 65, souls_filled: 55, souls_healed: 45 },
  { month: "Feb", souls_saved: 75, souls_filled: 60, souls_healed: 50 },
  { month: "Mar", souls_saved: 80, souls_filled: 65, souls_healed: 55 },
  { month: "Apr", souls_saved: 85, souls_filled: 70, souls_healed: 60 },
  { month: "May", souls_saved: 95, souls_filled: 75, souls_healed: 65 },
  { month: "Jun", souls_saved: 100, souls_filled: 80, souls_healed: 70 },
  { month: "Jul", souls_saved: 110, souls_filled: 85, souls_healed: 75 },
  { month: "Aug", souls_saved: 105, souls_filled: 90, souls_healed: 80 },
  { month: "Sep", souls_saved: 115, souls_filled: 95, souls_healed: 85 },
  { month: "Oct", souls_saved: 125, souls_filled: 100, souls_healed: 90 },
  { month: "Nov", souls_saved: 135, souls_filled: 105, souls_healed: 95 },
  { month: "Dec", souls_saved: 145, souls_filled: 110, souls_healed: 100 },
]

export default function GrowthChart({ data }: GrowthChartProps) {
  const chartData = data && data.length > 0 ? data : defaultData;
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Line type="monotone" dataKey="souls_saved" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="souls_filled" stroke="#d97706" strokeWidth={3} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="souls_healed" stroke="#22c55e" strokeWidth={3} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
