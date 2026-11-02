/**
 * Nabeng-SBA entry (Vite) — same pattern as Nabeng Invoice main.js
 */
import "./style.css";
import "./runtime.js";
import "./modules/subscription.js";
import "./modules/shell.js";
import { wireSbaApi } from "./modules/wire.js";
import { refreshSidebarUser } from "./components/sidebar.js";

// Load classic core after runtime globals exist
import coreUrl from "./modules/app-core.js?url";

function loadClassicCore() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = coreUrl;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load app-core.js"));
    document.head.appendChild(s);
  });
}

loadClassicCore()
  .then(() => {
    wireSbaApi();
    try { refreshSidebarUser(); } catch (e) {}
    console.log("[Nabeng-SBA] modules ready");
  })
  .catch((err) => {
    console.error(err);
  });
