import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = {
  student: [
    { to: "/dashboard", icon: "🏠", label: "Home" },
    { to: "/dashboard/courses", icon: "📚", label: "My Courses" },
    { to: "/dashboard/ai-tutor", icon: "🤖", label: "AI Tutor" },
    { to: "/dashboard/progress", icon: "📈", label: "Progress" },
  ],
  mentor: [
    { to: "/dashboard", icon: "🏠", label: "Home" },
    { to: "/dashboard/students", icon: "👥", label: "My Students" },
    { to: "/dashboard/sessions", icon: "📅", label: "Sessions" },
    { to: "/dashboard/resources", icon: "📂", label: "Resources" },
    { to: "/dashboard/mentor-matching", icon: "🎯", label: "Student Matching" },
  ],
  admin: [
    { to: "/dashboard", icon: "🏠", label: "Home" },
    { to: "/dashboard/users", icon: "👤", label: "Manage Users" },
    { to: "/dashboard/ngo-dashboard", icon: "📊", label: "NGO Dashboard" },
    { to: "/dashboard/mentor-matching", icon: "🎯", label: "Student Matching" },
    { to: "/dashboard/reports", icon: "📈", label: "Reports" },
    { to: "/dashboard/settings", icon: "⚙️", label: "Settings" },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { profile, logout } = useAuth();
  const role = profile?.role || "student";
  const items = navItems[role] || navItems.student;

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span>🎓</span>
          <span className="logo-text">LearnAI</span>
        </div>

        <div className="sidebar-profile">
          <div className="avatar">{profile?.name?.[0]?.toUpperCase() || "U"}</div>
          <div>
            <p className="profile-name">{profile?.name || "User"}</p>
            <span className={`role-badge role-${role}`}>{role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="btn btn-outline logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>
    </>
  );
}
