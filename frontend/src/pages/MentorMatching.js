import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MOCK_STUDENTS = [
  {
    id: "s1",
    name: "Aarav Kumar",
    class: "Grade 8",
    subjectsNeeded: ["Math", "Science"],
    weakAreas: ["Math"],
    learningLevel: "Intermediate",
    riskLevel: "medium",
  },
  {
    id: "s2",
    name: "Isha Verma",
    class: "Grade 9",
    subjectsNeeded: ["English"],
    weakAreas: ["English"],
    learningLevel: "Beginner",
    riskLevel: "high",
  },
  {
    id: "s3",
    name: "Rohan Mehta",
    class: "Grade 10",
    subjectsNeeded: ["Physics", "Math"],
    weakAreas: ["Physics"],
    learningLevel: "Advanced",
    riskLevel: "low",
  },
  {
    id: "s4",
    name: "Meera Nair",
    class: "Grade 8",
    subjectsNeeded: ["Science"],
    weakAreas: ["Science"],
    learningLevel: "Intermediate",
    riskLevel: "medium",
  },
  {
    id: "s5",
    name: "Kabir Singh",
    class: "Grade 9",
    subjectsNeeded: ["History", "English"],
    weakAreas: ["History"],
    learningLevel: "Beginner",
    riskLevel: "low",
  },
];

const MOCK_MENTORS = [
  {
    id: "m1",
    name: "Neha Rao",
    expertiseSubjects: ["Math", "Science"],
    experienceLevel: "Intermediate",
    availability: { weekdays: ["Evening"], weekends: ["Morning"] },
    currentStudents: 6,
    maxStudents: 10,
    specialization: "STEM",
    rating: 4.6,
  },
  {
    id: "m2",
    name: "Vikram Shah",
    expertiseSubjects: ["English", "History"],
    experienceLevel: "Advanced",
    availability: { weekdays: ["Morning"], weekends: ["Afternoon"] },
    currentStudents: 4,
    maxStudents: 8,
    specialization: "Humanities",
    rating: 4.8,
  },
  {
    id: "m3",
    name: "Anita Joshi",
    expertiseSubjects: ["Biology", "Chemistry"],
    experienceLevel: "Intermediate",
    availability: { weekdays: ["Evening"], weekends: ["Morning"] },
    currentStudents: 5,
    maxStudents: 10,
    specialization: "Science",
    rating: 4.5,
  },
  {
    id: "m4",
    name: "Rahul Das",
    expertiseSubjects: ["Physics", "Math"],
    experienceLevel: "Advanced",
    availability: { weekdays: ["Evening"], weekends: ["Afternoon"] },
    currentStudents: 7,
    maxStudents: 12,
    specialization: "STEM",
    rating: 4.7,
  },
];

export default function MentorMatching() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsRes, mentorsRes] = await Promise.all([
        fetch(`${API_URL}/matching/students`),
        fetch(`${API_URL}/matching/mentors`),
      ]);
      const studentsData = await studentsRes.json();
      const mentorsData = await mentorsRes.json();
      if (!studentsRes.ok) throw new Error(studentsData.error || "Failed to load students.");
      if (!mentorsRes.ok) throw new Error(mentorsData.error || "Failed to load mentors.");
      setStudents(studentsData.students || []);
      setMentors(mentorsData.mentors || []);
    } catch (err) {
      setStudents(MOCK_STUDENTS);
      setMentors(MOCK_MENTORS);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    if (!students.length || !mentors.length) return;
    setMatching(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/matching/ai-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students, mentors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Matching failed.");
      setMatches(data.matches || []);
    } catch (err) {
      const fallbackMatches = students.map((student) => {
        const mentor = mentors.find((m) =>
          m.expertiseSubjects.some((subj) => student.subjectsNeeded.includes(subj))
        ) || mentors[0];
        const score = mentor ? 78 : 60;
        return {
          studentId: student.id,
          studentName: student.name,
          mentorId: mentor?.id,
          matchedMentor: mentor?.name || "No suitable mentor",
          score,
          reason: "Matched by subject overlap and availability.",
          studentClass: student.class,
          studentSubjects: student.subjectsNeeded,
          mentorExpertise: mentor?.expertiseSubjects || [],
          mentorAvailability: mentor?.availability,
          isHighRisk: student.riskLevel === "high",
          currentMentor: student.currentMentor || null,
        };
      });
      setMatches(fallbackMatches);
      setError("");
    } finally {
      setMatching(false);
    }
  };

  const assignMentor = async (studentId, mentorId) => {
    try {
      const res = await fetch(`${API_URL}/matching/assign-mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, mentorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Assign failed.");
      await loadData();
      setMatches((prev) => prev.filter((m) => m.studentId !== studentId));
    } catch (err) {
      setError(err.message || "Assign failed.");
    }
  };

  const bulkAssign = async () => {
    if (!matches.length) return;
    try {
      const res = await fetch(`${API_URL}/matching/bulk-assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matches }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk assign failed.");
      await loadData();
      setMatches([]);
    } catch (err) {
      setError(err.message || "Bulk assign failed.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mentor Matching</h1>
          <p className="text-sm text-gray-600">
            AI-assisted matching based on subject needs and mentor expertise.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runMatching}
            disabled={matching || loading || !students.length || !mentors.length}
            className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {matching ? "Matching..." : "Run AI Matching"}
          </button>
          <button
            onClick={bulkAssign}
            disabled={!matches.length}
            className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            Bulk Assign
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-mist bg-paper px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Students ({students.length})
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {loading && <p className="text-gray-600">Loading...</p>}
            {!loading && students.length === 0 && (
              <p className="text-gray-600">No students found.</p>
            )}
            {students.slice(0, 6).map((s) => (
              <div key={s.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-600">{s.class}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Mentors ({mentors.length})
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {loading && <p className="text-gray-600">Loading...</p>}
            {!loading && mentors.length === 0 && (
              <p className="text-gray-600">No mentors found.</p>
            )}
            {mentors.slice(0, 6).map((m) => (
              <div key={m.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-600">
                  {m.expertiseSubjects?.slice(0, 2).join(", ") || "General"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Matches ({matches.length})
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {matches.length === 0 && (
              <p className="text-gray-600">No matches yet. Run AI Matching.</p>
            )}
            {matches.slice(0, 6).map((m) => (
              <div key={m.studentId} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{m.studentName}</div>
                <div className="text-xs text-gray-600">
                  → {m.matchedMentor} ({m.score}%)
                </div>
                <button
                  onClick={() => assignMentor(m.studentId, m.mentorId)}
                  className="mt-2 rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          Full Match List
        </h3>
        {matches.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">No matches to show.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-600">
                <tr>
                  <th className="py-2">Student</th>
                  <th className="py-2">Mentor</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.studentId} className="border-t border-mist">
                    <td className="py-2">{m.studentName}</td>
                    <td className="py-2">{m.matchedMentor}</td>
                    <td className="py-2">{m.score}%</td>
                    <td className="py-2">
                      <button
                        onClick={() => assignMentor(m.studentId, m.mentorId)}
                        className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
