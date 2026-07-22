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
    a.classList.toggle("is-active", a.dataset.page === id && !a.dataset.anchor);
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

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------
   3. SCROLL-REVEAL — fades/slides section titles and
   cards into view as the user scrolls to them.
   Testimonials and senate cards replay on every pass;
   everything else reveals once and stays put.
   --------------------------------------------------- */
const revealOnceTargets = document.querySelectorAll(
  ".section-title, .page-hero-title, .story-card, .fest-card, .quicklink-card, .flip-card, .spotlight-card, .calendar-card, .about-lede, .about"
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
const EVENTS = [{"year": 2026, "month": 7, "day": 3, "title": "Practice School II Registration", "type": "Academic", "desc": "Registration window opens for students heading into Practice School II."}, {"year": 2026, "month": 7, "day": 3, "title": "Practice School II begins", "type": "Academic", "desc": "Practice School II placements begin for eligible students."}, {"year": 2026, "month": 7, "day": 26, "title": "Convocation 2026", "type": "Event", "desc": "BITS Pilani, Hyderabad Campus convocation ceremony."}, {"year": 2026, "month": 7, "day": 31, "title": "Orientation Program I", "type": "Academic", "desc": "Orientation for new admissions, part I."}, {"year": 2026, "month": 8, "day": 1, "title": "Semester 1 begins", "type": "Academic", "desc": "First semester of AY 2026-27 officially begins."}, {"year": 2026, "month": 8, "day": 1, "title": "Registration", "type": "Academic", "desc": "Course registration for Semester 1."}, {"year": 2026, "month": 8, "day": 2, "title": "Orientation Program II", "type": "Academic", "desc": "Orientation for new admissions, part II."}, {"year": 2026, "month": 8, "day": 3, "title": "Class work begins", "type": "Academic", "desc": "First day of classes for Semester 1."}, {"year": 2026, "month": 8, "day": 15, "title": "Independence Day", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 8, "day": 17, "title": "Last day for course substitution", "type": "Deadline", "desc": "Final day to substitute courses for the semester."}, {"year": 2026, "month": 8, "day": 26, "title": "Milad-un-Nabi", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 8, "day": 28, "title": "Raksha Bandhan", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 9, "day": 4, "title": "Janmashtami", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 9, "day": 14, "title": "Ganesh Chaturthi", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 9, "day": 21, "title": "Last date for course withdrawal (Tentative)", "type": "Deadline", "desc": "Tentative last date to withdraw from courses."}, {"year": 2026, "month": 10, "day": 2, "title": "Gandhi Jayanti", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 10, "day": 5, "title": "Mid-semester exams begin", "type": "Exam", "desc": "Mid-semester exams run October 5–10, classwork suspended."}, {"year": 2026, "month": 10, "day": 20, "title": "Dussehra", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 10, "day": 23, "title": "ATMOS 2026", "type": "Fest", "desc": "Chapter's technical fest — October 23–25, classwork suspended."}, {"year": 2026, "month": 10, "day": 28, "title": "Mid-sem answer script return deadline", "type": "Deadline", "desc": "Last day for returning evaluated Mid-Semester Test answer scripts."}, {"year": 2026, "month": 10, "day": 31, "title": "Last day of Mid-semester grading", "type": "Deadline", "desc": "Faculty grading deadline for Mid-Semester Test."}, {"year": 2026, "month": 11, "day": 7, "title": "Deepavali", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 11, "day": 24, "title": "Guru Nanak Jayanti", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2026, "month": 11, "day": 27, "title": "Last day of classes", "type": "Academic", "desc": "Final day of classwork for Semester 1."}, {"year": 2026, "month": 11, "day": 28, "title": "Ph.D. Admissions Test/Interview", "type": "Academic", "desc": "Test/interview window for Semester II 2026-27 Ph.D. admissions, Nov 28–30."}, {"year": 2026, "month": 11, "day": 30, "title": "Pre-comprehensive marks display deadline", "type": "Deadline", "desc": "Last date for display of pre-comprehensive marks."}, {"year": 2026, "month": 12, "day": 1, "title": "Comprehensive examinations begin", "type": "Exam", "desc": "Comprehensive examinations for Semester 1 begin."}, {"year": 2026, "month": 12, "day": 16, "title": "Comprehensive Examinations end", "type": "Exam", "desc": "Comprehensive examinations for Semester 1 conclude."}, {"year": 2026, "month": 12, "day": 16, "title": "Practice School II ends", "type": "Academic", "desc": "Practice School II placements conclude."}, {"year": 2026, "month": 12, "day": 18, "title": "First semester ends", "type": "Academic", "desc": "Semester 1, AY 2026-27 officially ends."}, {"year": 2026, "month": 12, "day": 20, "title": "Recess", "type": "Recess", "desc": "Winter recess, December 20 – January 3."}, {"year": 2026, "month": 12, "day": 25, "title": "Christmas", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 1, "day": 4, "title": "Registration for Practice School II", "type": "Academic", "desc": "Registration opens for Practice School II, Semester II."}, {"year": 2027, "month": 1, "day": 4, "title": "Practice School II begins", "type": "Academic", "desc": "Practice School II placements begin for Semester II."}, {"year": 2027, "month": 1, "day": 6, "title": "Registration for all students", "type": "Academic", "desc": "Course registration for Semester II."}, {"year": 2027, "month": 1, "day": 7, "title": "Classwork begins", "type": "Academic", "desc": "First day of classes for Semester II."}, {"year": 2027, "month": 1, "day": 15, "title": "Makar Sankranti", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 1, "day": 23, "title": "Last day for course substitution", "type": "Deadline", "desc": "Final day to substitute courses for the semester."}, {"year": 2027, "month": 1, "day": 26, "title": "Republic Day", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 2, "day": 19, "title": "PEARL 2027", "type": "Fest", "desc": "Chapter fest — February 19–21, classwork suspended."}, {"year": 2027, "month": 2, "day": 25, "title": "Last day for course withdrawal", "type": "Deadline", "desc": "Final date to withdraw from courses."}, {"year": 2027, "month": 3, "day": 6, "title": "Maha Shivratri", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 3, "day": 8, "title": "Mid Semester Exams begin", "type": "Exam", "desc": "Mid-semester exams run March 8–15, classwork suspended."}, {"year": 2027, "month": 3, "day": 10, "title": "Id-ul-Fitr", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 3, "day": 22, "title": "Holi", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 3, "day": 24, "title": "Mid-sem answer script return deadline", "type": "Deadline", "desc": "Last day for returning evaluated Mid-Semester Test answer scripts."}, {"year": 2027, "month": 3, "day": 26, "title": "Good Friday", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 3, "day": 26, "title": "ARENA 2027", "type": "Fest", "desc": "Chapter fest — March 26–28."}, {"year": 2027, "month": 3, "day": 27, "title": "Last day of Mid-semester grading", "type": "Deadline", "desc": "Faculty grading deadline for Mid-Semester Test."}, {"year": 2027, "month": 4, "day": 7, "title": "Ugadi", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 4, "day": 14, "title": "Ambedkar Jayanti", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 4, "day": 15, "title": "Sri Ram Navami", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 4, "day": 19, "title": "Mahavir Jayanti", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 4, "day": 21, "title": "Registration for Practice School I", "type": "Academic", "desc": "Registration opens for Practice School I."}, {"year": 2027, "month": 4, "day": 28, "title": "Pre-comprehensive marks display deadline", "type": "Deadline", "desc": "Last day of pre-comprehensive marks display."}, {"year": 2027, "month": 4, "day": 29, "title": "Last day for class work", "type": "Academic", "desc": "Final day of classwork for Semester II."}, {"year": 2027, "month": 5, "day": 3, "title": "Comprehensive Examination begins", "type": "Exam", "desc": "Comprehensive examinations for Semester II begin."}, {"year": 2027, "month": 5, "day": 17, "title": "Id-ul-Zuha", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 5, "day": 18, "title": "Comprehensive Examination ends", "type": "Exam", "desc": "Comprehensive examinations for Semester II conclude."}, {"year": 2027, "month": 5, "day": 18, "title": "Second Semester ends", "type": "Academic", "desc": "Semester II, AY 2026-27 officially ends."}, {"year": 2027, "month": 5, "day": 20, "title": "Buddha Purnima", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 5, "day": 20, "title": "Summer Vacation begins", "type": "Academic", "desc": "Summer vacation begins for the campus."}, {"year": 2027, "month": 5, "day": 24, "title": "Summer Term begins", "type": "Academic", "desc": "Summer term coursework begins."}, {"year": 2027, "month": 5, "day": 24, "title": "Practice School I begins", "type": "Academic", "desc": "Practice School I placements begin."}, {"year": 2027, "month": 6, "day": 16, "title": "Muharram", "type": "Holiday", "desc": "Campus holiday — no classes scheduled."}, {"year": 2027, "month": 6, "day": 19, "title": "Practice School II ends", "type": "Academic", "desc": "Practice School II placements conclude."}, {"year": 2027, "month": 7, "day": 17, "title": "Practice School I ends", "type": "Academic", "desc": "Practice School I placements conclude."}, {"year": 2027, "month": 7, "day": 18, "title": "Summer term ends", "type": "Academic", "desc": "Summer term coursework concludes."}, {"year": 2027, "month": 7, "day": 18, "title": "Summer Vacation ends", "type": "Academic", "desc": "Summer vacation ends; new academic year approaches."}];
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

function renderUpcomingEvents(){
  const list = document.getElementById("eventsList");
  if(!list) return;
  const today = new Date();
  today.setHours(0,0,0,0);

  const upcoming = EVENTS
    .map(e => ({...e, dateObj: new Date(e.year, e.month-1, e.day)}))
    .filter(e => e.dateObj >= today)
    .sort((a,b) => a.dateObj - b.dateObj)
    .slice(0, 8);

  const source = upcoming.length ? upcoming : EVENTS
    .map(e => ({...e, dateObj: new Date(e.year, e.month-1, e.day)}))
    .sort((a,b) => a.dateObj - b.dateObj)
    .slice(0, 8);

  list.innerHTML = source.map(e => (
    "<div class='event-card reveal is-visible'>" +
      "<div class='event-date'><span class='d'>" + e.day + "</span><span class='m'>" + MONTH_NAMES[e.month-1].slice(0,3) + "</span></div>" +
      "<div>" +
        "<h4>" + e.title + "</h4>" +
        "<p>" + e.desc + "</p>" +
        "<span class='event-type' data-type='" + e.type + "'>" + e.type + "</span>" +
      "</div>" +
    "</div>"
  )).join("");
}
renderUpcomingEvents();

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

/* ---------------------------------------------------
   7. FESTS PAGE — click a fest to open its detail panel
   with two switchable views: About the event / Gallery.
   Fill in real dates, times, presenters and photos below
   as they're confirmed for each fest.
   --------------------------------------------------- */
const festData = {
  atmos2024: {
    title: "ATMOS 2024",
    date: "TBA",
    time: "TBA",
    presenter: "TBA",
    description: "ACM-W ran a women-in-tech panel and a beginner hackathon track during ATMOS 2024."
  },
  techweek2024: {
    title: "Tech Week 2024",
    date: "TBA",
    time: "TBA",
    presenter: "TBA",
    description: "Chapter sessions and activities held as part of Tech Week 2024."
  },
  atmos2025: {
    title: "ATMOS 2025",
    date: "TBA",
    time: "TBA",
    presenter: "TBA",
    description: "ACM-W's panel and hackathon track during ATMOS 2025."
  },
  atmos2026: {
    title: "ATMOS 2026",
    date: "TBA",
    time: "TBA",
    presenter: "TBA",
    description: "ACM-W's panel and hackathon track during ATMOS 2026."
  }
};

const festDetailEl = document.getElementById("festDetail");
const festDetailTitleEl = document.getElementById("festDetailTitle");
const festAboutPanelEl = document.getElementById("festAboutPanel");
const festGalleryPanelEl = document.getElementById("festGalleryPanel");

function renderFestAbout(fest){
  festAboutPanelEl.innerHTML = `
    <p class="fest-about-meta"><strong>Date:</strong> ${fest.date}</p>
    <p class="fest-about-meta"><strong>Time:</strong> ${fest.time}</p>
    <p class="fest-about-meta"><strong>Presenter:</strong> ${fest.presenter}</p>
    <p>${fest.description}</p>
  `;
}

function renderFestGallery(){
  festGalleryPanelEl.innerHTML = `
    <div class="fest-gallery-grid">
      <div class="fest-gallery-placeholder">Photo coming soon</div>
      <div class="fest-gallery-placeholder">Photo coming soon</div>
      <div class="fest-gallery-placeholder">Photo coming soon</div>
    </div>
  `;
}

document.querySelectorAll(".fest-select").forEach(btn => {
  btn.addEventListener("click", () => {
    const fest = festData[btn.dataset.fest];
    if(!fest) return;
    festDetailTitleEl.textContent = fest.title;
    renderFestAbout(fest);
    renderFestGallery();
    festDetailEl.querySelectorAll(".fest-detail-tabs .pill").forEach(p => p.classList.toggle("is-active", p.dataset.view === "about"));
    festAboutPanelEl.hidden = false;
    festGalleryPanelEl.hidden = true;
    festDetailEl.hidden = false;
    requestAnimationFrame(() => festDetailEl.scrollIntoView({behavior:"smooth", block:"nearest"}));
  });
});

if(festDetailEl){
  festDetailEl.querySelectorAll(".fest-detail-tabs .pill").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      festDetailEl.querySelectorAll(".fest-detail-tabs .pill").forEach(p => p.classList.toggle("is-active", p === tabBtn));
      const view = tabBtn.dataset.view;
      festAboutPanelEl.hidden = view !== "about";
      festGalleryPanelEl.hidden = view !== "gallery";
    });
  });
}
