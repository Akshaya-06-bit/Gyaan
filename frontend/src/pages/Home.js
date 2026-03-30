import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import { useI18n } from "../context/I18nContext";
import { useAuth } from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const actions = [
  {
    title: "Start Learning",
    description: "Pick a course and begin a focused session.",
    cta: "Explore Courses",
    to: "/student/courses",
  },
  {
    title: "Ask AI Tutor",
    description: "Get instant explanations and practice help.",
    cta: "Open Tutor",
    to: "/student/ai-tutor",
  },
  {
    title: "AI Learning Action",
    description: "Generate structured plans, quizzes, and maps.",
    cta: "Open AI Learning",
    to: "/student/ai-engine",
  },
  {
    title: "Mentor Support",
    description: "Get suggestions and contact your mentor.",
    cta: "View Mentor",
    to: "/student/mentor",
  },
  {
    title: "View Progress",
    description: "Track your subjects and recent scores.",
    cta: "See Progress",
    to: "/student/progress",
  },
];

const initialPlan = [
  { id: "p1", label: "Review Fractions (20 mins)", done: false },
  { id: "p2", label: "Practice Math quiz (10 questions)", done: false },
  { id: "p3", label: "Read Science notes (Chapter 4)", done: true },
];

const upcomingSessions = [
  { id: "s1", title: "Math Remedial", time: "Today 6:30 PM", mentor: "Neha Rao" },
  { id: "s2", title: "English Skills", time: "Wed 5:00 PM", mentor: "Vikram Shah" },
];

const recommendedMentors = [
  { id: "m1", name: "Neha Rao", focus: "Math, Science" },
  { id: "m2", name: "Vikram Shah", focus: "English, History" },
];

const goals = [
  { id: "g1", label: "Complete 3 quizzes this week", progress: 2, total: 3 },
  { id: "g2", label: "Finish Fractions roadmap", progress: 5, total: 8 },
  { id: "g3", label: "Attend all mentor sessions", progress: 1, total: 2 },
];

const badges = [
  { id: "b1", title: "Consistency Star", description: "7-day learning streak" },
  { id: "b2", title: "Quiz Ace", description: "Scored 90%+ in 3 quizzes" },
  { id: "b3", title: "Mentor Ready", description: "Completed 2 mentor sessions" },
];

const streakDays = [
  { id: "d1", label: "Mon", done: true },
  { id: "d2", label: "Tue", done: true },
  { id: "d3", label: "Wed", done: true },
  { id: "d4", label: "Thu", done: true },
  { id: "d5", label: "Fri", done: true },
  { id: "d6", label: "Sat", done: false },
  { id: "d7", label: "Sun", done: false },
];

const calendarMonths = [
  {
    id: "m1",
    name: "March 2026",
    offset: 0,
    days: 31,
  },
  {
    id: "m2",
    name: "April 2026",
    offset: 3,
    days: 30,
  },
  {
    id: "m3",
    name: "May 2026",
    offset: 5,
    days: 31,
  },
];

const leaderboard = [
  { id: "l1", name: "Gowtham", score: 92 },
  { id: "l2", name: "Aarav", score: 89 },
  { id: "l3", name: "Meera", score: 85 },
  { id: "l4", name: "Isha", score: 83 },
  { id: "l5", name: "Kabir", score: 81 },
];

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();
  const studentId = user?.email || "demo-student-1";

  const [plan, setPlan] = useState(initialPlan);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [personalGoals, setPersonalGoals] = useState(goals);
  const [newGoal, setNewGoal] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [goalsError, setGoalsError] = useState("");

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await fetch(`${API_URL}/student/goals?studentId=${encodeURIComponent(studentId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load goals");
        if (data.goals && data.goals.length) setPersonalGoals(data.goals);
      } catch (err) {
        setGoalsError(err.message || "Failed to load goals");
      }
    };
    loadGoals();
  }, [studentId]);

  const formatTime = (value) => {
    const mins = Math.floor(value / 60);
    const secs = value % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const completedCount = useMemo(() => plan.filter((p) => p.done).length, [plan]);

  const month = calendarMonths[monthIndex];
  const calendarCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < month.offset; i++) cells.push(null);
    for (let day = 1; day <= month.days; day++) cells.push(day);
    return cells;
  }, [month]);

  const addGoal = async () => {
    const label = newGoal.trim();
    if (!label) return;
    setSavingGoal(true);
    setGoalsError("");
    try {
      const res = await fetch(`${API_URL}/student/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, label, progress: 0, total: 5 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add goal");
      setPersonalGoals((g) => [data.goal, ...g]);
      setNewGoal("");
    } catch (err) {
      setGoalsError(err.message || "Failed to add goal");
    } finally {
      setSavingGoal(false);
    }
  };

  const updateGoal = async (id, patch) => {
    setPersonalGoals((g) => g.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal)));
    try {
      await fetch(`${API_URL}/student/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, ...patch }),
      });
    } catch (err) {
      setGoalsError(err.message || "Failed to update goal");
    }
  };

  const removeGoal = async (id) => {
    setPersonalGoals((g) => g.filter((goal) => goal.id !== id));
    try {
      await fetch(`${API_URL}/student/goals/${id}?studentId=${encodeURIComponent(studentId)}`, {
        method: "DELETE",
      });
    } catch (err) {
      setGoalsError(err.message || "Failed to remove goal");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("Welcome to your Student Module")}</h1>
        <p className="text-sm text-gray-600">
          {t("Minimal, focused, and built to help you learn with clarity.")}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Learning Streak")}</p>
          <p className="mt-2 text-2xl font-semibold">7 days</p>
        </div>
        <div className="rounded-2xl border border-mist bg-paper p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Sessions This Week")}</p>
          <p className="mt-2 text-2xl font-semibold">4</p>
        </div>
        <div className="rounded-2xl border border-mist bg-paper p-4 shadow-soft">
          <p className="text-xs uppercase tracking-wide text-gray-600">{t("Next Session")}</p>
          <p className="mt-2 text-sm font-semibold">Math Remedial - Today 6:30 PM</p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item) => (
          <Card
            key={item.title}
            title={t(item.title)}
            description={t(item.description)}
            action={
              <Link
                to={item.to}
                className="inline-flex rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                {t(item.cta)}
              </Link>
            }
          />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Today's Plan")}</h3>
          <div className="mt-4 space-y-3">
            {plan.map((item) => (
              <label key={item.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() =>
                    setPlan((list) =>
                      list.map((p) => (p.id === item.id ? { ...p, done: !p.done } : p))
                    )
                  }
                />
                <span className={item.done ? "line-through text-gray-500" : ""}>{item.label}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Completed: {completedCount}/{plan.length}
          </p>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Focus Session")}</h3>
          <div className="mt-4 text-center">
            <div className="text-3xl font-semibold tracking-widest">{formatTime(secondsLeft)}</div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setRunning((v) => !v)}
                className="rounded-2xl border border-ink px-4 py-2 text-xs font-medium transition hover:bg-ink hover:text-paper"
              >
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setSecondsLeft(25 * 60);
                }}
                className="rounded-2xl border border-mist px-4 py-2 text-xs font-medium"
              >
                Reset
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-600">Default 25-minute focus timer.</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Upcoming Sessions")}</h3>
          <div className="mt-4 space-y-3 text-sm">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{session.title}</div>
                <div className="text-xs text-gray-600">{session.time}</div>
                <div className="text-xs text-gray-600">Mentor: {session.mentor}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Recommended Mentors")}</h3>
          <div className="mt-4 space-y-3 text-sm">
            {recommendedMentors.map((mentor) => (
              <div key={mentor.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{mentor.name}</div>
                <div className="text-xs text-gray-600">Focus: {mentor.focus}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Goals Tracker")}</h3>
          <div className="mt-4 space-y-4 text-sm">
            {personalGoals.map((goal) => {
              const percent = Math.round((goal.progress / goal.total) * 100);
              return (
                <div key={goal.id} className="rounded-2xl border border-mist px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <input
                      className="w-full flex-1 rounded-2xl border border-mist px-3 py-2 text-sm"
                      value={goal.label}
                      onChange={(e) => updateGoal(goal.id, { label: e.target.value })}
                    />
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="rounded-2xl border border-mist px-3 py-2 text-xs"
                    >
                      {t("Remove")}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                    <input
                      type="number"
                      min="0"
                      max={goal.total}
                      value={goal.progress}
                      onChange={(e) =>
                        updateGoal(goal.id, { progress: Number(e.target.value) || 0 })
                      }
                      className="w-16 rounded-2xl border border-mist px-2 py-1 text-xs"
                    />
                    <span>/</span>
                    <input
                      type="number"
                      min="1"
                      value={goal.total}
                      onChange={(e) =>
                        updateGoal(goal.id, { total: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-16 rounded-2xl border border-mist px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-mist">
                    <div
                      className="h-2 rounded-full bg-ink"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              className="flex-1 rounded-2xl border border-mist px-3 py-2 text-sm"
              placeholder={t("Add a new goal")}
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
            />
            <button
              onClick={addGoal}
              disabled={savingGoal}
              className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper disabled:opacity-60"
            >
              {savingGoal ? t("Saving...") : t("Add Goal")}
            </button>
          </div>
          {goalsError && <div className="mt-2 text-xs text-red-600">{goalsError}</div>}
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Badges Earned")}</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            {badges.map((badge) => (
              <div key={badge.id} className="rounded-2xl border border-mist px-3 py-3">
                <div className="font-medium">{badge.title}</div>
                <div className="text-xs text-gray-600">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Streak Calendar")}</h3>
              <p className="mt-2 text-xs text-gray-600">Daily learning completion for this week.</p>
            </div>
            <button
              onClick={() => setShowAchievement(true)}
              className="rounded-2xl border border-ink px-3 py-2 text-xs"
            >
              {t("Celebrate Streak")}
            </button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {streakDays.map((day) => (
              <div
                key={day.id}
                className={[
                  "rounded-2xl border px-3 py-4 text-center text-xs",
                  day.done ? "border-ink bg-ink text-paper" : "border-mist text-gray-600",
                ].join(" ")}
              >
                <div className="text-[11px] uppercase tracking-wide">{day.label}</div>
                <div className="mt-2 text-lg font-semibold">{day.done ? "Done" : "--"}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Monthly View")}</h3>
              <p className="mt-2 text-xs text-gray-600">Track streaks across the month.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMonthIndex((m) => (m === 0 ? calendarMonths.length - 1 : m - 1))}
                className="rounded-2xl border border-mist px-2 py-1 text-xs"
              >
                Prev
              </button>
              <button
                onClick={() => setMonthIndex((m) => (m + 1) % calendarMonths.length)}
                className="rounded-2xl border border-mist px-2 py-1 text-xs"
              >
                Next
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm font-medium">{month.name}</div>
          <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-gray-600">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center font-semibold">
                {d}
              </div>
            ))}
            {calendarCells.map((day, i) => (
              <div
                key={`${day || "empty"}-${i}`}
                className={[
                  "rounded-2xl border px-2 py-3 text-center",
                  day ? "border-mist" : "border-transparent",
                ].join(" ")}
              >
                {day || ""}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Leaderboard")}</h3>
        <p className="mt-2 text-xs text-gray-600">Class ranking based on weekly scores.</p>
        <div className="mt-4 space-y-2 text-sm">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-mist px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">#{index + 1}</span>
                <span className="font-medium">{entry.name}</span>
              </div>
              <span className="text-xs text-gray-600">{entry.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {showAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-mist bg-paper p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Streak Milestone!</h3>
            <p className="mt-2 text-sm text-gray-600">
              You completed a 7-day learning streak. Keep going and unlock new badges.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAchievement(false)}
                className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
