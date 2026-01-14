"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", active: 45, completed: 35 },
  { month: "Feb", active: 55, completed: 40 },
  { month: "Mar", active: 60, completed: 45 },
  { month: "Apr", active: 65, completed: 50 },
  { month: "May", active: 75, completed: 55 },
  { month: "Jun", active: 80, completed: 60 },
  { month: "Jul", active: 85, completed: 65 },
  { month: "Aug", active: 80, completed: 70 },
  { month: "Sep", active: 90, completed: 75 },
  { month: "Oct", active: 95, completed: 80 },
  { month: "Nov", active: 100, completed: 85 },
  { month: "Dec", active: 105, completed: 90 },
]

export default function GrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" />
        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
        <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}