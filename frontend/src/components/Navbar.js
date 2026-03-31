import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";

const navByRole = {
  student: [
    { to: "/student", label: "Home" },
    { to: "/student/ai-engine", label: "AI Learning" },
    { to: "/student/courses", label: "My Courses" },
    { to: "/student/ai-tutor", label: "AI Tutor" },
    { to: "/student/assignments", label: "Assignments" },
    { to: "/student/progress", label: "Progress" },
    { to: "/student/mentor", label: "Mentor" },
  ],
  mentor: [
    { to: "/mentor", label: "Dashboard" },
    { to: "/mentor/students", label: "Students" },
    { to: "/mentor/resources", label: "Resources" },
    { to: "/mentor/sessions", label: "Sessions" },
    { to: "/mentor/assignments", label: "Assignments" },
  ],
  ngo: [
    { to: "/ngo/dashboard", label: "Dashboard" },
    { to: "/ngo/matching", label: "Matching" },
    { to: "/ngo/assignments", label: "Assignments" },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const role = user?.role;
  const navItems = role ? navByRole[role] : [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-mist/80 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink text-xs font-bold">
            AI
          </span>
          <span>Gyaan</span>
        </div>
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                [
                  "rounded-2xl px-3 py-2 transition",
                  "hover:bg-fog",
                  isActive ? "bg-ink text-paper hover:bg-ink" : "text-ink",
                ].join(" ")
              }
            >
              {t(item.label)}
            </NavLink>
          ))}
          <div className="ml-2 flex items-center gap-2">
            <label className="text-xs text-gray-600">{t("Language")}</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-2xl border border-mist px-2 py-1 text-xs"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
              <option value="kn">Kannada</option>
              <option value="ml">Malayalam</option>
            </select>
          </div>
          {user && (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-2xl border border-ink px-3 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
            >
              {t("Logout")}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
