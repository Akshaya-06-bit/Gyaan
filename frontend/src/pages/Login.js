import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("student123");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const result = login(email.trim(), password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const role = result.user.role;
    if (role === "student") navigate("/student", { replace: true });
    if (role === "mentor") navigate("/mentor", { replace: true });
    if (role === "ngo") navigate("/ngo", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-2xl border border-mist bg-paper p-6 shadow-soft">
        <h1 className="text-xl font-semibold tracking-tight">{t("Login")}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Use the demo credentials to access each module.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              {t("Email")}
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="student@demo.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              {t("Password")}
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="student123"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            className="w-full rounded-2xl border border-ink px-4 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
          >
            {t("Sign In")}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-xs text-gray-600">
          <p className="font-semibold text-ink">Demo credentials</p>
          <p>Student: student@demo.com / student123</p>
          <p>Mentor: mentor@demo.com / mentor123</p>
          <p>Admin: ngo@demo.com / ngo123</p>
        </div>
      </div>
    </div>
  );
}
