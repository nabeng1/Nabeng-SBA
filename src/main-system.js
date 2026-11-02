/**
 * Nabeng-SBA system entry (Vite)
 * Import order: styles first, then app logic.
 * App functions are also attached to window for HTML onclick handlers.
 */
import "./style.css";
import { login } from "./app.js";

// Explicitly expose the login handler used by the legacy inline HTML action.
window.login = login;
