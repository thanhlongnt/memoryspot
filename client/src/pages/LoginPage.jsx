import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGoogle } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Already logged in → go home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Still checking auth
  if (user === undefined) return null;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.logo}>📍</span>
        <h1 className={styles.title}>MemorySpot</h1>
        <p className={styles.subtitle}>
          Save and revisit your favorite memories on a map.
        </p>
        <button className={styles.googleBtn} onClick={loginWithGoogle}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
            className={styles.googleLogo}
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
