/**
 * Nabeng-SBA entry (Vite) — modular like Nabeng Invoice
 */
import "./style.css";
import "./runtime.js";
import "./modules/subscription.js";
import { wireSbaApi } from "./modules/wire.js";
import { refreshSidebarUser } from "./components/sidebar.js";

const CLASSIC_MODULES = ['shared', 'auth', 'profile', 'students', 'teachers', 'marks', 'dashboard', 'attendance', 'homework', 'terms', 'reports', 'chat', 'notices', 'timetable', 'shell', 'boot'];

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

async function loadClassicModules() {
  for (const name of CLASSIC_MODULES) {
    await loadScript("/js/modules/" + name + ".js");
  }
}

loadClassicModules()
  .then(() => {
    wireSbaApi();
    try { refreshSidebarUser(); } catch (e) {}
    console.log("[Nabeng-SBA] modules ready:", CLASSIC_MODULES.join(", "));
  })
  .catch((err) => console.error(err));
