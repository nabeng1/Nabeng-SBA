/**
 * Nabeng-SBA entry (Vite) — Kanella-style: markup injected into #root
 */
import "./style.css";
import shellHtml from "./system-shell.html?raw";

function mountSystemShell() {
  let root = document.getElementById("root");
  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }
  root.innerHTML = shellHtml;
  document.body.classList.add("sba-system");
}

mountSystemShell();

import "./runtime.js";
import "./modules/subscription.js";
import "./modules/shell.js";
import { wireSbaApi } from "./modules/wire.js";
import { refreshSidebarUser } from "./components/sidebar.js";

// Load classic core after runtime globals + DOM shell exist
import coreUrl from "./modules/app-core.js?url";

function loadClassicCore() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = coreUrl;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load app-core.js"));
    document.head.appendChild(s);
  });
}

loadClassicCore()
  .then(() => {
    wireSbaApi();
    try {
      refreshSidebarUser();
    } catch (e) {}
    console.log("[Nabeng-SBA] modules ready");
  })
  .catch((err) => {
    console.error(err);
  });
