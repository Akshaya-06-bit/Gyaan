import { useEffect, useState } from "react";
import { useI18n } from "../context/I18nContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MOCK_STUDENTS = [
  { id: "demo-student-1", name: "Mallik", class: "Grade 9", riskLevel: "high", weakSubjects: ["Math", "English"], overallAvg: 54, lastActive: "2024-04-10" },
  { id: "demo-student-2", name: "Gowtham", class: "Grade 8", riskLevel: "medium", weakSubjects: ["English"], overallAvg: 66, lastActive: "2024-04-08" },
  { id: "demo-student-3", name: "Aarav", class: "Grade 8", riskLevel: "low", weakSubjects: [], overallAvg: 78, lastActive: "2024-04-05" },
  { id: "demo-student-4", name: "Isha", class: "Grade 9", riskLevel: "medium", weakSubjects: ["Science"], overallAvg: 62, lastActive: "2024-04-03" },
];

export default function MentorStudents() {
  const { t } = useI18n();
  const [mentorId, setMentorId] = useState("demo-mentor-1");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/mentor/students?mentorId=${mentorId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load students.");
      setStudents(data.students || []);
    } catch {
      setStudents(MOCK_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Mentor Students")}</h1>
          <p className="text-sm text-gray-600">Detailed view of assigned students.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[240px]">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Mentor ID
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
              placeholder="Enter mentor id"
            />
          </div>
          <button
            onClick={loadStudents}
            className="rounded-2xl border border-ink px-4 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
            disabled={loading || !mentorId}
          >
            {loading ? "Loading..." : "Load Students"}
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-600">
              <tr>
                <th className="py-2">Name</th>
                <th className="py-2">Class</th>
                <th className="py-2">Risk</th>
                <th className="py-2">Weak Subjects</th>
                <th className="py-2">Overall Avg</th>
                <th className="py-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td className="py-3 text-gray-600" colSpan={6}>
                    No students found.
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className="border-t border-mist">
                  <td className="py-2">{s.name}</td>
                  <td className="py-2">{s.class}</td>
                  <td className="py-2">{s.riskLevel}</td>
                  <td className="py-2">{(s.weakSubjects || []).join(", ") || "—"}</td>
                  <td className="py-2">{s.overallAvg ? `${s.overallAvg}%` : "—"}</td>
                  <td className="py-2">{s.lastActive ? new Date(s.lastActive).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
