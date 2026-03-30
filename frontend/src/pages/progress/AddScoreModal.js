import { useState } from "react";
import { addTestScore } from "../../services/api";
import "./Progress.css";

const SUBJECTS = ["Math", "Science", "English", "History", "Geography", "Computer Science"];

export default function AddScoreModal({ studentId, onClose, onAdded }) {
  const [form, setForm] = useState({
    testName: "", subject: "Math", score: "", maxScore: "100",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (+form.score > +form.maxScore)
      return setError("Score cannot exceed max score.");
    setLoading(true);
    try {
      await addTestScore(studentId, {
        ...form,
        score: +form.score,
        maxScore: +form.maxScore,
      });
      onAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add score.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Test Score</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Test Name</label>
            <input name="testName" placeholder="e.g. Math Mid-Term" value={form.testName} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Subject</label>
              <select name="subject" value={form.subject} onChange={handleChange}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Score</label>
              <input name="score" type="number" min="0" placeholder="75" value={form.score} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Max Score</label>
              <input name="maxScore" type="number" min="1" placeholder="100" value={form.maxScore} onChange={handleChange} required />
            </div>
          </div>
          {error && <p className="error-msg">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Add Score"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
