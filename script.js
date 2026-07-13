/* =====================================================
   ACM-W BPHC — single-page site behaviour
   All page content (domains, events, fests, projects,
   testimonials, senate) is rendered directly in index.html.
   This file only handles interactivity: the tab/"page"
   switching, the domains dropdown, the events calendar,
   and the projects filter.
   ===================================================== */

/* ---------------------------------------------------
   1. PAGE SWITCHING (tabs that behave like pages)
   Any element with [data-page="X"] switches to the
   section with id="page-X" when clicked.
   --------------------------------------------------- */
const pages = document.querySelectorAll(".page");
const pageLinks = document.querySelectorAll("[data-page]");

function showPage(id, anchor){
  if(!document.getElementById("page-" + id)) id = "home";
  pages.forEach(p => p.classList.toggle("is-active", p.id === "page-" + id));
  pageLinks.forEach(a => {
    const isDomainGroup = id.startsWith("domain-") && a.id === "domainsBtn";
    a.classList.toggle("is-active", a.dataset.page === id || isDomainGroup);
  });
  window.scrollTo({top:0, behavior:"instant"});
  history.replaceState(null, "", "#" + id);
  if(anchor){
    const el = document.getElementById(anchor);
    if(el) requestAnimationFrame(() => el.scrollIntoView({behavior:"smooth", block:"start"}));
  }
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if(!link) return;
  e.preventDefault();
  showPage(link.dataset.page, link.dataset.anchor);
  mainNav.classList.remove("is-open");
  domainsPanel.classList.remove("is-open");
});

window.addEventListener("DOMContentLoaded", () => {
  const initial = location.hash.replace("#", "") || "home";
  showPage(initial);
});

/* ---------------------------------------------------
   2. NAV — mobile toggle + Domains dropdown
   --------------------------------------------------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
});

const domainsBtn = document.getElementById("domainsBtn");
const domainsPanel = document.getElementById("domainsPanel");
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

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------
   3. DOMAIN SUBTABS (Bulletin / Tasks / Progress)
   Scoped to whichever .domain-panel was clicked in, so
   all six domain pages can share the same markup/classes.
   --------------------------------------------------- */
/* ---------------------------------------------------
   3b. SCROLL-REVEAL — fades/slides section titles and
   cards into view as the user scrolls to them.
   --------------------------------------------------- */
const revealTargets = document.querySelectorAll(
  ".section-title, .page-hero-title, .quicklink-card, .project-card, .testimonial-card, .senate-card, .fest-card"
);
revealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = (i % 6) * 0.07 + "s";
});
if("IntersectionObserver" in window){
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("is-visible"));
}

document.querySelectorAll(".domain-panel").forEach(panel => {
  panel.addEventListener("click", (e) => {
    const btn = e.target.closest(".subtab");
    if(!btn) return;
    const activeSub = btn.dataset.sub;
    panel.querySelectorAll(".subtab").forEach(b => b.classList.toggle("is-active", b === btn));
    panel.querySelectorAll(".subpanel").forEach(p => {
      p.hidden = p.dataset.subpanel !== activeSub;
    });
  });
});

/* ---------------------------------------------------
   4. EVENTS — calendar + day detail
   --------------------------------------------------- */
const EVENTS = [{"year": 2026, "month": 7, "day": 8, "title": "Technical domain interviews", "type": "Recruitment", "desc": "Shortlisted applicants interview slots, Room 204."}, {"year": 2026, "month": 7, "day": 12, "title": "Intro to Git & GitHub workshop", "type": "Workshop", "desc": "Beginner session, Library Seminar Hall, 6 PM."}, {"year": 2026, "month": 7, "day": 14, "title": "Poster drafts submission", "type": "Deadline", "desc": "Design domain \u2014 submit to shared drive by EOD."}, {"year": 2026, "month": 7, "day": 20, "title": "Senate open forum", "type": "Meeting", "desc": "Open Q&A with the current senate, all members welcome."}, {"year": 2026, "month": 7, "day": 27, "title": "Mentorship circle kickoff", "type": "Community", "desc": "First mentorship pairing session of the semester."}, {"year": 2026, "month": 8, "day": 3, "title": "Freshers' meet & greet", "type": "Community", "desc": "Open house for incoming first-years."}];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let calYear = 2026, calMonth = 7; // 1-indexed month to match EVENTS data

function eventsOn(year, month, day){
  return EVENTS.filter(e => e.year === year && e.month === month && e.day === day);
}

function renderCalendar(){
  document.getElementById("calMonthLabel").textContent = MONTH_NAMES[calMonth-1] + " " + calYear;
  const grid = document.getElementById("calGrid");
  grid.innerHTML = "";
  const firstDay = new Date(calYear, calMonth-1, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === calYear && today.getMonth()+1 === calMonth;

  for(let i=0;i<firstDay;i++){
    const blank = document.createElement("span");
    blank.className = "cal-day is-blank";
    grid.appendChild(blank);
  }
  for(let day=1; day<=daysInMonth; day++){
    const btn = document.createElement("button");
    btn.className = "cal-day";
    btn.textContent = day;
    if(eventsOn(calYear, calMonth, day).length) btn.classList.add("has-event");
    if(isCurrentMonth && today.getDate() === day) btn.classList.add("is-today");
    btn.addEventListener("click", () => showDayDetail(day));
    grid.appendChild(btn);
  }
}

function showDayDetail(day){
  const list = eventsOn(calYear, calMonth, day);
  const box = document.getElementById("dayDetail");
  if(!list.length){
    box.hidden = true;
    return;
  }
  box.hidden = false;
  box.innerHTML = "<strong>" + MONTH_NAMES[calMonth-1] + " " + day + ", " + calYear + "</strong>" +
    list.map(e => "<p style='margin-top:8px;'><strong>" + e.title + "</strong><br>" + e.desc + "</p>").join("");
}

document.getElementById("calPrev").addEventListener("click", () => {
  calMonth--; if(calMonth<1){calMonth=12; calYear--;}
  renderCalendar();
});
document.getElementById("calNext").addEventListener("click", () => {
  calMonth++; if(calMonth>12){calMonth=1; calYear++;}
  renderCalendar();
});
renderCalendar();

/* ---------------------------------------------------
   5. PROJECTS & BLOGS — tag filter
   --------------------------------------------------- */
const projectFiltersEl = document.getElementById("projectFilters");
projectFiltersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if(!btn) return;
  projectFiltersEl.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("is-active", b===btn));
  const filter = btn.dataset.tag;
  document.querySelectorAll("#projectsGrid .project-card").forEach(card => {
    card.style.display = (filter === "All" || card.dataset.tag === filter) ? "" : "none";
  });
});
