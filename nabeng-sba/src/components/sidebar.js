/**
 * Sidebar component helpers (shell module owns behaviour)
 */
import { SBA } from "../runtime.js";

export function refreshSidebarUser() {
  const u = window.currentUser || SBA.state.currentUser;
  if (!u) return;
  const nameEl = document.getElementById("sidebarUserName");
  if (nameEl) nameEl.textContent = u.firstname || u.username || "User";
  if (typeof window.applySidebarAvatar === "function") {
    window.applySidebarAvatar(u);
  }
}
