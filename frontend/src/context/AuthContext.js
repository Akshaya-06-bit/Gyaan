import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("demo_auth");
    return raw ? JSON.parse(raw) : null;
  });

  const login = (email, password) => {
    const demoUsers = [
      { role: "student", email: "student@demo.com", password: "student123", name: "Student Demo" },
      { role: "mentor", email: "mentor@demo.com", password: "mentor123", name: "Mentor Demo" },
      { role: "ngo", email: "ngo@demo.com", password: "ngo123", name: "NGO Admin" },
    ];

    const match = demoUsers.find((u) => u.email === email && u.password === password);
    if (!match) return { ok: false, error: "Invalid credentials." };

    const nextUser = { email: match.email, role: match.role, name: match.name };
    localStorage.setItem("demo_auth", JSON.stringify(nextUser));
    setUser(nextUser);
    return { ok: true, user: nextUser };
  };

  const logout = () => {
    localStorage.removeItem("demo_auth");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      profile: user,
      loading: false,
      login,
      logout,
    }),
    [user]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
