import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function Progress() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const [studentId, setStudentId] = useState("");
  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Map demo student emails to their mock data
  const MOCK_STUDENTS = [
    {
      id: "demo-student-1",
      email: "student@demo.com",
      name: "Mallik",
      summary: {
        subjectAverages: [
          { subject: "Math", avg: 52 },
          { subject: "Science", avg: 61 },
          { subject: "English", avg: 48 },
        ],
        scores: [
          { subject: "Math", score: 45, maxScore: 100, date: "2024-01-10" },
          { subject: "Science", score: 55, maxScore: 100, date: "2024-02-10" },
          { subject: "English", score: 42, maxScore: 100, date: "2024-03-10" },
          { subject: "Math", score: 58, maxScore: 100, date: "2024-04-10" },
        ],
      },
      analysis: {
        riskLevel: "high",
        overallAvg: 54,
        weakSubjects: ["Math", "English"],
        suggestions: ["Mallik needs immediate attention in Math and English."],
      },
    },
    {
      id: "demo-student-2",
      email: "student2@demo.com",
      name: "Gowtham",
      summary: {
        subjectAverages: [
          { subject: "Math", avg: 66 },
          { subject: "Science", avg: 72 },
          { subject: "English", avg: 59 },
        ],
        scores: [
          { subject: "Math", score: 60, maxScore: 100, date: "2024-01-10" },
          { subject: "Science", score: 70, maxScore: 100, date: "2024-02-10" },
          { subject: "English", score: 55, maxScore: 100, date: "2024-03-10" },
          { subject: "Math", score: 68, maxScore: 100, date: "2024-04-10" },
        ],
      },
      analysis: {
        riskLevel: "medium",
        overallAvg: 66,
        weakSubjects: ["English"],
        suggestions: ["Gowtham should focus on reading comprehension."],
      },
    },
    {
      id: "demo-student-3",
      email: "student3@demo.com",
      name: "Aarav",
      summary: {
        subjectAverages: [
          { subject: "Math", avg: 82 },
          { subject: "Science", avg: 78 },
          { subject: "English", avg: 75 },
        ],
        scores: [
          { subject: "Math", score: 80, maxScore: 100, date: "2024-01-10" },
          { subject: "Science", score: 76, maxScore: 100, date: "2024-02-10" },
          { subject: "English", score: 72, maxScore: 100, date: "2024-03-10" },
          { subject: "Math", score: 84, maxScore: 100, date: "2024-04-10" },
        ],
      },
      analysis: {
        riskLevel: "low",
        overallAvg: 78,
        weakSubjects: [],
        suggestions: ["Aarav is performing well. Keep the momentum."],
      },
    },
  ];

  const loadSummary = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/progress/${id}/summary`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load progress.");
      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load progress.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (isStudent) {
      // Auto-load the logged-in student's own mock data
      const own = MOCK_STUDENTS.find((s) => s.email === user?.email) || MOCK_STUDENTS[0];
      applyMock(own);
    }
  }, []);

  const applyMock = (mock) => {
    setStudentId(mock.id);
    setSummary(mock.summary);
    setAnalysis(mock.analysis);
  };

  const stats = useMemo(() => {
    if (!summary?.subjectAverages) return [];
    return summary.subjectAverages.map((s) => ({ subject: s.subject, score: s.avg }));
  }, [summary]);

  const trend = useMemo(() => {
    if (!summary?.scores) return [];
    return summary.scores.map((s) => ({
      month: new Date(s.date).toLocaleDateString(undefined, { month: "short" }),
      score: Math.round((s.score / s.maxScore) * 100),
    }));
  }, [summary]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Progress")}</h1>
          <p className="text-sm text-gray-600">
            A clean, focused dashboard for academic growth.
          </p>
        </div>
        <div className="text-xs text-gray-600">
          {analysis?.riskLevel ? `Risk: ${analysis.riskLevel}` : "—"}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {!isStudent && (
          <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              Demo Students
            </h3>
            <div className="mt-4 space-y-2">
              {MOCK_STUDENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => applyMock(s)}
                  className="w-full rounded-2xl border border-mist px-3 py-2 text-left text-sm transition hover:border-ink"
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-gray-600">{s.id}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`rounded-2xl border border-mist bg-paper p-5 shadow-soft ${isStudent ? "lg:col-span-3" : "lg:col-span-2"}`}>
          {isStudent ? (
            <p className="text-sm text-gray-600">
              Showing your progress, <span className="font-medium">{user?.name}</span>.
            </p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[240px]">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                  Student ID
                </label>
                <input
                  className="mt-2 w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student id"
                />
              </div>
              <button
                onClick={() => loadSummary(studentId)}
                className="rounded-2xl border border-ink px-4 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
                disabled={loading || !studentId}
              >
                {loading ? "Loading..." : "Load Progress"}
              </button>
            </div>
          )}
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {[
          { label: "Subjects Tracked", value: stats.length || "—" },
          { label: "Total Tests", value: summary?.scores?.length || "—" },
          { label: "Overall Average", value: analysis?.overallAvg ? `${analysis.overallAvg}%` : "—" },
          { label: "At-Risk Subjects", value: analysis?.weakSubjects?.length || "—" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-gray-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Subject Performance
          </h3>
          <div className="mt-4 space-y-3">
            {stats.length === 0 && (
              <p className="text-sm text-gray-600">No subject scores yet.</p>
            )}
            {stats.map((item) => (
              <div key={item.subject} className="flex items-center justify-between">
                <span className="text-sm">{item.subject}</span>
                <span className="rounded-2xl border border-mist px-3 py-1 text-xs">
                  {item.score}%
                </span>
              </div>
            ))}
          </div>
          {analysis && (
            <div className="mt-6 rounded-2xl border border-mist bg-fog p-4 text-xs text-gray-700">
              <p className="font-semibold">AI Insight</p>
              <p className="mt-2">Risk: {analysis.riskLevel}</p>
              {analysis.suggestions?.length > 0 && (
                <p className="mt-2">{analysis.suggestions[0]}</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Progress Over Time
          </h3>
          <div className="mt-4 h-64 w-full">
            {trend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-600">
                No trend data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e6e6e6",
                      boxShadow: "0 8px 20px -12px rgba(0,0,0,0.35)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#0a0a0a"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: "#0a0a0a", strokeWidth: 2, fill: "#ffffff" }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
