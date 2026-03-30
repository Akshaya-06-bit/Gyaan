import { Link } from "react-router-dom";
import Card from "../components/Card";
import { useI18n } from "../context/I18nContext";

const actions = [
  {
    title: "Mentor Students",
    description: "View assigned students and performance details.",
    cta: "Open Students",
    to: "/mentor/students",
  },
];

export default function MentorHome() {
  const { t } = useI18n();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t("Mentor")}</h1>
        <p className="text-sm text-gray-600">Manage your students and guidance.</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item) => (
          <Card
            key={item.title}
            title={t(item.title)}
            description={item.description}
            action={
              <Link
                to={item.to}
                className="inline-flex rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                {item.cta}
              </Link>
            }
          />
        ))}
      </div>
    </div>
  );
}
