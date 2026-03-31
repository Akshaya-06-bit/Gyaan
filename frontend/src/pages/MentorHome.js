import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useI18n } from "../context/I18nContext";

const summaryCards = [
  { label: "Assigned Students", value: 12, note: "4 need immediate attention" },
  { label: "Sessions This Week", value: 9, note: "2 still unassigned to a time slot" },
  { label: "High Priority Reviews", value: 3, note: "Math and English need extra focus" },
  { label: "Available Hours", value: "11h", note: "Balanced across weekday evenings" },
];

const schedulePrinciples = [
  {
    title: "Prioritize High-Risk Students First",
    description: "Reserve the earliest slots for students who are slipping in core subjects or have missed recent sessions.",
  },
  {
    title: "Group Similar Learning Needs",
    description: "Batch students with overlapping weak subjects so planning and resource prep stay efficient.",
  },
  {
    title: "Protect Follow-Up Time",
    description: "Leave short buffer blocks after every session for notes, parent messages, and action items.",
  },
];

const weeklyPlan = [
  {
    day: "Monday",
    focus: "High-risk remediation",
    slots: ["5:00 PM - Grade 8 Math", "6:00 PM - Grade 9 English", "7:00 PM - Review buffer"],
  },
  {
    day: "Tuesday",
    focus: "Progress check-ins",
    slots: ["5:30 PM - Parent update call", "6:00 PM - Science revision", "7:00 PM - Goal planning"],
  },
  {
    day: "Wednesday",
    focus: "Group support",
    slots: ["5:00 PM - Shared reading practice", "6:00 PM - Algebra clinic", "7:00 PM - Documentation"],
  },
];

const priorityStudents = [
  { name: "Mallik", className: "Grade 9", risk: "High", nextStep: "Book remedial math session" },
  { name: "Gowtham", className: "Grade 8", risk: "Medium", nextStep: "Follow up on English worksheet" },
  { name: "Isha", className: "Grade 9", risk: "Medium", nextStep: "Add science practice slot this week" },
];

const actions = [
  {
    title: "Student Overview",
    description: "See student risk levels, weak subjects, and last active dates before scheduling.",
    cta: "Open Students",
    to: "/mentor/students",
  },
  {
    title: "Schedule Sessions",
    description: "Create and manage session slots with clearer planning and status tracking.",
    cta: "Open Sessions",
    to: "/mentor/sessions",
  },
  {
    title: "Learning Resources",
    description: "Prepare worksheets and materials aligned to the week’s planned sessions.",
    cta: "Open Resources",
    to: "/mentor/resources",
  },
];

export default function MentorHome() {
  const { t } = useI18n();

  const workloadNote = useMemo(() => {
    const urgentCount = priorityStudents.filter((student) => student.risk === "High").length;
    return urgentCount > 0
      ? t("High-risk students should be placed in the first available slots.")
      : t("Current schedule can stay balanced across the week.");
  }, [t]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t("Mentor Dashboard")}</h1>
          <p className="text-sm text-gray-600">
            {t("Structured planning view to allocate sessions smartly, clearly, and with the right priorities.")}
          </p>
        </div>
        <Link
          to="/mentor/sessions"
          className="inline-flex rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
        >
          {t("Plan This Week")}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
            <p className="text-xs uppercase tracking-wide text-gray-600">{t(card.label)}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-gray-600">{t(card.note)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Smart Scheduling Structure")}
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {schedulePrinciples.map((item) => (
              <div key={item.title} className="rounded-2xl border border-mist px-4 py-4">
                <div className="font-medium">{t(item.title)}</div>
                <p className="mt-2 text-sm text-gray-600">{t(item.description)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-ink px-4 py-3 text-sm">
            {workloadNote}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Priority Queue")}
          </h3>
          <div className="mt-4 space-y-3 text-sm">
            {priorityStudents.map((student) => (
              <div key={student.name} className="rounded-2xl border border-mist px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{student.name}</div>
                  <span className="text-xs text-gray-600">{t(student.risk)}</span>
                </div>
                <div className="mt-1 text-xs text-gray-600">{t(student.className)}</div>
                <div className="mt-2 text-sm text-gray-700">{t(student.nextStep)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Weekly Allocation Plan")}
          </h3>
          <div className="mt-4 space-y-3">
            {weeklyPlan.map((day) => (
              <div key={day.day} className="rounded-2xl border border-mist px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{t(day.day)}</div>
                  <span className="text-xs uppercase tracking-wide text-gray-600">{t(day.focus)}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {day.slots.map((slot) => (
                    <div key={slot} className="rounded-2xl bg-fog px-3 py-2 text-sm text-gray-700">
                      {t(slot)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {t("Planning Checklist")}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Confirm which students need 1:1 sessions.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Align session topics with weak-subject trends.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Leave buffer space for updates and missed-session recovery.")}</div>
            <div className="rounded-2xl border border-mist px-3 py-3">{t("Prepare resources before the first session of each topic cluster.")}</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item) => (
          <div key={item.title} className="rounded-2xl border border-mist bg-fog p-5 shadow-soft">
            <h3 className="text-lg font-semibold">{t(item.title)}</h3>
            <p className="mt-2 text-sm text-gray-600">{t(item.description)}</p>
            <div className="mt-4">
              <Link
                to={item.to}
                className="inline-flex rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                {t(item.cta)}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
