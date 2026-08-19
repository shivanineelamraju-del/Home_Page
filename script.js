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

   History handling: renderPage() only updates the DOM.
   showPage() additionally pushes a new history entry, so
   clicking through tabs builds real back/forward history.
   The initial page load uses replaceState (not pushState)
   so it doesn't add an extra entry — that makes "home" the
   natural floor you land on when repeatedly pressing back.
   A popstate listener re-renders the correct page whenever
   the user uses the browser's back/forward buttons.
   --------------------------------------------------- */
const pages = document.querySelectorAll(".page");
const pageLinks = document.querySelectorAll("[data-page]");

function renderPage(id, anchor){
  if(!document.getElementById("page-" + id)) id = "home";
  pages.forEach(p => p.classList.toggle("is-active", p.id === "page-" + id));
  pageLinks.forEach(a => {
    a.classList.toggle("is-active", a.dataset.page === id && !a.dataset.anchor);
  });
  window.scrollTo({top:0, behavior:"instant"});
  if(anchor){
    const el = document.getElementById(anchor);
    if(el) requestAnimationFrame(() => el.scrollIntoView({behavior:"smooth", block:"start"}));
  }
  if(id === "about") replayAboutAnimations();
}

function showPage(id, anchor){
  if(!document.getElementById("page-" + id)) id = "home";
  renderPage(id, anchor);
  history.pushState({page: id}, "", "#" + id);
}

// Fires on back/forward navigation — re-renders WITHOUT pushing a new
// history entry (that would create an infinite loop of entries).
window.addEventListener("popstate", (e) => {
  const id = (e.state && e.state.page) || location.hash.replace("#", "") || "home";
  renderPage(id);
});

/* Re-plays the fade/slide-in entrance for every animated element on the
   About page each time it's opened (rather than only the first time it
   scrolls into view), so the section animations feel alive on every visit. */
function replayAboutAnimations(){
  const aboutPage = document.getElementById("page-about");
  if(!aboutPage) return;
  const targets = aboutPage.querySelectorAll(".reveal, .page-hero .eyebrow, .page-hero-title, .page-hero-sub");
  targets.forEach(el => el.classList.remove("is-visible"));
  // force a reflow so the browser registers the class removal before we re-add it
  void aboutPage.offsetWidth;
  requestAnimationFrame(() => {
    targets.forEach(el => el.classList.add("is-visible"));
  });
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-page]");
  if(!link) return;
  e.preventDefault();
  showPage(link.dataset.page, link.dataset.anchor);
  mainNav.classList.remove("is-open");
});

window.addEventListener("DOMContentLoaded", () => {
  const hash = location.hash.replace("#", "") || "home";
  let id = "home", anchor = null;
  if(document.getElementById("page-" + hash)){
    id = hash;
  } else if(document.getElementById(hash)){
    anchor = hash;
  }
  renderPage(id, anchor);
  // replaceState (not pushState) on initial load so this doesn't create
  // an extra history entry — this page becomes the natural bottom of the stack.
  history.replaceState({page: id}, "", "#" + id);
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
   Testimonials, senate, event, domain (quicklink) and
   "more to explore" (flip) cards replay on every pass;
   everything else reveals once and stays put.
   --------------------------------------------------- */
const revealOnceTargets = document.querySelectorAll(
  ".section-title, .page-hero-title, .story-card, .fest-card, .spotlight-card, .calendar-card, .about-lede, .about, #page-about .page-hero .eyebrow, #page-about .page-hero-sub"
);
const revealReplayTargets = document.querySelectorAll(
  ".testimonial-card, .senate-card, .event-item, .quicklink-card, .flip-card"
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
   4b. EVENTS PAGE — Internal Events / Workshops / Inductions
   tab bar (styled and behaving like the fest page pills):
   clicking a tab swaps which panel is shown below it.
   --------------------------------------------------- */
const eventCategoryTabsEl = document.getElementById("eventCategoryTabs");
if(eventCategoryTabsEl){
  const eventTabButtons = eventCategoryTabsEl.querySelectorAll("[data-event-tab]");
  const eventTabPanels = document.querySelectorAll(".event-tab-panel");
  eventTabButtons.forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      eventTabButtons.forEach(b => b.classList.toggle("is-active", b === tabBtn));
      eventTabPanels.forEach(p => { p.hidden = p.dataset.panel !== tabBtn.dataset.eventTab; });
    });
  });
}

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
    {src:"gallery-images/atmos2024-5.jpg", alt:"ACM-W team at Hackathon '24, ATMOS"},
    {src:"gallery-images/atmos2024-6.jpg", alt:"'ACM-W Hackathon' written on the chalkboard as a member gives instructions"},
    {src:"gallery-images/atmos2024-7.jpg", alt:"Participants coding on laptops during the ATMOS 2024 hackathon"},
    {src:"gallery-images/atmos2024-8.jpg", alt:"Participants and organizers milling about the hackathon room"},
    {src:"gallery-images/atmos2024-9.jpg", alt:"ACM-W and IEEE members posing together at ATMOS 2024"}
  ]
};

const AUTOPLAY_DELAY_MS = 4500;
const TESTIMONIAL_AUTOPLAY_DELAY_MS = 9000; // slower pace for reading longer quotes

function buildImageSlider(container, images){
  if(!container || !images || !images.length) return;
  // clear any autoplay timer left over from a previous render of this container
  // (e.g. switching between fests re-fills the same gallery slot)
  if(container._autoplayTimer) clearInterval(container._autoplayTimer);

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
  if(prevBtn) prevBtn.addEventListener("click", () => { goTo(idx - 1); restartAutoplay(); });
  if(nextBtn) nextBtn.addEventListener("click", () => { goTo(idx + 1); restartAutoplay(); });
  dots.forEach(d => d.addEventListener("click", () => { goTo(Number(d.dataset.idx)); restartAutoplay(); }));

  // auto-advance on a timer; pause while the user is hovering/focused on
  // the gallery so it doesn't move while they're looking at a photo
  function startAutoplay(){
    if(images.length < 2) return;
    container._autoplayTimer = setInterval(() => goTo(idx + 1), AUTOPLAY_DELAY_MS);
  }
  function stopAutoplay(){
    if(container._autoplayTimer){ clearInterval(container._autoplayTimer); container._autoplayTimer = null; }
  }
  function restartAutoplay(){
    stopAutoplay();
    startAutoplay();
  }
  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);
  container.addEventListener("focusin", stopAutoplay);
  container.addEventListener("focusout", startAutoplay);
  startAutoplay();
}

buildImageSlider(document.getElementById("galleryAppDev"), galleryData.appdev);
buildImageSlider(document.getElementById("galleryCodeflix"), galleryData.codeflix);

/* ---------- Testimonials slider ---------- */
const testimonialData = [
  {
    quote: "ACM-W is an awesome community of women in tech who have a great vision! It gave me a platform to build my skills mainly in UI/UX domain! I'm extremely grateful for this club! Thank you!",
    initials: "LA",
    name: "Lavanya Agarwal",
    role: "Member"
  },
  {
    quote: "ACM-W helped me find a community of like-minded peeps with respect to contests and discussions. It gave me enough backing to kickstart on my own.",
    initials: "SG",
    name: "Sruti Guduru",
    role: "ML Mentor (26-27)"
  },
  {
    quote: "Being a part of the ACM-W was a really memorable experience. When I first joined as a beginner, the weekly guidance and support from my mentors made it easy to learn a lot and comfortably build my skills. Over time, that supportive community gave me the confidence to grow into the role of UI/UX mentor and Vice President. Serving as a mentor allowed me to help peers build practical design skills, while my time in leadership focused on overseeing chapter initiatives, coordinating domain efforts, and strategically improving the club's tech culture. ACM-W is a great network that guides you from the structured mentorship when you are starting out and helps you develop real leadership skills as you grow.",
    initials: "SV",
    name: "Saanvi Varma",
    role: "Vice President (25-26)"
  },
  {
    quote: "From being a mentee to becoming a mentor, my journey with ACM-W has been an amazing experience. It was my first tech club, and it played a huge role in helping me explore different areas of technology and discover what I truly enjoy.",
    initials: "PR",
    name: "Pavithra Ramesh",
    role: "ML Mentor (24-25)"
  }
];

function buildTestimonialSlider(container, testimonials){
  if(!container || !testimonials || !testimonials.length) return;
  if(container._autoplayTimer) clearInterval(container._autoplayTimer);

  let idx = 0;
  container.innerHTML = `
    <div class="testimonial-slider-viewport">
      <div class="testimonial-slider-track">
        ${testimonials.map(t => `
          <div class="testimonial-slide">
            <div class="testimonial-card">
              <p class="testimonial-quote">"${t.quote}"</p>
              <div class="testimonial-person">
                <span class="avatar">${t.initials}</span>
                <div><strong>${t.name}</strong><span>${t.role}</span></div>
              </div>
            </div>
          </div>`).join("")}
      </div>
    </div>
    ${testimonials.length > 1 ? `
    <button class="img-slider-btn prev" type="button" aria-label="Previous testimonial">‹</button>
    <button class="img-slider-btn next" type="button" aria-label="Next testimonial">›</button>
    <div class="img-slider-dots">
      ${testimonials.map((_, i) => `<button class="img-slider-dot${i === 0 ? " is-active" : ""}" type="button" data-idx="${i}" aria-label="Go to testimonial ${i + 1}"></button>`).join("")}
    </div>` : ""}
  `;
  const track = container.querySelector(".testimonial-slider-track");
  const dots = container.querySelectorAll(".img-slider-dot");
  function goTo(i){
    idx = (i + testimonials.length) % testimonials.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("is-active", di === idx));
  }

  function startAutoplay(){
     if(testimonials.length < 2) return;
     container._autoplayTimer = setInterval(() => goTo(idx + 1), TESTIMONIAL_AUTOPLAY_DELAY_MS);
   }
  function stopAutoplay(){
    if(container._autoplayTimer){ clearInterval(container._autoplayTimer); container._autoplayTimer = null; }
  }
  function restartAutoplay(){
    //stopAutoplay();
    startAutoplay();
  }

  const prevBtn = container.querySelector(".img-slider-btn.prev");
  const nextBtn = container.querySelector(".img-slider-btn.next");
  if(prevBtn) prevBtn.addEventListener("click", () => { goTo(idx - 1); restartAutoplay(); });
  if(nextBtn) nextBtn.addEventListener("click", () => { goTo(idx + 1); restartAutoplay(); });
  dots.forEach(d => d.addEventListener("click", () => { goTo(Number(d.dataset.idx)); restartAutoplay(); }));

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);
  container.addEventListener("focusin", stopAutoplay);
  container.addEventListener("focusout", startAutoplay);
  startAutoplay();
}

buildTestimonialSlider(document.getElementById("testimonialSlider"), testimonialData);

/* ---------------------------------------------------
   7. FESTS PAGE — click a fest to open its detail panel
   with two switchable views: About the event / Gallery.
   Fill in real dates, times, presenters and photos below
   as they're confirmed for each fest.
   --------------------------------------------------- */
const festData = {
  atmos2024: {
    title: "ATMOS 2024",
    description: "The first ever Hackathon organized by the chapter! We were thrilled by the active and enthusiastic participation we received. The lineup kicked off with an ACM-W Bingo icebreaker to get everyone mingling, followed by a full-fledged Hackathon where teams brainstormed, built, and pitched their ideas — all part of a packed slate of events that made ATMOS 2024 one to remember."
  },
  techweek2024: {
    title: "Tech Week 2024",
    description: "Details coming soon."
  },
  atmos2025: {
    title: "ATMOS 2025",
    description: "Details coming soon."
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
  const metaRows = [
    fest.date ? `<p class="fest-about-meta"><strong>Date:</strong> ${fest.date}</p>` : "",
    fest.time ? `<p class="fest-about-meta"><strong>Time:</strong> ${fest.time}</p>` : "",
    fest.presenter ? `<p class="fest-about-meta"><strong>Presenter:</strong> ${fest.presenter}</p>` : ""
  ].join("");
  festAboutPanelEl.innerHTML = `
    ${metaRows}
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
