import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ChartProps {
  data: { date: string; value: number }[];
  title: string;
  yLabel: string;
}

export default function Chart({ data, title, yLabel }: ChartProps) {
  return (
    <div className="bg-white p-4 shadow rounded-lg w-full h-64">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
