import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

  function navClass({ isActive }) {
    return isActive ? styles.activeLink : undefined;
  }

  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.brand}>
        <span className={styles.logo}>📍</span>
        <h1>MemorySpot</h1>
      </NavLink>

      <button
        className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
        <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
          Map
        </NavLink>
        <NavLink to="/memories" className={navClass} onClick={() => setMenuOpen(false)}>
          Memories
        </NavLink>
        <NavLink to="/create" className={navClass} onClick={() => setMenuOpen(false)}>
          + Add
        </NavLink>

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
            <button className={styles.logoutBtn} onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
