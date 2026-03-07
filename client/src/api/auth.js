import axios from "axios";

const api = axios.create({ withCredentials: true });

/**
 * Redirect browser to Google OAuth — no AJAX needed.
 */
export function loginWithGoogle() {
  window.location.href = "/auth/google";
}

/**
 * GET /auth/me → returns the logged-in user object or throws.
 */
export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}

/**
 * GET /auth/logout → clears the cookie server-side.
 */
export async function logout() {
  await api.get("/auth/logout");
}
