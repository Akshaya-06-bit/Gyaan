import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/I18nContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import AiTutor from "./pages/AiTutor";
import Progress from "./pages/Progress";
import MentorMatching from "./pages/MentorMatching";
import Login from "./pages/Login";
import MentorHome from "./pages/MentorHome";
import NgoHome from "./pages/NgoHome";
import MentorResources from "./pages/MentorResources";
import NgoDashboard from "./pages/NgoDashboard";
import MentorSessions from "./pages/MentorSessions";
import AiEngine from "./pages/AiEngine";
import StudentMentor from "./pages/StudentMentor";
import MentorStudents from "./pages/MentorStudents";
import Assignments from "./pages/Assignments";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-paper text-ink">
            <Navbar />
            <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/student"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ai-tutor"
              element={
                <ProtectedRoute roles={["student"]}>
                  <AiTutor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/progress"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/ai-engine"
              element={
                <ProtectedRoute roles={["student"]}>
                  <AiEngine />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/mentor"
              element={
                <ProtectedRoute roles={["student"]}>
                  <StudentMentor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute roles={["student"]}>
                  <Assignments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mentor"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/matching"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorMatching />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/students"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/resources"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/sessions"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <MentorSessions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/assignments"
              element={
                <ProtectedRoute roles={["mentor"]}>
                  <Assignments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ngo"
              element={
                <ProtectedRoute roles={["ngo"]}>
                  <NgoHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/dashboard"
              element={
                <ProtectedRoute roles={["ngo"]}>
                  <NgoDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/matching"
              element={
                <ProtectedRoute roles={["ngo"]}>
                  <MentorMatching />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ngo/assignments"
              element={
                <ProtectedRoute roles={["ngo"]}>
                  <Assignments />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
