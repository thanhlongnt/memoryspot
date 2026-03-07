import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>
        <span className={styles.logo}>📍</span>
        <h1>MemorySpot</h1>
      </Link>

      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Map
        </Link>
        <Link to="/memories" onClick={() => setMenuOpen(false)}>
          Memories
        </Link>
        <Link to="/create" onClick={() => setMenuOpen(false)}>
          + Add
        </Link>

        {user && (
          <div className={styles.userSection}>
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.displayName}
                className={styles.avatar}
                referrerPolicy="no-referrer"
              />
            )}
            <span className={styles.displayName}>{user.displayName}</span>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
