import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./DashboardLayout.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/courses": "My Courses",
  "/dashboard/ai-tutor": "AI Tutor",
  "/dashboard/progress": "Progress",
  "/dashboard/students": "My Students",
  "/dashboard/sessions": "Sessions",
  "/dashboard/resources": "Resources",
  "/dashboard/users": "Manage Users",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || "Dashboard";

  return (
    <div className="layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
