"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AttendanceChart({ data }: { data: { hour: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Aucun scan enregistré pour le moment.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="hour" fontSize={12} />
        <YAxis allowDecimals={false} fontSize={12} />
        <Tooltip />
        <Bar dataKey="count" name="Entrées" fill="#0B4A32" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
