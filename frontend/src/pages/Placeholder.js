import "./Placeholder.css";

export function Progress() {
  return (
    <div className="placeholder-page">
      <h3>My Progress</h3>
      <div className="card">
        <p className="muted">No progress data available yet.</p>
      </div>
    </div>
  );
}

export function Students() {
  return (
    <div className="placeholder-page">
      <h3>My Students</h3>
      <div className="card">
        <p className="muted">No students assigned yet.</p>
      </div>
    </div>
  );
}

export function Sessions() {
  return (
    <div className="placeholder-page">
      <h3>Sessions</h3>
      <div className="card">
        <p className="muted">No sessions scheduled yet.</p>
      </div>
    </div>
  );
}

export function Resources() {
  return (
    <div className="placeholder-page">
      <h3>Resources</h3>
      <div className="card"><p className="muted">No resources uploaded yet. Click below to add one.</p>
        <button className="btn btn-primary" style={{ marginTop: 16 }}>+ Upload Resource</button>
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <div className="placeholder-page">
      <h3>Reports</h3>
      <div className="card"><p className="muted">Analytics and reports will appear here.</p></div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="placeholder-page">
      <h3>Settings</h3>
      <div className="card"><p className="muted">Platform settings and configurations.</p></div>
    </div>
  );
}
