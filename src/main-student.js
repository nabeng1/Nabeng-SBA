/**
 * Student portal Vite entry — CSS is hashed/minified; app logic loaded as classic script chunk.
 */
import "./student-style.css";

// Ensure classic student app runs after DOM is ready.
// student-app.js is intentionally a classic global script imported for side effects
// via dynamic injection so function declarations stay on window.
import appSourceUrl from "./student-app.js?url";

function loadClassicStudentApp() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = appSourceUrl;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load student-app.js"));
    document.head.appendChild(s);
  });
}

loadClassicStudentApp()
  .then(() => {
    console.log("[Nabeng-SBA] student portal ready");
  })
  .catch((err) => console.error(err));
