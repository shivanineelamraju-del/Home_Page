/* =====================================================
   ACM-W BPHC — shared behaviour for standalone subject-
   domain pages (e.g. ml-ai.html) and study.html.
   These pages live outside the index.html single-page
   app, so this is a lightweight copy of just the header
   interactions from script.js, plus flip-card handling.
   ===================================================== */

/* ---------- theme toggle (persists via localStorage) ---------- */
const themeToggle = document.getElementById("themeToggle");
function currentTheme(){
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
function setTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("acmw-theme", theme);
  themeToggle.setAttribute("aria-pressed", theme === "dark");
  themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
if(themeToggle){
  setTheme(currentTheme());
  themeToggle.addEventListener("click", () => {
    setTheme(currentTheme() === "dark" ? "light" : "dark");
  });
}

/* ---------- mobile nav toggle ---------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
if(navToggle && mainNav){
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open);
  });
}

/* ---------- domains dropdown ---------- */
const domainsBtn = document.getElementById("domainsBtn");
const domainsPanel = document.getElementById("domainsPanel");
if(domainsBtn && domainsPanel){
  domainsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = domainsPanel.classList.toggle("is-open");
    domainsBtn.setAttribute("aria-expanded", open);
  });
  document.addEventListener("click", (e) => {
    if(!e.target.closest(".nav-dropdown")){
      domainsPanel.classList.remove("is-open");
      domainsBtn.setAttribute("aria-expanded", false);
    }
  });
}

/* ---------- footer year ---------- */
const yearEl = document.getElementById("year");
if(yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- project flip cards ---------- */
/* Click or press Enter/Space to flip. Works the same on
   touch and desktop, so we don't rely on :hover alone. */
document.querySelectorAll(".flip-card").forEach(card => {
  card.addEventListener("click", () => card.classList.toggle("is-flipped"));
  card.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      card.classList.toggle("is-flipped");
    }
  });
});
