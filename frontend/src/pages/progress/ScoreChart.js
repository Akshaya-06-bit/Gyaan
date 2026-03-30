import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#0284c7", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ScoreChart({ scores }) {
  // Get unique subjects
  const subjects = [...new Set(scores.map((s) => s.subject))];

  // Group by date — each date becomes one data point with subject scores
  const dateMap = {};
  scores.forEach(({ date, subject, score, maxScore }) => {
    const label = new Date(date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    if (!dateMap[label]) dateMap[label] = { date: label };
    dateMap[label][subject] = Math.round((score / maxScore) * 100);
  });

  const data = Object.values(dateMap);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0f7fd" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} unit="%" />
        <Tooltip formatter={(val) => `${val}%`} />
        <Legend />
        {subjects.map((subject, i) => (
          <Line
            key={subject}
            type="monotone"
            dataKey={subject}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2.5}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
