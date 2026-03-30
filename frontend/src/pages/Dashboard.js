import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const statsConfig = {
  student: [
    { icon: "📚", label: "Enrolled Courses" },
    { icon: "✅", label: "Completed" },
    { icon: "⏱️", label: "Hours Learned" },
    { icon: "🏆", label: "Badges Earned" },
  ],
  mentor: [
    { icon: "👥", label: "Active Students" },
    { icon: "📅", label: "Sessions This Week" },
    { icon: "📂", label: "Resources Shared" },
    { icon: "⭐", label: "Avg. Rating" },
  ],
  admin: [
    { icon: "👤", label: "Total Users" },
    { icon: "🎓", label: "Active Students" },
    { icon: "👨‍🏫", label: "Mentors" },
    { icon: "📊", label: "Courses Running" },
  ],
};

export default function Dashboard() {
  const { profile } = useAuth();
  const role = profile?.role || "student";

  const stats = statsConfig[role] || statsConfig.student;

  return (
    <div className="dashboard">
      <div className="welcome-banner">
        <div>
          <h2>Welcome back, {profile?.name?.split(" ")[0] || "User"} 👋</h2>
          <p>Here's what's happening on your platform today.</p>
        </div>
        <span className={`role-chip role-${role}`}>{role}</span>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <p className="stat-value">—</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-bottom">
        <div className="card activity-card">
          <h3>Recent Activity</h3>
          <div className="empty-state">
            <p>No recent activity yet.</p>
          </div>
        </div>

        <div className="card quick-actions-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            {role === "student" && (
              <>
                <button className="btn btn-primary">Start AI Tutor</button>
                <button className="btn btn-outline">Browse Courses</button>
                <button className="btn btn-outline">View Progress</button>
              </>
            )}
            {role === "mentor" && (
              <>
                <button className="btn btn-primary">Schedule Session</button>
                <button className="btn btn-outline">Upload Resource</button>
                <button className="btn btn-outline">View Students</button>
              </>
            )}
            {role === "admin" && (
              <>
                <button className="btn btn-primary">Add User</button>
                <button className="btn btn-outline">View Reports</button>
                <button className="btn btn-outline">Manage Roles</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
