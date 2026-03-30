import { useEffect, useState } from "react";
import { useI18n } from "../context/I18nContext";

export default function MentorResources() {
  const { t } = useI18n();
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({ title: "", subject: "", link: "", notes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  const loadResources = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/resources`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load resources.");
      setResources(data.resources || []);
    } catch (err) {
      setError(err.message || "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save resource.");
      setResources((prev) => [data, ...prev]);
      setForm({ title: "", subject: "", link: "", notes: "" });
    } catch (err) {
      setError(err.message || "Failed to save resource.");
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("Mentor Resources")}</h1>
        <p className="text-sm text-gray-600">
          Structured lesson plans and session guides for volunteers.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <form onSubmit={addResource} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Title
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Fractions Basics"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Subject
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Math"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Resource Link (optional)
            </label>
            <input
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Notes
            </label>
            <textarea
              className="w-full rounded-2xl border border-mist px-4 py-3 text-sm outline-none transition focus:border-ink"
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Key points and teaching tips..."
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-2xl border border-ink px-4 py-2 text-sm font-medium transition hover:bg-ink hover:text-paper"
            >
              Add Resource
            </button>
          </div>
        </form>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <div className="rounded-2xl border border-mist bg-paper p-5 text-sm text-gray-600 shadow-soft">
            Loading resources...
          </div>
        )}
        {!loading && resources.length === 0 && (
          <div className="rounded-2xl border border-mist bg-paper p-5 text-sm text-gray-600 shadow-soft">
            No resources added yet.
          </div>
        )}
        {resources.map((r) => (
          <div key={r.id} className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
            <h3 className="text-lg font-semibold">{r.title}</h3>
            <p className="mt-1 text-xs uppercase tracking-wide text-gray-600">{r.subject}</p>
            {r.notes && <p className="mt-3 text-sm text-gray-700">{r.notes}</p>}
            {r.link && (
              <a
                href={r.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm underline"
              >
                Open link
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
