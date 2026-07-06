/* =====================================================
   ACM-W BPHC — site data + behaviour
   Everything you'd want to edit by hand lives in the
   DATA section below. Testimonials & Senate are also
   editable live on the page (see "Edit mode" in the nav)
   and are saved in the browser's localStorage.
   ===================================================== */

/* ---------------------------------------------------
   1. DATA — edit these to update the site content
   --------------------------------------------------- */

// Each domain: bulletin (announcements), tasks (open work), progress (initiatives)
const DOMAINS = [
  {
    id: "technical",
    name: "Technical",
    blurb: "Workshops, project squads, open-source sprints and the tech behind chapter tools.",
    bulletin: [
      { tag: "Workshop", date: "12 Jul", title: "Intro to Git & GitHub", body: "Beginner-friendly session for first-years, Library Seminar Hall, 6 PM." },
      { tag: "Recruitment", date: "08 Jul", title: "Technical domain interviews start", body: "Shortlisted applicants will be contacted by Thursday." },
      { tag: "Update", date: "01 Jul", title: "Chapter website repo is live", body: "PRs open — ping the domain lead for access." }
    ],
    tasks: [
      { status: "doing", title: "Build event RSVP micro-site", owner: "Ananya · Riya", due: "18 Jul" },
      { status: "todo", title: "Set up GitHub org for chapter projects", owner: "Tanvi", due: "20 Jul" },
      { status: "done", title: "Migrate resource drive to shared folder", owner: "Sneha", due: "30 Jun" }
    ],
    progress: [
      { label: "Mentorship-matching tool (v2)", pct: 70 },
      { label: "Workshop track for AY 26-27", pct: 40 }
    ]
  },
  {
    id: "corporate",
    name: "Corporate & Sponsorship",
    blurb: "Partnerships, sponsorships and industry connects that fund and power our events.",
    bulletin: [
      { tag: "Outreach", date: "10 Jul", title: "Sponsorship deck v3 sent to 6 companies", body: "Follow-ups scheduled for next week." },
      { tag: "Meeting", date: "05 Jul", title: "Call with potential workshop partner", body: "Notes shared in the domain channel." }
    ],
    tasks: [
      { status: "doing", title: "Finalise fest title-sponsor pitch", owner: "Meghna", due: "15 Jul" },
      { status: "todo", title: "Draft MOU template for partners", owner: "Ishita", due: "22 Jul" }
    ],
    progress: [
      { label: "AY 26-27 sponsorship target", pct: 35 }
    ]
  },
  {
    id: "design",
    name: "Design",
    blurb: "Visual identity, event collateral, posters, merchandise and everything on-brand.",
    bulletin: [
      { tag: "Deadline", date: "14 Jul", title: "Poster drafts due for July workshop", body: "Submit to the design drive by EOD." },
      { tag: "Update", date: "02 Jul", title: "New chapter brand kit shared", body: "Fonts, colours and logo files now in the shared drive." }
    ],
    tasks: [
      { status: "todo", title: "Design certificate template", owner: "Aarohi", due: "16 Jul" },
      { status: "doing", title: "Instagram highlight covers refresh", owner: "Diya", due: "12 Jul" }
    ],
    progress: [
      { label: "Fest visual identity", pct: 55 },
      { label: "Merch design round 1", pct: 20 }
    ]
  },
  {
    id: "content",
    name: "Content & Media",
    blurb: "Copywriting, photography, reels and the chapter's blog & newsletter.",
    bulletin: [
      { tag: "Blog", date: "09 Jul", title: "New blog post: 'Why representation in code reviews matters'", body: "Live on the Projects & Blogs tab." },
      { tag: "Task", date: "03 Jul", title: "Recap reel for June workshop posted", body: "1.2k views in the first day." }
    ],
    tasks: [
      { status: "doing", title: "Write senate spotlight series", owner: "Kavya", due: "19 Jul" },
      { status: "todo", title: "Newsletter #4 draft", owner: "Priyal", due: "25 Jul" }
    ],
    progress: [
      { label: "Monthly newsletter cadence", pct: 60 }
    ]
  },
  {
    id: "outreach",
    name: "Marketing & Outreach",
    blurb: "Growing the community — social media, campus outreach and inter-college relations.",
    bulletin: [
      { tag: "Campaign", date: "11 Jul", title: "Recruitment drive posters up around campus", body: "QR codes lead to the interest form." },
      { tag: "Collab", date: "04 Jul", title: "Cross-posting with other BPHC clubs confirmed", body: "For the August joint session." }
    ],
    tasks: [
      { status: "todo", title: "Reach out to school ACM-W chapters for collab", owner: "Simran", due: "21 Jul" },
      { status: "doing", title: "Freshers' outreach plan", owner: "Naina", due: "17 Jul" }
    ],
    progress: [
      { label: "Freshers recruitment funnel", pct: 45 }
    ]
  },
  {
    id: "management",
    name: "Management & Events",
    blurb: "Logistics, budgets, venue bookings and making sure every event actually happens.",
    bulletin: [
      { tag: "Logistics", date: "13 Jul", title: "Venue confirmed for July workshop", body: "Seminar Hall booked, 6–8 PM." },
      { tag: "Finance", date: "06 Jul", title: "Q1 budget review complete", body: "Summary shared with senate." }
    ],
    tasks: [
      { status: "done", title: "Book auditorium for August talk", owner: "Vidhi", due: "28 Jun" },
      { status: "doing", title: "Volunteer roster for fest week", owner: "Rhea", due: "23 Jul" }
    ],
    progress: [
      { label: "Fest logistics plan", pct: 50 }
    ]
  }
];

// Events shown in the calendar + upcoming list. Month/day are 1-indexed, year is full year.
const EVENTS = [
  { year: 2026, month: 7, day: 8, title: "Technical domain interviews", type: "Recruitment", desc: "Shortlisted applicants interview slots, Room 204." },
  { year: 2026, month: 7, day: 12, title: "Intro to Git & GitHub workshop", type: "Workshop", desc: "Beginner session, Library Seminar Hall, 6 PM." },
  { year: 2026, month: 7, day: 14, title: "Poster drafts submission", type: "Deadline", desc: "Design domain — submit to shared drive by EOD." },
  { year: 2026, month: 7, day: 20, title: "Senate open forum", type: "Meeting", desc: "Open Q&A with the current senate, all members welcome." },
  { year: 2026, month: 7, day: 27, title: "Mentorship circle kickoff", type: "Community", desc: "First mentorship pairing session of the semester." },
  { year: 2026, month: 8, day: 3, title: "Freshers' meet & greet", type: "Community", desc: "Open house for incoming first-years." }
];

// Fests the chapter participates in / hosts
const FESTS = [
  { name: "APOGEE", meta: "Technical fest · BPHC", desc: "ACM-W runs a women-in-tech panel and a beginner hackathon track during APOGEE every year." },
  { name: "Inter-chapter Summit", meta: "Annual · multi-campus", desc: "A joint summit with ACM-W chapters from other BITS campuses — talks, workshops and networking." },
  { name: "Waves", meta: "Cultural fest · BPHC", desc: "Chapter booth with interactive coding-for-everyone activities and merch." }
];

// Past projects, blogs and articles
const PROJECTS = [
  { tag: "Project", title: "Mentorship Matching Tool", desc: "An internal tool pairing new members with senior mentors based on interests and branch.", link: "#" },
  { tag: "Blog", title: "Why representation in code reviews matters", desc: "A member reflects on culture-building in engineering teams.", link: "#" },
  { tag: "Project", title: "Workshop Signup Bot", desc: "A lightweight bot automating RSVP and reminders for chapter workshops.", link: "#" },
  { tag: "Article", title: "Notes from the Inter-chapter Summit 2025", desc: "Highlights and takeaways from last year's multi-campus summit.", link: "#" },
  { tag: "Blog", title: "A beginner's guide to open source", desc: "Where to start contributing, written by our Technical domain.", link: "#" },
  { tag: "Project", title: "Chapter Resource Hub", desc: "A single shared drive structure for all domain resources — now used chapter-wide.", link: "#" }
];

// Default testimonials & senate — used only if nothing is saved in localStorage yet
const DEFAULT_TESTIMONIALS = [
  { name: "Ritika Sharma", role: "Final year, CS", quote: "ACM-W is where I found my first real mentor on campus — and later became one myself." },
  { name: "Fatima Noor", role: "Sophomore, ENI", quote: "I walked into my first workshop knowing nothing about Git. A year later I was running one." },
  { name: "Ananya Rao", role: "Alumna, now at a product company", quote: "The mentorship circles here shaped how I think about building teams, not just code." }
];
const DEFAULT_SENATE = [
  { name: "Priya Menon", role: "Chairperson", domain: "Overall chapter" },
  { name: "Sana Kapoor", role: "Vice Chairperson", domain: "Overall chapter" },
  { name: "Meghna Iyer", role: "Domain Lead", domain: "Corporate & Sponsorship" },
  { name: "Aarohi Bhatt", role: "Domain Lead", domain: "Design" },
  { name: "Kavya Reddy", role: "Domain Lead", domain: "Content & Media" },
  { name: "Simran Kaur", role: "Domain Lead", domain: "Marketing & Outreach" },
  { name: "Vidhi Jain", role: "Domain Lead", domain: "Management & Events" },
  { name: "Tanvi Deshpande", role: "Domain Lead", domain: "Technical" }
];

/* ---------------------------------------------------
   2. STORAGE HELPERS
   --------------------------------------------------- */
function loadList(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return [...fallback];
    return JSON.parse(raw);
  }catch(e){ return [...fallback]; }
}
function saveList(key, list){
  try{ localStorage.setItem(key, JSON.stringify(list)); }catch(e){ /* storage unavailable */ }
}

let testimonials = loadList("acmw_testimonials", DEFAULT_TESTIMONIALS);
let senate = loadList("acmw_senate", DEFAULT_SENATE);

/* ---------------------------------------------------
   3. NAV — mobile toggle, dropdown, edit mode
   --------------------------------------------------- */
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
});

const domainsBtn = document.getElementById("domainsBtn");
const domainsPanel = document.getElementById("domainsPanel");
domainsPanel.innerHTML = DOMAINS.map(d =>
  `<a href="#domains" data-domain="${d.id}"><strong>${d.name}</strong><span>${d.blurb}</span></a>`
).join("");
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
domainsPanel.addEventListener("click", (e) => {
  const link = e.target.closest("a[data-domain]");
  if(link){ selectDomain(link.dataset.domain); mainNav.classList.remove("is-open"); }
});

const editModeToggle = document.getElementById("editModeToggle");
editModeToggle.addEventListener("click", () => {
  const on = document.body.classList.toggle("edit-mode");
  editModeToggle.classList.toggle("is-on", on);
  editModeToggle.textContent = on ? "Editing…" : "Edit mode";
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------------------------------------------------
   4. DOMAINS — tabs, subtabs, render
   --------------------------------------------------- */
const domainTabsEl = document.getElementById("domainTabs");
domainTabsEl.innerHTML = DOMAINS.map((d,i) =>
  `<button class="domain-tab ${i===0?'is-active':''}" data-domain="${d.id}">${d.name}</button>`
).join("");

let activeDomain = DOMAINS[0].id;

function selectDomain(id){
  activeDomain = id;
  document.querySelectorAll(".domain-tab").forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.domain === id);
  });
  renderDomainPanel();
  document.getElementById("domains").scrollIntoView({ behavior: "smooth", block: "start" });
}

domainTabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".domain-tab");
  if(btn) selectDomain(btn.dataset.domain);
});

let activeSubtab = "bulletin";
document.getElementById("domainSubtabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".subtab");
  if(!btn) return;
  activeSubtab = btn.dataset.sub;
  document.querySelectorAll(".subtab").forEach(b => b.classList.toggle("is-active", b === btn));
  document.querySelectorAll(".subpanel").forEach(p => {
    p.hidden = p.dataset.subpanel !== activeSubtab;
  });
});

function renderDomainPanel(){
  const d = DOMAINS.find(x => x.id === activeDomain);
  document.getElementById("domainPanelTitle").textContent = d.name;
  document.getElementById("domainPanelDesc").textContent = d.blurb;

  document.getElementById("panelBulletin").innerHTML = d.bulletin.map(b => `
    <div class="bulletin-item">
      <span class="bulletin-tag">${b.tag}</span>
      <div>
        <time>${b.date}</time>
        <h4>${b.title}</h4>
        <p>${b.body}</p>
      </div>
    </div>`).join("");

  document.getElementById("panelTasks").innerHTML = d.tasks.map(t => `
    <div class="task-row">
      <span class="task-status ${t.status}" title="${t.status}"></span>
      <span>${t.title}</span>
      <span class="task-owner">${t.owner}</span>
      <span class="task-due">${t.due}</span>
    </div>`).join("");

  document.getElementById("panelProgress").innerHTML = d.progress.map(p => `
    <div class="progress-item">
      <div class="progress-top"><strong>${p.label}</strong><span>${p.pct}%</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${p.pct}%"></div></div>
    </div>`).join("");
}
renderDomainPanel();

/* ---------------------------------------------------
   5. EVENTS — calendar + upcoming list
   --------------------------------------------------- */
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
let calYear = 2026, calMonth = 7; // 1-indexed month to match EVENTS data

function eventsOn(year, month, day){
  return EVENTS.filter(e => e.year === year && e.month === month && e.day === day);
}

function renderCalendar(){
  document.getElementById("calMonthLabel").textContent = `${MONTH_NAMES[calMonth-1]} ${calYear}`;
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
  box.innerHTML = `<strong>${MONTH_NAMES[calMonth-1]} ${day}, ${calYear}</strong>` +
    list.map(e => `<p style="margin-top:8px;"><strong>${e.title}</strong><br>${e.desc}</p>`).join("");
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

function renderEventsList(){
  const upcoming = [...EVENTS].sort((a,b) => new Date(a.year,a.month-1,a.day) - new Date(b.year,b.month-1,b.day));
  document.getElementById("eventsList").innerHTML = upcoming.map(e => `
    <div class="event-card">
      <div class="event-date"><span class="d">${e.day}</span><span class="m">${MONTH_NAMES[e.month-1].slice(0,3)}</span></div>
      <div>
        <h4>${e.title}</h4>
        <p>${e.desc}</p>
        <span class="event-type">${e.type}</span>
      </div>
    </div>`).join("");
}
renderEventsList();

/* ---------------------------------------------------
   6. FESTS
   --------------------------------------------------- */
document.getElementById("festsGrid").innerHTML = FESTS.map(f => `
  <div class="fest-card">
    <h3>${f.name}</h3>
    <p>${f.desc}</p>
    <span class="fest-meta">${f.meta}</span>
  </div>`).join("");

/* ---------------------------------------------------
   7. PROJECTS & BLOGS — with tag filter
   --------------------------------------------------- */
const tags = ["All", ...new Set(PROJECTS.map(p => p.tag))];
document.getElementById("projectFilters").innerHTML = tags.map((t,i) =>
  `<button class="filter-chip ${i===0?'is-active':''}" data-tag="${t}">${t}</button>`).join("");

function renderProjects(filter){
  const list = filter === "All" ? PROJECTS : PROJECTS.filter(p => p.tag === filter);
  document.getElementById("projectsGrid").innerHTML = list.map(p => `
    <div class="project-card">
      <span class="project-tag">${p.tag}</span>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
      <a href="${p.link}">Read more →</a>
    </div>`).join("");
}
renderProjects("All");

document.getElementById("projectFilters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-chip");
  if(!btn) return;
  document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("is-active", b===btn));
  renderProjects(btn.dataset.tag);
});

/* ---------------------------------------------------
   8. MODAL helper
   --------------------------------------------------- */
const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => { if(e.target === modalOverlay) closeModal(); });
function openModal(html){ modalBody.innerHTML = html; modalOverlay.hidden = false; }
function closeModal(){ modalOverlay.hidden = true; modalBody.innerHTML = ""; }

/* ---------------------------------------------------
   9. TESTIMONIALS — render + CRUD
   --------------------------------------------------- */
function initials(name){
  return name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
}

function renderTestimonials(){
  document.getElementById("testimonialsTrack").innerHTML = testimonials.map((t, i) => `
    <div class="testimonial-card">
      <div class="card-edit-controls">
        <button class="icon-btn" data-edit-t="${i}" title="Edit">✎</button>
        <button class="icon-btn" data-del-t="${i}" title="Delete">🗑</button>
      </div>
      <p class="testimonial-quote">"${t.quote}"</p>
      <div class="testimonial-person">
        <span class="avatar">${initials(t.name)}</span>
        <div><strong>${t.name}</strong><span>${t.role}</span></div>
      </div>
    </div>`).join("");
}
renderTestimonials();

function testimonialForm(existing, index){
  const isEdit = existing !== undefined;
  openModal(`
    <h3>${isEdit ? "Edit testimonial" : "Add a testimonial"}</h3>
    <form id="tForm">
      <div class="field"><label>Name</label><input required name="name" value="${isEdit ? existing.name : ""}"></div>
      <div class="field"><label>Role / year</label><input required name="role" placeholder="e.g. Third year, CS" value="${isEdit ? existing.role : ""}"></div>
      <div class="field"><label>Quote</label><textarea required name="quote">${isEdit ? existing.quote : ""}</textarea></div>
      <div class="modal-actions">
        <button type="submit" class="btn btn--primary">${isEdit ? "Save changes" : "Add testimonial"}</button>
        ${isEdit ? `<button type="button" class="btn btn--danger" id="tDelete">Delete</button>` : ""}
      </div>
    </form>
  `);
  document.getElementById("tForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const entry = { name: fd.get("name").trim(), role: fd.get("role").trim(), quote: fd.get("quote").trim() };
    if(isEdit) testimonials[index] = entry; else testimonials.push(entry);
    saveList("acmw_testimonials", testimonials);
    renderTestimonials();
    closeModal();
  });
  if(isEdit){
    document.getElementById("tDelete").addEventListener("click", () => {
      testimonials.splice(index,1);
      saveList("acmw_testimonials", testimonials);
      renderTestimonials();
      closeModal();
    });
  }
}

document.getElementById("addTestimonialBtn").addEventListener("click", () => testimonialForm());
document.getElementById("testimonialsTrack").addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit-t]");
  const delBtn = e.target.closest("[data-del-t]");
  if(editBtn) testimonialForm(testimonials[editBtn.dataset.editT], Number(editBtn.dataset.editT));
  if(delBtn){
    testimonials.splice(Number(delBtn.dataset.delT),1);
    saveList("acmw_testimonials", testimonials);
    renderTestimonials();
  }
});

/* ---------------------------------------------------
   10. SENATE — render + CRUD
   --------------------------------------------------- */
function renderSenate(){
  document.getElementById("senateGrid").innerHTML = senate.map((m, i) => `
    <div class="senate-card">
      <div class="card-edit-controls">
        <button class="icon-btn" data-edit-s="${i}" title="Edit">✎</button>
        <button class="icon-btn" data-del-s="${i}" title="Delete">🗑</button>
      </div>
      <div class="senate-avatar">${initials(m.name)}</div>
      <h4>${m.name}</h4>
      <span class="senate-role">${m.role}</span>
      <p class="senate-domain">${m.domain}</p>
    </div>`).join("");
}
renderSenate();

function senateForm(existing, index){
  const isEdit = existing !== undefined;
  openModal(`
    <h3>${isEdit ? "Edit senate member" : "Add senate member"}</h3>
    <form id="sForm">
      <div class="field"><label>Name</label><input required name="name" value="${isEdit ? existing.name : ""}"></div>
      <div class="field"><label>Role</label><input required name="role" placeholder="e.g. Domain Lead" value="${isEdit ? existing.role : ""}"></div>
      <div class="field"><label>Domain / focus</label><input required name="domain" placeholder="e.g. Technical" value="${isEdit ? existing.domain : ""}"></div>
      <div class="modal-actions">
        <button type="submit" class="btn btn--primary">${isEdit ? "Save changes" : "Add member"}</button>
        ${isEdit ? `<button type="button" class="btn btn--danger" id="sDelete">Delete</button>` : ""}
      </div>
    </form>
  `);
  document.getElementById("sForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const entry = { name: fd.get("name").trim(), role: fd.get("role").trim(), domain: fd.get("domain").trim() };
    if(isEdit) senate[index] = entry; else senate.push(entry);
    saveList("acmw_senate", senate);
    renderSenate();
    closeModal();
  });
  if(isEdit){
    document.getElementById("sDelete").addEventListener("click", () => {
      senate.splice(index,1);
      saveList("acmw_senate", senate);
      renderSenate();
      closeModal();
    });
  }
}

document.getElementById("addSenateBtn").addEventListener("click", () => senateForm());
document.getElementById("senateGrid").addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit-s]");
  const delBtn = e.target.closest("[data-del-s]");
  if(editBtn) senateForm(senate[editBtn.dataset.editS], Number(editBtn.dataset.editS));
  if(delBtn){
    senate.splice(Number(delBtn.dataset.delS),1);
    saveList("acmw_senate", senate);
    renderSenate();
  }
});
