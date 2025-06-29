import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          throw new Error("Parsed user is not a valid object.");
        }
      } catch (e) {
        console.error("Invalid user data in localStorage:", e);
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    if (!userData || !jwtToken) {
      console.warn("login() called with invalid user or token", { userData, jwtToken });
      return;
    }

    setUser(userData);
    setToken(jwtToken);

    try {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", jwtToken);
    } catch (err) {
      console.error("Failed to store user/token in localStorage:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
