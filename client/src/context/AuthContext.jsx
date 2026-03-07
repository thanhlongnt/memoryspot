import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout as logoutApi } from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
