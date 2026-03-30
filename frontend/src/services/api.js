import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");
export const getAllUsers = () => api.get("/auth/users");
export const updateUserRole = (userId, role) =>
  api.patch(`/auth/users/${userId}/role`, { role });

// Progress APIs
export const getStudentSummary = (studentId) => api.get(`/progress/${studentId}/summary`);
export const getTestScores     = (studentId) => api.get(`/progress/${studentId}/scores`);
export const addTestScore      = (studentId, data) => api.post(`/progress/${studentId}/scores`, data);

// AI APIs
export const runAiAnalysis     = (studentId) => api.post(`/ai/analyze/${studentId}`);
export const getAiAnalysis     = (studentId) => api.get(`/ai/analyze/${studentId}`);
export const chatWithTutor     = (message, studentId = null) => api.post("/ai/chat", { message, studentId });

// Courses APIs
export const savePreferences   = (data) => api.post("/courses/preferences", data);
export const getPreferences    = (uid)  => api.get(`/courses/preferences/${uid}`);
// Dashboard APIs (NGO/Admin)
export const getDashboardOverview = () => api.get("/dashboard/overview");
export const getStudents = (filters = {}) => api.get("/dashboard/students", { params: filters });
export const getMentors = () => api.get("/dashboard/mentors");
export const getPerformance = () => api.get("/dashboard/performance");
export const getAIInsights = () => api.post("/dashboard/ai-insights");

// Mentor-Student Matching APIs
export const getStudentsForMatching = () => api.get("/matching/students");
export const getMentorsForMatching = () => api.get("/matching/mentors");
export const performAIMatching = (data) => api.post("/matching/ai-match", data);
export const assignMentorToStudent = (studentId, mentorId) => api.post("/matching/assign-mentor", { studentId, mentorId });
export const bulkAssignMentors = (matches) => api.post("/matching/bulk-assign", { matches });
