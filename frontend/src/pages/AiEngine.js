import { useMemo, useState } from "react";
import { useI18n } from "../context/I18nContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const templates = [
  { label: "Grade 8 · Fractions", subject: "Math", classLevel: "Grade 8", topic: "Fractions" },
  { label: "Grade 9 · Algebra", subject: "Math", classLevel: "Grade 9", topic: "Linear Equations" },
  { label: "Grade 7 · Biology", subject: "Science", classLevel: "Grade 7", topic: "Cells" },
  { label: "Grade 10 · English", subject: "English", classLevel: "Grade 10", topic: "Essay Writing" },
];

const TreeNode = ({ node }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className="ml-4 border-l border-mist pl-4">
      <div className="flex items-center justify-between gap-2 py-1">
        <button
          className="text-left text-sm font-medium hover:underline"
          onClick={() => hasChildren && setOpen(!open)}
        >
          {hasChildren ? (open ? "v " : "> ") : "- "}
          {node.title}
        </button>
        <button className="rounded-2xl border border-ink px-2 py-1 text-xs transition hover:bg-ink hover:text-paper">
          Start Topic
        </button>
      </div>
      {hasChildren && open && (
        <div className="space-y-1">
          {node.children.map((c, i) => (
            <TreeNode key={`${c.title}-${i}`} node={c} />
          ))}
        </div>
      )}
    </div>
  );
};

const Graph = ({ map }) => {
  if (!map.nodes.length) {
    return (
      <div className="rounded-2xl border border-mist bg-paper px-4 py-6 text-center text-sm text-gray-600">
        Generate a concept map to visualize relationships.
      </div>
    );
  }
  const width = 520;
  const height = 220;
  const nodes = map.nodes.map((n, idx) => ({
    ...n,
    x: 80 + (idx % 4) * 130,
    y: 60 + Math.floor(idx / 4) * 90,
  }));
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="rounded-2xl border border-mist bg-paper">
      {map.edges.map((e, i) => (
        <line
          key={i}
          x1={nodeById[e.from]?.x}
          y1={nodeById[e.from]?.y}
          x2={nodeById[e.to]?.x}
          y2={nodeById[e.to]?.y}
          stroke="#0a0a0a"
          strokeWidth="1"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r="18" fill="#ffffff" stroke="#0a0a0a" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="10">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default function AiEngine() {
  const { t } = useI18n();
  const [subject, setSubject] = useState("Math");
  const [classLevel, setClassLevel] = useState("Grade 8");
  const [topic, setTopic] = useState("Fractions");
  const [difficulty, setDifficulty] = useState("Medium");

  const [structure, setStructure] = useState({ tree: [], roadmap: [] });
  const [quiz, setQuiz] = useState({ questions: [] });
  const [conceptMap, setConceptMap] = useState({ nodes: [], edges: [] });
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");

  const [loadingStructure, setLoadingStructure] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  const [history, setHistory] = useState([]);
  const [savedPlans, setSavedPlans] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);

  const handleGenerate = async () => {
    setLoadingStructure(true);
    try {
      const res = await fetch(`${API_URL}/ai-engine/generate-course-structure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, classLevel, topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI structure failed.");
      setStructure(data);
      setHistory((h) => [
        {
          id: `h-${Date.now()}-structure`,
          type: "Structure",
          subject,
          classLevel,
          topic,
          data,
          time: new Date().toLocaleTimeString(),
        },
        ...h,
      ].slice(0, 5));
      setError("");
    } catch (err) {
      setError(err.message || "AI structure failed.");
    } finally {
      setLoadingStructure(false);
    }
  };

  const handleQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await fetch(`${API_URL}/ai-engine/generate-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, classLevel, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI quiz failed.");
      setQuiz(data);
      setResponses({});
      setScore(null);
      setHistory((h) => [
        {
          id: `h-${Date.now()}-quiz`,
          type: "Quiz",
          subject,
          classLevel,
          topic,
          data,
          time: new Date().toLocaleTimeString(),
        },
        ...h,
      ].slice(0, 5));
      setError("");
    } catch (err) {
      setError(err.message || "AI quiz failed.");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleConcept = async () => {
    setLoadingMap(true);
    try {
      const res = await fetch(`${API_URL}/ai-engine/generate-concept-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, classLevel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI concept map failed.");
      setConceptMap(data);
      setHistory((h) => [
        {
          id: `h-${Date.now()}-map`,
          type: "Concept Map",
          subject,
          classLevel,
          topic,
          data,
          time: new Date().toLocaleTimeString(),
        },
        ...h,
      ].slice(0, 5));
      setError("");
    } catch (err) {
      setError(err.message || "AI concept map failed.");
    } finally {
      setLoadingMap(false);
    }
  };

  const submitQuiz = () => {
    const questions = quiz.questions || [];
    let correct = 0;
    questions.forEach((q) => {
      const r = responses[q.id];
      if (r && String(r).trim().toLowerCase() === String(q.answer).trim().toLowerCase()) correct++;
    });
    const finalScore = `${correct}/${questions.length}`;
    setScore(finalScore);
    setQuizHistory((q) => [
      {
        id: `q-${Date.now()}`,
        topic,
        score: finalScore,
        time: new Date().toLocaleTimeString(),
      },
      ...q,
    ].slice(0, 5));
  };

  const roadmap = useMemo(() => structure.roadmap || [], [structure]);
  const roadmapSummary = useMemo(() => {
    if (!roadmap.length) return "Generate a roadmap to view the learning sequence.";
    return `This plan has ${roadmap.length} steps, starting with ${roadmap[0]}.`;
  }, [roadmap]);

  const exportJson = (name, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-24 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("AI Learning Title")}</h1>
          <p className="text-sm text-gray-600">{t("Generate course structure, quizzes, and concept maps.")}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {templates.map((tItem) => (
            <button
              key={tItem.label}
              onClick={() => {
                setSubject(tItem.subject);
                setClassLevel(tItem.classLevel);
                setTopic(tItem.topic);
              }}
              className="rounded-2xl border border-mist px-3 py-1 text-xs transition hover:border-ink"
            >
              {tItem.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Subject")}</label>
            <input
              className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Class Level")}</label>
            <input
              className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Topic (optional)")}</label>
            <input
              className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t("Quiz Difficulty")}</label>
            <select
              className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            disabled={loadingStructure}
            className="rounded-2xl border border-ink px-3 py-2 text-xs transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {loadingStructure ? "Generating..." : t("Generate Structure")}
          </button>
          <button
            onClick={handleQuiz}
            disabled={loadingQuiz}
            className="rounded-2xl border border-ink px-3 py-2 text-xs transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {loadingQuiz ? "Generating..." : t("Generate Quiz")}
          </button>
          <button
            onClick={handleConcept}
            disabled={loadingMap}
            className="rounded-2xl border border-ink px-3 py-2 text-xs transition hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            {loadingMap ? "Generating..." : t("Generate Concept Map")}
          </button>
          <button
            onClick={() => {
              setStructure({ tree: [], roadmap: [] });
              setQuiz({ questions: [] });
              setConceptMap({ nodes: [], edges: [] });
              setResponses({});
              setScore(null);
              setError("");
            }}
            className="rounded-2xl border border-mist px-3 py-2 text-xs"
          >
            {t("Clear Results")}
          </button>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Course Structure")}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => exportJson("course-structure.json", structure)}
                className="rounded-2xl border border-mist px-2 py-1 text-xs"
              >
                {t("Export JSON")}
              </button>
              <button
                onClick={() =>
                  setSavedPlans((p) => [
                    {
                      id: `p-${Date.now()}`,
                      subject,
                      classLevel,
                      topic,
                      data: structure,
                    },
                    ...p,
                  ].slice(0, 3))
                }
                className="rounded-2xl border border-ink px-2 py-1 text-xs"
              >
                {t("Save Plan")}
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {structure.tree?.map((n, i) => (
              <TreeNode key={`${n.title}-${i}`} node={n} />
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-semibold">Roadmap</p>
            <ol className="mt-2 list-decimal pl-4">
              {roadmap.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-gray-500">{roadmapSummary}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Concept Map")}</h3>
            <button
              onClick={() => exportJson("concept-map.json", conceptMap)}
              className="rounded-2xl border border-mist px-2 py-1 text-xs"
            >
              {t("Export JSON")}
            </button>
          </div>
          <div className="mt-4">
            <Graph map={conceptMap} />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-mist bg-paper p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Quiz")}</h3>
          <button
            onClick={() => exportJson("quiz.json", quiz)}
            className="rounded-2xl border border-mist px-2 py-1 text-xs"
          >
            {t("Export JSON")}
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {(quiz.questions || []).map((q) => (
            <div key={q.id} className="rounded-2xl border border-mist p-4">
              <p className="text-sm font-semibold">{q.question}</p>
              {q.type === "mcq" ? (
                <div className="mt-2 space-y-2">
                  {q.options?.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        onChange={(e) => setResponses((r) => ({ ...r, [q.id]: e.target.value }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  className="mt-2 w-full rounded-2xl border border-mist px-3 py-2 text-sm"
                  placeholder="Your answer"
                  onChange={(e) => setResponses((r) => ({ ...r, [q.id]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={submitQuiz} className="rounded-2xl border border-ink px-3 py-2 text-xs">
            {t("Submit Quiz")}
          </button>
          {score && <span className="text-sm text-gray-600">Score: {score}</span>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Generation History")}</h3>
          <div className="mt-4 space-y-3 text-sm">
            {history.length === 0 && <div className="text-gray-600">No generations yet.</div>}
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{item.type}</div>
                  <div className="text-xs text-gray-600">{item.time}</div>
                </div>
                <div className="text-xs text-gray-600">
                  {item.subject} · {item.classLevel} · {item.topic}
                </div>
                <button
                  onClick={() => {
                    if (item.type === "Structure") setStructure(item.data);
                    if (item.type === "Quiz") setQuiz(item.data);
                    if (item.type === "Concept Map") setConceptMap(item.data);
                  }}
                  className="mt-2 rounded-2xl border border-ink px-2 py-1 text-xs"
                >
                  Load
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-mist bg-paper p-5 shadow-soft">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Saved Plans")}</h3>
          <div className="mt-4 space-y-3 text-sm">
            {savedPlans.length === 0 && <div className="text-gray-600">No saved plans yet.</div>}
            {savedPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{plan.topic}</div>
                <div className="text-xs text-gray-600">
                  {plan.subject} · {plan.classLevel}
                </div>
                <button
                  onClick={() => setStructure(plan.data)}
                  className="mt-2 rounded-2xl border border-ink px-2 py-1 text-xs"
                >
                  Open
                </button>
              </div>
            ))}
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-600">{t("Recent Quiz Scores")}</h3>
          <div className="mt-4 space-y-2 text-sm">
            {quizHistory.length === 0 && <div className="text-gray-600">No quiz history yet.</div>}
            {quizHistory.map((q) => (
              <div key={q.id} className="rounded-2xl border border-mist px-3 py-2">
                <div className="font-medium">{q.topic}</div>
                <div className="text-xs text-gray-600">Score: {q.score}</div>
                <div className="text-xs text-gray-600">{q.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
