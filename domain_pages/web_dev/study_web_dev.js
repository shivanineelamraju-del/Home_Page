/* =====================================================
   ACM-W BPHC — study_web_dev.html content loader
   Reads ?topic=<slug> from the URL and fills in the
   template with that topic's title + (placeholder)
   study material. Add new topics to TOPICS below as
   more resource cards are added to the Web Dev page.
   ===================================================== */

const TOPICS = {
  "html-css-basics": {
    domainLabel: "Web Dev",
    domainHref: "web_dev.html",
    title: "HTML & CSS Basics",
    intro: "Semantic markup, the box model, and styling a page from scratch.",
  },
  "javascript-dom": {
    domainLabel: "Web Dev",
    domainHref: "web_dev.html",
    title: "JavaScript & the DOM",
    intro: "Making a page interactive — events, DOM manipulation, and basic state.",
  },
  "responsive-design": {
    domainLabel: "Web Dev",
    domainHref: "web_dev.html",
    title: "Responsive Design",
    intro: "Flexbox, grid, and media queries — making a site work on every screen size.",
  },
  "forms-apis": {
    domainLabel: "Web Dev",
    domainHref: "web_dev.html",
    title: "Forms & APIs",
    intro: "Handling form submissions and talking to a backend or third-party API.",
  },
  "git-deployment": {
    domainLabel: "Web Dev",
    domainHref: "web_dev.html",
    title: "Git & Deployment",
    intro: "Version control basics and shipping a site with GitHub Pages.",
  },
};

const LOREM_SECTIONS = [
  {
    heading: "Overview",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    heading: "Key Concepts",
    body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
  },
  {
    heading: "Worked Example",
    body: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
  },
  {
    heading: "Practice",
    body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet."
  },
];

function renderTopic(slug){
  const topic = TOPICS[slug];
  const titleEl = document.getElementById("topicTitle");
  const introEl = document.getElementById("topicIntro");
  const contentEl = document.getElementById("topicContent");
  const backEl = document.getElementById("backToDomain");

  if(!topic){
    document.title = "Topic not found · ACM-W BPHC";
    titleEl.textContent = "Topic not found";
    introEl.textContent = "We couldn't find study material for this topic. Head back and pick one from the Resources section.";
    contentEl.innerHTML = "";
    backEl.textContent = "← Back to home";
    backEl.href = "index.html#home";
    return;
  }

  document.title = topic.title + " · ACM-W BPHC";
  titleEl.textContent = topic.title;
  introEl.textContent = topic.intro;
  backEl.textContent = "← Back to " + topic.domainLabel;
  backEl.href = topic.domainHref;

  contentEl.innerHTML = LOREM_SECTIONS.map(section =>
    `<h2>${section.heading}</h2><p>${section.body}</p>`
  ).join("");
}

const params = new URLSearchParams(window.location.search);
renderTopic(params.get("topic"));
