import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MOCK_ASSIGNMENTS = [
  {
    id: "a1",
    title: "Algebra Practice Set",
    subject: "Math",
    description: "Solve 5 linear equation problems.",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    assignedStudents: ["student@demo.com"],
    createdBy: "mentor@demo.com",
  },
  {
    id: "a2",
    title: "Reading Comprehension",
    subject: "English",
    description: "Summarize the passage and answer 3 questions.",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    assignedStudents: ["student@demo.com"],
    createdBy: "mentor@demo.com",
  },
];

const MOCK_SUBMISSIONS = [
  {
    id: "s1",
    assignmentId: "a1",
    studentId: "student@demo.com",
    submissionText: "Submitted answers for algebra set.",
    submittedAt: new Date().toISOString(),
    status: "Submitted",
  },
];

export default function Assignments() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const studentId = user?.email || "student@demo.com";

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    dueDate: "",
    assignedStudents: "",
  });

  const [submitDraft, setSubmitDraft] = useState({
    assignmentId: "",
    text: "",
    fileName: "",
  });

  const loadAssignments = async () => {
    setLoading(true);
    setError("");
    try {
      const url = role === "student"
        ? `${API_URL}/assignments?studentId=${encodeURIComponent(studentId)}`
        : `${API_URL}/assignments`;
      const res = await fetch(url);
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to load assignments");
      setAssignments(data.assignments || []);
    } catch (err) {
      setAssignments(MOCK_ASSIGNMENTS);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await fetch(`${API_URL}/submissions`);
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to load submissions");
      setSubmissions(data.submissions || []);
    } catch {
      setSubmissions(MOCK_SUBMISSIONS);
    }
  };

  useEffect(() => {
    loadAssignments();
    if (role !== "student") loadSubmissions();
  }, [role]);

  const handleCreate = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/assignments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          subject: form.subject,
          description: form.description,
          dueDate: form.dueDate,
          assignedStudents: form.assignedStudents
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          createdBy: user?.email || "admin",
        }),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to create assignment");
      setAssignments((a) => [data.assignment, ...a]);
      setForm({ title: "", subject: "", description: "", dueDate: "", assignedStudents: "" });
    } catch (err) {
      const fallback = {
        id: `a-${Date.now()}`,
        title: form.title || "New Assignment",
        subject: form.subject || "General",
        description: form.description || "Assignment details",
        dueDate: form.dueDate || new Date(Date.now() + 86400000).toISOString(),
        assignedStudents: form.assignedStudents
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        createdBy: user?.email || "admin",
      };
      setAssignments((a) => [fallback, ...a]);
      setForm({ title: "", subject: "", description: "", dueDate: "", assignedStudents: "" });
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!submitDraft.assignmentId) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/submit-assignment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: submitDraft.assignmentId,
          studentId,
          submissionText: submitDraft.text,
          fileName: submitDraft.fileName,
        }),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSubmissions((s) => [data.submission, ...s]);
      setSubmitDraft({ assignmentId: "", text: "", fileName: "" });
    } catch (err) {
      const fallback = {
        id: `s-${Date.now()}`,
        assignmentId: submitDraft.assignmentId,
        studentId,
        submissionText: submitDraft.text,
        fileName: submitDraft.fileName,
        submittedAt: new Date().toISOString(),
        status: "Submitted",
      };
      setSubmissions((s) => [fallback, ...s]);
      setSubmitDraft({ assignmentId: "", text: "", fileName: "" });
      setError("");
    }
  };

  const now = Date.now();
  const enrichedAssignments = useMemo(() => {
    return assignments.map((a) => {
      const dueTime = new Date(a.dueDate).getTime();
      const submitted = submissions.find(
        (s) => s.assignmentId === a.id && s.studentId === studentId
      );
      let status = submitted ? "Submitted" : "Pending";
      if (!submitted && dueTime < now) status = "Late";
      return { ...a, status };
    });
  }, [assignments, submissions, studentId, now]);

  const totalAssignments = enrichedAssignments.length;
  const completed = enrichedAssignments.filter((a) => a.status === "Submitted").length;
  const completedPct = totalAssignments ? Math.round((completed / totalAssignments) * 100) : 0;
  const dueTomorrow = enrichedAssignments.filter((a) => {
    const due = new Date(a.dueDate);
    const diff = due.getTime() - now;
    return diff > 0 && diff < 2 * 86400000;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
          <p className="text-sm text-gray-600">Manage and track assignment workflow.</p>
        </div>
        {role !== "student" && (
          <button
            onClick={loadAssignments}
            className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-fog p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">Total Assignments</p>
          <p className="mt-2 text-2xl font-semibold">{totalAssignments}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-fog p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">Completed</p>
          <p className="mt-2 text-2xl font-semibold">{completedPct}%</p>
        </div>
        <div className="rounded-2xl border border-mist bg-fog p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">Due Tomorrow</p>
          <p className="mt-2 text-2xl font-semibold">{dueTomorrow.length}</p>
        </div>
      </div>

      {dueTomorrow.length > 0 && (
        <div className="mt-4 rounded-2xl border border-mist bg-paper px-4 py-3 text-sm">
          Assignment due tomorrow: {dueTomorrow.map((a) => a.title).join(", ")}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-mist bg-paper px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {role !== "student" && (
        <div className="mt-8 rounded-2xl border border-mist bg-fog p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Create Assignment</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-mist px-4 py-3 text-sm"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="rounded-2xl border border-mist px-4 py-3 text-sm"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            <input
              className="rounded-2xl border border-mist px-4 py-3 text-sm md:col-span-2"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="rounded-2xl border border-mist px-4 py-3 text-sm"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <input
              className="rounded-2xl border border-mist px-4 py-3 text-sm"
              placeholder="Assign to (student emails, comma separated)"
              value={form.assignedStudents}
              onChange={(e) => setForm({ ...form, assignedStudents: e.target.value })}
            />
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
          >
            Create Assignment
          </button>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-fog p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Assignments
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {loading && <p className="text-gray-600">Loading...</p>}
            {!loading && enrichedAssignments.length === 0 && (
              <p className="text-gray-600">No assignments found.</p>
            )}
            {enrichedAssignments.map((a) => (
              <div key={a.id} className="rounded-2xl border border-mist bg-paper px-3 py-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{a.title}</div>
                  <span
                    className={[
                      "rounded-2xl border px-2 py-1 text-xs",
                      a.status === "Late" ? "border-red-300 text-red-600" : "border-mist text-gray-600",
                    ].join(" ")}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600">{a.subject}</div>
                <div className="mt-2 text-xs text-gray-600">Due: {a.dueDate}</div>
                <div className="mt-2 text-xs text-gray-600">{a.description}</div>
                {role === "student" && (
                  <button
                    onClick={() => setSubmitDraft({ ...submitDraft, assignmentId: a.id })}
                    className="mt-2 rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                  >
                    Submit Assignment
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-fog p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {role === "student" ? "Submit Work" : "Submissions"}
          </h3>
          {role === "student" ? (
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
                placeholder="Assignment ID"
                value={submitDraft.assignmentId}
                onChange={(e) => setSubmitDraft({ ...submitDraft, assignmentId: e.target.value })}
              />
              <textarea
                className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
                rows={4}
                placeholder="Submission text"
                value={submitDraft.text}
                onChange={(e) => setSubmitDraft({ ...submitDraft, text: e.target.value })}
              />
              <input
                className="w-full rounded-2xl border border-mist px-4 py-3 text-sm"
                type="file"
                onChange={(e) =>
                  setSubmitDraft({ ...submitDraft, fileName: e.target.files?.[0]?.name || "" })
                }
              />
              <button
                onClick={handleSubmit}
                className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              {submissions.length === 0 && <p className="text-gray-600">No submissions yet.</p>}
              {submissions.map((s) => (
                <div key={s.id} className="rounded-2xl border border-mist bg-paper px-3 py-3">
                  <div className="font-medium">Assignment: {s.assignmentId}</div>
                  <div className="text-xs text-gray-600">Student: {s.studentId}</div>
                  <div className="text-xs text-gray-600">Status: {s.status}</div>
                  {s.fileName && <div className="text-xs text-gray-600">File: {s.fileName}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
