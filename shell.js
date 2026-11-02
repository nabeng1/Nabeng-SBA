/**
 * Shell / sidebar / mobile menu
 */
import { SBA } from "../runtime.js";

/* ========== SBA Shell: sidebar + mobile menu ========== */
function openSbaSidebar(){
  const app = document.getElementById('app');
  if(app) app.classList.add('sba-sidebar-open');
}
function closeSbaSidebar(){
  const app = document.getElementById('app');
  if(app) app.classList.remove('sba-sidebar-open');
}
function toggleSbaSidebar(){
  const app = document.getElementById('app');
  if(!app) return;
  app.classList.toggle('sba-sidebar-open');
}




if (typeof openSbaSidebar === "function") window.openSbaSidebar = openSbaSidebar;
if (typeof closeSbaSidebar === "function") window.closeSbaSidebar = closeSbaSidebar;
if (typeof toggleSbaSidebar === "function") window.toggleSbaSidebar = toggleSbaSidebar;
