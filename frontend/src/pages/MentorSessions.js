import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const QUICK_TEMPLATES = [
  "High-Risk Math Support",
  "English Reading Check-In",
  "Science Revision Block",
  "Parent Progress Review",
];

const SUGGESTED_SLOTS = [
  { label: "Today 5:00 PM", hour: 17, note: "Good for focused 1:1 follow-up." },
  { label: "Tomorrow 6:00 PM", hour: 18, note: "Best for after-school attendance." },
  { label: "Saturday 10:00 AM", hour: 10, note: "Useful for group revision or make-up sessions." },
];

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "--";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getStatusLabel = (status) => {
  if (!status) return "Scheduled";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function MentorSessions() {
  const { t } = useI18n();
  const { user } = useAuth();
  const defaultMentorId = user?.email || "mentor@demo.com";
  const [sessions, setSessions] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    mentorId: defaultMentorId,
    studentIds: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const mockSessions = useMemo(
    () => [
      {
        id: "s1",
        title: "Algebra Revision",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        mentorId: defaultMentorId,
        studentIds: ["demo-student-1"],
        notes: "Focus on equations and confidence-building practice.",
      },
      {
        id: "s2",
        title: "Reading Skills",
        date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
        status: "scheduled",
        mentorId: defaultMentorId,
        studentIds: ["demo-student-2", "demo-student-3"],
        notes: "Group comprehension session with recap worksheet.",
      },
      {
        id: "s3",
        title: "Parent Progress Review",
        date: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
        status: "completed",
        mentorId: defaultMentorId,
        studentIds: ["demo-student-4"],
        notes: "Share attendance improvement and next steps.",
      },
    ],
    [defaultMentorId]
  );

  const loadSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/sessions?mentorId=${encodeURIComponent(defaultMentorId)}`);
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to load sessions.");
      setSessions(data.sessions || []);
      setUsingMockData(false);
    } catch (err) {
      setSessions(mockSessions);
      setUsingMockData(true);
      setError("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setForm((current) => ({ ...current, mentorId: defaultMentorId }));
  }, [defaultMentorId]);

  useEffect(() => {
    loadSessions();
  }, [defaultMentorId]);

  const upcomingSessions = useMemo(() => {
    const now = Date.now();
    return sessions
      .filter((session) => {
        const time = new Date(session.date).getTime();
        return !Number.isNaN(time) && time >= now && session.status !== "canceled";
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sessions]);

  const sessionSummary = useMemo(() => {
    const scheduled = sessions.filter((session) => session.status === "scheduled").length;
    const completed = sessions.filter((session) => session.status === "completed").length;
    const today = sessions.filter((session) => {
      const date = new Date(session.date);
      const now = new Date();
      return (
        !Number.isNaN(date.getTime()) &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    const studentCoverage = new Set(
      sessions.flatMap((session) => (Array.isArray(session.studentIds) ? session.studentIds : []))
    ).size;

    return { scheduled, completed, today, studentCoverage };
  }, [sessions]);

  const planningInsights = useMemo(() => {
    const busyHours = new Set(
      upcomingSessions
        .map((session) => new Date(session.date))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.getHours())
    );

    const recommendedSlots = SUGGESTED_SLOTS.filter((slot) => !busyHours.has(slot.hour)).slice(0, 2);

    const groupedSessions = upcomingSessions.filter(
      (session) => Array.isArray(session.studentIds) && session.studentIds.length > 1
    ).length;

    const oneToOneSessions = upcomingSessions.filter(
      (session) => !Array.isArray(session.studentIds) || session.studentIds.length <= 1
    ).length;

    const nextSession = upcomingSessions[0] || null;

    return {
      recommendedSlots,
      groupedSessions,
      oneToOneSessions,
      nextSession,
    };
  }, [upcomingSessions]);

  const addSession = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;

    setError("");

    const payload = {
      title: form.title,
      date: form.date,
      mentorId: form.mentorId || defaultMentorId,
      studentIds: form.studentIds
        ? form.studentIds.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      notes: form.notes || "",
    };

    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to create session.");
      setSessions((prev) => [...prev, data]);
      setUsingMockData(false);
      setForm({ title: "", date: "", mentorId: defaultMentorId, studentIds: "", notes: "" });
    } catch (err) {
      const fallback = { id: `s-${Date.now()}`, ...payload, status: "scheduled" };
      setSessions((prev) => [...prev, fallback]);
      setUsingMockData(true);
      setForm({ title: "", date: "", mentorId: defaultMentorId, studentIds: "", notes: "" });
    }
  };

  const updateStatus = async (sessionId, status) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json()
        : { error: "Backend unavailable." };
      if (!res.ok) throw new Error(data.error || "Failed to update status.");
    } catch (err) {
      setUsingMockData(true);
    } finally {
      setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, status } : session)));
      setError("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("Mentor Sessions")}</h1>
          <p className="text-sm text-gray-600">
            {t("Plan sessions with clearer structure, workload visibility, and smarter allocation cues.")}
          </p>
        </div>
        {usingMockData && (
          <div className="rounded-2xl border border-mist bg-fog px-4 py-2 text-xs text-gray-600">
            {t("Demo scheduling data is showing right now.")}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Scheduled")}</p>
          <p className="mt-2 text-2xl font-semibold">{sessionSummary.scheduled}</p>
          <p className="mt-2 text-sm text-gray-600">{t("Sessions still active in the calendar.")}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Today")}</p>
          <p className="mt-2 text-2xl font-semibold">{sessionSummary.today}</p>
          <p className="mt-2 text-sm text-gray-600">{t("Keep buffer time ready for notes and follow-up.")}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Students Covered")}</p>
          <p className="mt-2 text-2xl font-semibold">{sessionSummary.studentCoverage}</p>
          <p className="mt-2 text-sm text-gray-600">{t("Unique learners already included in your plan.")}</p>
        </div>
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Completed")}</p>
          <p className="mt-2 text-2xl font-semibold">{sessionSummary.completed}</p>
          <p className="mt-2 text-sm text-gray-600">{t("Past sessions closed out successfully.")}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Smart Scheduling Suggestions")}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-mist px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-gray-600">{t("Next Session")}</div>
              <div className="mt-2 font-medium">
                {planningInsights.nextSession ? planningInsights.nextSession.title : t("No session planned")}
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {planningInsights.nextSession ? formatDateTime(planningInsights.nextSession.date) : t("Add the next priority block.")}
              </div>
            </div>
            <div className="rounded-2xl border border-mist px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-gray-600">{t("1:1 Focus")}</div>
              <div className="mt-2 text-2xl font-semibold">{planningInsights.oneToOneSessions}</div>
              <div className="mt-1 text-sm text-gray-600">{t("Reserve these for high-risk or low-confidence learners.")}</div>
            </div>
            <div className="rounded-2xl border border-mist px-4 py-4">
              <div className="text-xs uppercase tracking-wide text-gray-600">{t("Group Blocks")}</div>
              <div className="mt-2 text-2xl font-semibold">{planningInsights.groupedSessions}</div>
              <div className="mt-1 text-sm text-gray-600">{t("Useful when weak-subject patterns overlap.")}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-ink px-4 py-4">
            <div className="text-xs uppercase tracking-wide text-gray-600">{t("Recommended Open Slots")}</div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(planningInsights.recommendedSlots.length ? planningInsights.recommendedSlots : SUGGESTED_SLOTS.slice(0, 2)).map((slot) => (
                <div key={slot.label} className="rounded-2xl bg-fog px-3 py-3">
                  <div className="font-medium">{t(slot.label)}</div>
                  <div className="mt-1 text-sm text-gray-600">{t(slot.note)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Quick Structure")}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Place high-risk 1:1 sessions before group revision blocks.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Keep at least one short buffer after every two sessions.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Use group sessions only when student needs clearly overlap.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("End the day with parent updates or documentation, not heavy teaching.")}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Create Session")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {QUICK_TEMPLATES.map((template) => (
              <button
                key={template}
                type="button"
                onClick={() => setForm((current) => ({ ...current, title: template }))}
                className="rounded-2xl border border-mist px-3 py-2 text-xs font-medium transition hover:border-ink"
              >
                {t(template)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={addSession} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Title")}</label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("e.g. Algebra Revision")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Date and Time")}</label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Mentor ID")}</label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.mentorId}
              onChange={(e) => setForm({ ...form, mentorId: e.target.value })}
              placeholder={t("mentor uid or email")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Student IDs")}</label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.studentIds}
              onChange={(e) => setForm({ ...form, studentIds: e.target.value })}
              placeholder={t("uid1, uid2")}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Notes")}</label>
            <textarea
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("Session goal, risk note, or follow-up action...")}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
            >
              {t("Create Session")}
            </button>
          </div>
        </form>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {t("Upcoming Sessions")}
        </h3>
        <div className="mt-4 space-y-3 text-sm">
          {loading && <p className="text-gray-600">{t("Loading...")}</p>}
          {!loading && sessions.length === 0 && <p className="text-gray-600">{t("No sessions scheduled yet.")}</p>}
          {sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-mist px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{session.title}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    {formatDateTime(session.date)} | {getStatusLabel(session.status)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {t("Students")}: {Array.isArray(session.studentIds) && session.studentIds.length ? session.studentIds.join(", ") : "--"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(session.id, "completed")}
                    className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                  >
                    {t("Mark Completed")}
                  </button>
                  <button
                    onClick={() => updateStatus(session.id, "canceled")}
                    className="rounded-2xl border border-ink px-3 py-1 text-xs font-medium transition hover:bg-ink hover:text-paper"
                  >
                    {t("Cancel")}
                  </button>
                </div>
              </div>
              {session.notes && <p className="mt-2 text-xs text-gray-600">{session.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
