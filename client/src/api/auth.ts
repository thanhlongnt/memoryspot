import axios from "axios";
import { User } from "../types/shared";

const api = axios.create({ withCredentials: true });

/**
 * Redirect browser to Google OAuth — no AJAX needed.
 */
export function loginWithGoogle(): void {
  window.location.href = "/auth/google";
}

/**
 * GET /auth/me → returns the logged-in user object or throws.
 */
export async function getCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

/**
 * GET /auth/logout → clears the cookie server-side.
 */
export async function logout(): Promise<void> {
  await api.get("/auth/logout");
}
