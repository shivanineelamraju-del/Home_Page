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
  ".testimonial-card, .senate-card, .event-item"
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
const EVENTS = [
  {"year": 2026, "month": 10, "day": 23, "title": "ATMOS 2026", "type": "Fest", "desc": "Chapter's technical fest — October 23–25, classwork suspended."},
  {"tba": true, "title": "RAF Orientation", "type": "Event", "desc": "Second/Third week of August — TBA"},
  {"tba": true, "title": "Codeflix", "type": "Event", "desc": "TBA"}
];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let calYear = 2026, calMonth = 10; // 1-indexed month to match EVENTS data

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

  const dated = EVENTS
    .filter(e => !e.tba)
    .map(e => ({...e, dateObj: new Date(e.year, e.month-1, e.day)}))
    .filter(e => e.dateObj >= today)
    .sort((a,b) => a.dateObj - b.dateObj);

  const tba = EVENTS.filter(e => e.tba);

  const source = [...dated, ...tba];

  list.innerHTML = source.map(e => (
    "<div class='event-card reveal is-visible'>" +
      "<div class='event-date'>" + (e.tba
        ? "<span class='d'>TBA</span>"
        : "<span class='d'>" + e.day + "</span><span class='m'>" + MONTH_NAMES[e.month-1].slice(0,3) + "</span>") +
      "</div>" +
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
   6b. SLIDING IMAGE GALLERIES
   One small builder function reused for the Events page
   galleries (App Dev Workshop, Codeflix) and for any fest
   that has real photos (see galleryData + renderFestGallery
   below). Pass it a container element and an array of
   {src, alt} objects.
   --------------------------------------------------- */
const galleryData = {
  appdev: [
    {src:"gallery-images/appdev-1.jpg", alt:"App Dev Workshop poster — 10th Feb, F-109"},
    {src:"gallery-images/appdev-2.jpg", alt:"App Dev Workshop 2026 — members coding along in a workshop room"},
    {src:"gallery-images/appdev-3.jpg", alt:"App Dev Workshop — Flutter session projected on screen"}
  ],
  codeflix: [
    {src:"gallery-images/codeflix-1.jpg", alt:"Codeflix — a movie playing on the projector while members code"},
    {src:"gallery-images/codeflix-2.jpg", alt:"Codeflix '24 — members coding alongside a film screening"},
    {src:"gallery-images/codeflix-3.jpg", alt:"Codeflix '26 — Tangled playing during a coding session"}
  ],
  atmos2024: [
    {src:"gallery-images/atmos2024-1.jpg", alt:"Pre-ATMOS hackathon workshop with alumni, held over a video call"},
    {src:"gallery-images/atmos2024-2.jpg", alt:"Hackathon '24 in progress, room J219"},
    {src:"gallery-images/atmos2024-3.jpg", alt:"Hackathon '24 in progress, room J220"},
    {src:"gallery-images/atmos2024-4.jpg", alt:"ACM-W Bingo icebreaker activity at ATMOS 2024"},
    {src:"gallery-images/atmos2024-5.jpg", alt:"ACM-W team at Hackathon '24, ATMOS"}
  ]
};

function buildImageSlider(container, images){
  if(!container || !images || !images.length) return;
  let idx = 0;
  container.innerHTML = `
    <div class="img-slider-viewport">
      <div class="img-slider-track">
        ${images.map(im => `<div class="img-slide"><img src="${im.src}" alt="${im.alt}" loading="lazy"></div>`).join("")}
      </div>
    </div>
    ${images.length > 1 ? `
    <button class="img-slider-btn prev" type="button" aria-label="Previous photo">‹</button>
    <button class="img-slider-btn next" type="button" aria-label="Next photo">›</button>
    <div class="img-slider-dots">
      ${images.map((_, i) => `<button class="img-slider-dot${i === 0 ? " is-active" : ""}" type="button" data-idx="${i}" aria-label="Go to photo ${i + 1}"></button>`).join("")}
    </div>` : ""}
  `;
  const track = container.querySelector(".img-slider-track");
  const dots = container.querySelectorAll(".img-slider-dot");
  function goTo(i){
    idx = (i + images.length) % images.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("is-active", di === idx));
  }
  const prevBtn = container.querySelector(".img-slider-btn.prev");
  const nextBtn = container.querySelector(".img-slider-btn.next");
  if(prevBtn) prevBtn.addEventListener("click", () => goTo(idx - 1));
  if(nextBtn) nextBtn.addEventListener("click", () => goTo(idx + 1));
  dots.forEach(d => d.addEventListener("click", () => goTo(Number(d.dataset.idx))));
}

buildImageSlider(document.getElementById("galleryAppDev"), galleryData.appdev);
buildImageSlider(document.getElementById("galleryCodeflix"), galleryData.codeflix);

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

function renderFestGallery(festKey){
  const images = galleryData[festKey];
  if(images && images.length){
    festGalleryPanelEl.innerHTML = `<div class="img-slider" id="festImgSlider"></div>`;
    buildImageSlider(document.getElementById("festImgSlider"), images);
  } else {
    festGalleryPanelEl.innerHTML = `
      <div class="fest-gallery-grid">
        <div class="fest-gallery-placeholder">Photo coming soon</div>
        <div class="fest-gallery-placeholder">Photo coming soon</div>
        <div class="fest-gallery-placeholder">Photo coming soon</div>
      </div>
    `;
  }
}

document.querySelectorAll(".fest-select").forEach(btn => {
  btn.addEventListener("click", () => {
    const fest = festData[btn.dataset.fest];
    if(!fest) return;
    festDetailTitleEl.textContent = fest.title;
    renderFestAbout(fest);
    renderFestGallery(btn.dataset.fest);
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
