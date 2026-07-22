/* =====================================================
   ACM-W BPHC — single-page site behaviour
   All page content (events, fests, projects, testimonials,
   senate) is rendered directly in index.html. The Domains
   nav link scrolls to the Domains section on the home page;
   each domain card is a plain link out to its own standalone
   page (see /domains/*). Contact Us likewise links out to
   the standalone contact page.
   This file only handles interactivity: the tab/"page"
   switching, the events calendar, and the projects filter.
   ===================================================== */

/* ---------------------------------------------------
   1. PAGE SWITCHING (tabs that behave like pages)
   Any element with [data-page="X"] switches to the
   section with id="page-X" when clicked. If it also has
   [data-anchor="Y"], the page scrolls to id="Y" afterwards
   (used for the Domains nav link -> #domains section).
   --------------------------------------------------- */
const pages = document.querySelectorAll(".page");
const pageLinks = document.querySelectorAll("[data-page]");

function showPage(id, anchor){
  if(!document.getElementById("page-" + id)) id = "home";
  pages.forEach(p => p.classList.toggle("is-active", p.id === "page-" + id));
  pageLinks.forEach(a => {
    a.classList.toggle("is-active", a.dataset.page === id);
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
});

window.addEventListener("DOMContentLoaded", () => {
  const initial = location.hash.replace("#", "") || "home";
  showPage(initial);
});

/* ---------------------------------------------------
   1b. THEME TOGGLE — dark (navy bg / white text) vs
   light (white bg / navy text). Persists via localStorage;
   the inline <head> script sets the initial attribute
   before paint so there's no flash of the wrong theme.
   --------------------------------------------------- */
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
setTheme(currentTheme()); // sync button state with whatever the head script chose
themeToggle.addEventListener("click", () => {
  setTheme(currentTheme() === "dark" ? "light" : "dark");
});

/* ---------------------------------------------------
   1c. HERO LOGO CUBE — cursor-controlled 3D rotation
   The CSS handles the one-time tumble-in entrance
   (cubeSpinIn). Once that finishes, we cancel the CSS
   animation and hand rotation control to the pointer so
   dragging spins the cube freely. A short drag suppresses
   the click-to-navigate on that face so taps still work.
   --------------------------------------------------- */
const heroCube = document.getElementById("heroCube");
if(heroCube){
  let rotX = -16, rotY = 0;
  let dragging = false, moved = false;
  let lastX = 0, lastY = 0;

  const applyCubeTransform = () => {
    heroCube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  };

  heroCube.addEventListener("animationend", (e) => {
    if(e.animationName === "cubeSpinIn"){
      heroCube.style.animation = "none";
      applyCubeTransform();
    }
  });

  heroCube.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    heroCube.classList.add("is-dragging");
    heroCube.setPointerCapture(e.pointerId);
  });

  heroCube.addEventListener("pointermove", (e) => {
    if(!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    if(Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
    rotY += dx * 0.4;
    rotX -= dy * 0.4;
    lastX = e.clientX;
    lastY = e.clientY;
    applyCubeTransform();
  });

  const endDrag = () => {
    dragging = false;
    heroCube.classList.remove("is-dragging");
  };
  heroCube.addEventListener("pointerup", endDrag);
  heroCube.addEventListener("pointercancel", endDrag);

  heroCube.addEventListener("click", (e) => {
    if(moved){
      e.preventDefault();
      e.stopPropagation();
      moved = false;
    }
  });
}

/* ---------------------------------------------------
   2. NAV — mobile toggle
   --------------------------------------------------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
});

/* ---------------------------------------------------
   3. SCROLL-REVEAL — fades/slides section titles and
   cards into view as the user scrolls to them.
   Testimonials and senate cards replay on every pass;
   everything else reveals once and stays put.
   --------------------------------------------------- */
const revealOnceTargets = document.querySelectorAll(
  ".section-title, .page-hero-title, .story-card, .fest-card, .quicklink-card, .flip-card, .spotlight-card"
);
const revealReplayTargets = document.querySelectorAll(
  ".testimonial-card, .senate-card"
);
const allRevealTargets = [...revealOnceTargets, ...revealReplayTargets];
allRevealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = (i % 6) * 0.07 + "s";
});
if("IntersectionObserver" in window){
  const revealOnceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        revealOnceObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.15});
  revealOnceTargets.forEach(el => revealOnceObserver.observe(el));

  const revealReplayObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  }, {threshold:0.15});
  revealReplayTargets.forEach(el => revealReplayObserver.observe(el));
} else {
  allRevealTargets.forEach(el => el.classList.add("is-visible"));
}

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
   5. PROJECTS & BLOGS — pill filter + read-time sort +
   mark-as-read on click
   --------------------------------------------------- */
const projectFiltersEl = document.getElementById("projectFilters");
const blogSortEl = document.getElementById("blogSort");
const storyCards = document.querySelectorAll("#projectsGrid .story-card");
let activeTag = "All";

function applyStoryFilters(){
  const sortValue = blogSortEl ? blogSortEl.value : "recent";
  storyCards.forEach(card => {
    const tagMatch = activeTag === "All" || card.dataset.tag === activeTag;
    const readTime = Number(card.dataset.readTime);
    let timeMatch = true;
    if(sortValue === "quick") timeMatch = readTime < 5;
    if(sortValue === "long") timeMatch = readTime > 10;
    card.style.display = (tagMatch && timeMatch) ? "" : "none";
  });
}

if(projectFiltersEl){
  projectFiltersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if(!btn) return;
    projectFiltersEl.querySelectorAll(".pill").forEach(b => b.classList.toggle("is-active", b===btn));
    activeTag = btn.dataset.tag;
    applyStoryFilters();
  });
}

if(blogSortEl){
  blogSortEl.addEventListener("change", applyStoryFilters);
}

storyCards.forEach(card => {
  const readMoreLink = card.querySelector(".read-more");
  const dot = card.querySelector(".indicator-dot");
  if(readMoreLink && dot){
    readMoreLink.addEventListener("click", () => {
      dot.classList.remove("dot-unread");
      dot.classList.add("dot-read");
    });
  }
});

 /*6. ABOUT PAGE- drop downs*/
document.querySelectorAll('.about-inner').forEach(inner => {
    const inside = inner.nextElementSibling; // the .tab-body right after this header
 
    inner.addEventListener('click', () => {
      inner.classList.toggle('active');
      inside.classList.toggle('open');
    });
  });
