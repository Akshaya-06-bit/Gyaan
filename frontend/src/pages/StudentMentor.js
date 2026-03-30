import { useEffect, useState } from "react";
import { useI18n } from "../context/I18nContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const MOCK_SUGGESTIONS = {
  riskLevel: "medium",
  weakSubjects: ["Math"],
  sessionSuggestions: [
    "Focus next session on Math fundamentals.",
    "Start with a 5-minute diagnostic quiz.",
    "End with a short recap and practice plan.",
  ],
  mentorActions: [
    "Assign a short practice quiz after the session.",
    "Send a brief recap note to student and guardian.",
  ],
  riskNotes: ["Student shows moderate risk. Monitor weekly."],
};

export default function StudentMentor() {
  const { t } = useI18n();
  const [studentId, setStudentId] = useState("demo-student-1");
  const [suggestions, setSuggestions] = useState(null);
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadMentor = async () => {
    if (!studentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/mentor/suggestions/${studentId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load mentor.");
      setSuggestions(data);
    } catch {
      setSuggestions(MOCK_SUGGESTIONS);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`${API_URL}/mentor/session-request/${studentId}`);
      const data = await res.json();
      if (res.ok) setRequests(data.requests || []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    loadMentor();
    loadRequests();
  }, []);

  const sendMessage = async () => {
    if (!message) return;
    try {
      await fetch(`${API_URL}/mentor/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, mentorId: "mentor", message }),
      });
      setMessage("");
    } catch {
      setMessage("");
    }
  };

  const requestSession = async () => {
    if (!suggestions) return;
    try {
      await fetch(`${API_URL}/mentor/session-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, mentorId: "mentor", notes: note }),
      });
      setNote("");
      loadRequests();
    } catch {
      setNote("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Mentor")}</h1>
          <p className="text-sm text-gray-600">Contact, request sessions, and view mentor details.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Student ID
          </label>
          <input
            className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm outline-none transition focus:border-ink"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter student id"
          />
          <button
            onClick={loadMentor}
            className="mt-3 rounded-2xl border border-ink px-3 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Mentor"}
          </button>
          {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Mentor Suggestions
          </h3>
          {suggestions ? (
            <div className="mt-3 text-sm space-y-3">
              <div className="text-xs text-gray-600">
                Risk level: <span className="font-medium">{suggestions.riskLevel}</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600">Session Suggestions</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {suggestions.sessionSuggestions?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600">Mentor Actions</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {suggestions.mentorActions?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-600">Risk Notes</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {suggestions.riskNotes?.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-sm text-gray-600">No suggestions available.</div>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Contact Mentor
          </h3>
          <textarea
            className="mt-3 w-full rounded-2xl border border-mist px-3 py-2 text-sm outline-none transition focus:border-ink"
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message to your mentor..."
          />
          <button
            onClick={sendMessage}
            className="mt-3 rounded-2xl border border-ink px-3 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper"
          >
            Send Message
          </button>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Request Session
          </h3>
          <textarea
            className="mt-3 w-full rounded-2xl border border-mist px-3 py-2 text-sm outline-none transition focus:border-ink"
            rows="4"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe what you need help with..."
          />
          <button
            onClick={requestSession}
            className="mt-3 rounded-2xl border border-ink px-3 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper"
          >
            Request Session
          </button>
          <div className="mt-4 text-xs text-gray-600">
            {requests.length === 0 ? "No requests yet." : "Recent requests:"}
          </div>
          <div className="mt-2 space-y-2 text-xs">
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-mist px-3 py-2">
                {r.status} · {r.notes || "Session request"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
