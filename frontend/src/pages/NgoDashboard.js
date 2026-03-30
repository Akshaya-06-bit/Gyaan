import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../context/I18nContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MOCK = {
  overview: {
    totalStudents: 128,
    totalMentors: 16,
    activeSessions: 24,
    studentsAtRisk: 18,
  },
  students: [
    { id: "s1", name: "Aarav Kumar", class: "Grade 8", assignedMentor: "Neha Rao", progressStatus: "Average", riskLevel: "medium", weakSubjects: ["Math"] },
    { id: "s2", name: "Isha Verma", class: "Grade 9", assignedMentor: "Vikram Shah", progressStatus: "At Risk", riskLevel: "high", weakSubjects: ["English"] },
    { id: "s3", name: "Rohan Mehta", class: "Grade 10", assignedMentor: "Anita Joshi", progressStatus: "Good", riskLevel: "low", weakSubjects: [] },
    { id: "s4", name: "Meera Nair", class: "Grade 8", assignedMentor: "Rahul Das", progressStatus: "Average", riskLevel: "medium", weakSubjects: ["Science"] },
    { id: "s5", name: "Kabir Singh", class: "Grade 9", assignedMentor: "Neha Rao", progressStatus: "Good", riskLevel: "low", weakSubjects: [] },
  ],
  mentors: [
    { id: "m1", name: "Neha Rao", expertise: ["Math", "Science"], assignedStudents: 10, availability: "Available", workload: "High" },
    { id: "m2", name: "Vikram Shah", expertise: ["English", "History"], assignedStudents: 8, availability: "Available", workload: "Medium" },
    { id: "m3", name: "Anita Joshi", expertise: ["Biology", "Chemistry"], assignedStudents: 6, availability: "Available", workload: "Medium" },
    { id: "m4", name: "Rahul Das", expertise: ["Physics", "Math"], assignedStudents: 4, availability: "Available", workload: "Low" },
  ],
  progress: {
    subjectScores: {
      Math: { weak: 6, strong: 12, average: 62 },
      Science: { weak: 4, strong: 14, average: 70 },
      English: { weak: 5, strong: 10, average: 58 },
      History: { weak: 3, strong: 9, average: 64 },
    },
    trends: [
      { month: "Jan", averageScore: 58 },
      { month: "Feb", averageScore: 61 },
      { month: "Mar", averageScore: 64 },
      { month: "Apr", averageScore: 66 },
      { month: "May", averageScore: 69 },
      { month: "Jun", averageScore: 72 },
    ],
    weakestSubjects: ["English", "Math", "History"],
  },
  insights: [
    "30% of students are struggling in Math; prioritize remedial sessions.",
    "Grade 8 has the highest risk concentration this term.",
    "Mentor workload is uneven; redistribute assignments.",
    "Progress trend is improving month-over-month.",
  ],
  alerts: {
    summary: "10 students at high risk",
    alerts: ["Ravi needs immediate attention", "3 sessions missed this week"],
  },
};

export default function NgoDashboard() {
  const { t } = useI18n();
  const [overview, setOverview] = useState(null);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [progress, setProgress] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsPrompt, setInsightsPrompt] = useState("");
  const [alerts, setAlerts] = useState(null);
  const [filters, setFilters] = useState({ class: "", subject: "", riskLevel: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [calling, setCalling] = useState(false);
  const [callResult, setCallResult] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      if (demoMode) throw new Error("Demo mode");
      const [o, s, m, p, i, a] = await Promise.all([
        fetch(`${API_URL}/ngo/analytics`),
        fetch(`${API_URL}/ngo/students`),
        fetch(`${API_URL}/ngo/mentors`),
        fetch(`${API_URL}/ngo/progress`),
        fetch(`${API_URL}/ngo/ai-insights`, { method: "POST" }),
        fetch(`${API_URL}/ngo/alerts`),
      ]);
      const oData = await o.json();
      const sData = await s.json();
      const mData = await m.json();
      const pData = await p.json();
      const iData = await i.json();
      const aData = await a.json();
      if (!o.ok || !s.ok || !m.ok || !p.ok || !i.ok || !a.ok) throw new Error("API unavailable");
      setOverview(oData);
      setStudents(sData.students || []);
      setMentors(mData.mentors || []);
      setProgress(pData);
      setInsights(iData.insights || []);
      setInsightsPrompt(iData.prompt || "");
      setAlerts(aData);
    } catch {
      setOverview(MOCK.overview);
      setStudents(MOCK.students);
      setMentors(MOCK.mentors);
      setProgress(MOCK.progress);
      setInsights(MOCK.insights);
      setInsightsPrompt("Demo prompt: Generate NGO insights from overview, progress, and mentor load.");
      setAlerts(MOCK.alerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [demoMode]);

  const exportReport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/ngo/report?format=csv`);
      if (!res.ok) throw new Error("Failed to export report.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ngo-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      try {
        const lines = [];
        lines.push("Section,Metric,Value");
        lines.push(`Overview,Total Students,${overview?.totalStudents ?? 0}`);
        lines.push(`Overview,Total Mentors,${overview?.totalMentors ?? 0}`);
        lines.push(`Overview,Active Sessions,${overview?.activeSessions ?? 0}`);
        lines.push(`Overview,Students At Risk,${overview?.studentsAtRisk ?? 0}`);
        lines.push(`Progress,Weakest Subjects,${(progress?.weakestSubjects || []).join(" | ")}`);
        const csv = lines.join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ngo-report-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        setError(err.message || "Failed to export report.");
      }
    } finally {
      setExporting(false);
    }
  };

  const callAtRisk = async () => {
    setCalling(true);
    setCallResult("");
    try {
      const res = await fetch(`${API_URL}/ngo/call-at-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            "Hello. This is an automated call from the Learning Support Platform. Please contact your mentor for immediate assistance.",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Call failed.");
      setCallResult(`Calls placed: ${data.total || 0}`);
    } catch (err) {
      setCallResult(err.message || "Call failed.");
    } finally {
      setCalling(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setFilters({ class: "", subject: "", riskLevel: "", search: "" });
  };

  const filteredStudents = useMemo(() => {
    let list = students;
    if (filters.class) list = list.filter((s) => s.class === filters.class);
    if (filters.riskLevel) list = list.filter((s) => s.riskLevel === filters.riskLevel);
    if (filters.subject) {
      list = list.filter((s) => s.weakSubjects?.includes(filters.subject));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter((s) => s.name?.toLowerCase().includes(q));
    }
    return list;
  }, [students, filters]);

  const subjectBars = useMemo(() => {
    if (!progress?.subjectScores) return [];
    return Object.entries(progress.subjectScores).map(([subject, data]) => ({
      subject,
      average: Math.round(data.average || 0),
    }));
  }, [progress]);

  const trend = useMemo(() => {
    if (!progress?.trends) return [];
    return progress.trends.map((t) => ({ month: t.month, score: t.averageScore }));
  }, [progress]);

  const impactDelta = useMemo(() => {
    if (!progress?.trends || progress.trends.length < 2) return null;
    const first = progress.trends[0].averageScore;
    const last = progress.trends[progress.trends.length - 1].averageScore;
    const delta = last - first;
    return { first, last, delta };
  }, [progress]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("NGO/Admin Dashboard")}</h1>
          <p className="text-sm text-gray-600">{t("Professional, data-driven overview of impact.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDemoMode((v) => !v)}
            className={[
              "rounded-2xl border px-4 py-2 text-sm font-medium transition",
              demoMode
                ? "border-ink bg-ink text-paper"
                : "border-ink text-ink hover:bg-ink hover:text-paper",
            ].join(" ")}
          >
            Demo Mode: {demoMode ? "On" : "Off"}
          </button>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : t("Refresh")}
          </button>
          <button
            onClick={exportReport}
            disabled={exporting}
            className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {exporting ? "Exporting..." : t("Download Report")}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-mist bg-paper px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Students", value: overview?.totalStudents },
          { label: "Total Mentors", value: overview?.totalMentors },
          { label: "Active Sessions", value: overview?.activeSessions },
          { label: "Students At Risk", value: overview?.studentsAtRisk, highlight: true },
        ].map((card) => (
          <div
            key={card.label}
            className={[
              "rounded-2xl border bg-paper p-5 shadow-soft",
              card.highlight ? "border-ink" : "border-mist",
            ].join(" ")}
          >
            <p className="text-xs uppercase tracking-wide text-gray-600">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">
              {loading ? "--" : card.value ?? "--"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Performance Analytics")}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectBars}>
                  <XAxis dataKey="subject" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e6e6e6",
                    }}
                  />
                  <Bar dataKey="average" fill="#0a0a0a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="month" stroke="#888888" tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e6e6e6",
                    }}
                  />
                  <Line dataKey="score" stroke="#0a0a0a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Weakest subjects: {(progress?.weakestSubjects || []).join(", ") || "--"}
          </p>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("AI Insights")}
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {insights.length === 0 && <p className="text-gray-600">No insights yet.</p>}
            {insights.map((insight, i) => (
              <div key={i} className="rounded-2xl border border-mist px-3 py-2">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Before vs After Impact")}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-mist px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-600">Before</p>
              <p className="mt-2 text-xl font-semibold">
                {impactDelta ? `${impactDelta.first}%` : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-mist px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-600">After</p>
              <p className="mt-2 text-xl font-semibold">
                {impactDelta ? `${impactDelta.last}%` : "--"}
              </p>
            </div>
            <div className="rounded-2xl border border-mist px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-600">Change</p>
              <p className="mt-2 text-xl font-semibold">
                {impactDelta ? `${impactDelta.delta >= 0 ? "+" : ""}${impactDelta.delta}%` : "--"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Shows improvement in average scores from the first to the latest recorded month.
          </p>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("AI Prompt + Output")}
          </h3>
          <div className="mt-3 space-y-3 text-xs text-gray-600">
            <div>
              <p className="mb-1 font-semibold text-gray-700">Prompt</p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-mist bg-paper px-3 py-2 text-[11px] text-gray-700">
                {insightsPrompt || "No prompt returned."}
              </pre>
            </div>
            <div>
              <p className="mb-1 font-semibold text-gray-700">JSON Output</p>
              <pre className="whitespace-pre-wrap rounded-2xl border border-mist bg-paper px-3 py-2 text-[11px] text-gray-700">
                {JSON.stringify(
                  {
                    overview,
                    weakestSubjects: progress?.weakestSubjects || [],
                    alerts: alerts?.alerts || [],
                    insights,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
              {t("Student Monitoring")}
            </h3>
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-2xl border border-mist px-3 py-2 text-xs outline-none transition focus:border-ink"
                placeholder="Search student"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
              <button
                onClick={clearFilters}
                className="rounded-2xl border border-ink px-3 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper"
              >
                Clear
              </button>
              <select
                className="rounded-2xl border border-mist px-3 py-2 text-xs outline-none transition focus:border-ink"
                value={filters.class}
                onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}
              >
                <option value="">All Classes</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
              </select>
              <input
                className="rounded-2xl border border-mist px-3 py-2 text-xs outline-none transition focus:border-ink"
                placeholder="Subject"
                value={filters.subject}
                onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
              />
              <select
                className="rounded-2xl border border-mist px-3 py-2 text-xs outline-none transition focus:border-ink"
                value={filters.riskLevel}
                onChange={(e) => setFilters((f) => ({ ...f, riskLevel: e.target.value }))}
              >
                <option value="">All Risks</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-600">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Mentor</th>
                  <th className="py-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 && (
                  <tr>
                    <td className="py-3 text-gray-600" colSpan={4}>
                      No students found.
                    </td>
                  </tr>
                )}
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-t border-mist">
                    <td className="py-2">{s.name}</td>
                    <td className="py-2">{s.class}</td>
                    <td className="py-2">{s.assignedMentor || "--"}</td>
                    <td className="py-2">{s.progressStatus || "--"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Risk Alerts")}
          </h3>
          <div className="mt-4 text-sm">
            <div className="rounded-2xl border border-ink px-3 py-2">
              {alerts?.summary || "No alerts"}
            </div>
            <div className="mt-3">
              <button
                onClick={callAtRisk}
                disabled={calling}
                className="rounded-2xl border border-ink px-3 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
              >
                {calling ? "Calling..." : t("Call At-Risk Students")}
              </button>
              {callResult && <div className="mt-2 text-xs text-gray-600">{callResult}</div>}
            </div>
            <div className="mt-3 space-y-2">
              {(alerts?.alerts || []).map((a, i) => (
                <div key={i} className="rounded-2xl border border-mist px-3 py-2">
                  {a}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {t("Mentor Management")}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {mentors.map((m) => (
            <div key={m.id} className="rounded-2xl border border-mist px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{m.name}</div>
                <span className="text-xs text-gray-600">{m.workload} workload</span>
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Expertise: {(m.expertise || []).join(", ")}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Assigned Students: {m.assignedStudents} - Availability: {m.availability}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
