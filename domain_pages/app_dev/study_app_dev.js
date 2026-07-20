/* =====================================================
   ACM-W BPHC — study_app_dev.html content loader
   Reads ?topic=<slug> from the URL and fills in the
   template with that topic's title + (placeholder)
   study material. Add new topics to TOPICS below as
   more resource cards are added to the App Dev page.
   ===================================================== */

const TOPICS = {
  "cross-platform-basics": {
    domainLabel: "App Dev",
    domainHref: "app_dev.html",
    title: "Cross-Platform Basics",
    intro: "Getting set up with Flutter, widgets, and the basic structure of a mobile app.",
  },
  "app-ui-navigation": {
    domainLabel: "App Dev",
    domainHref: "app_dev.html",
    title: "App UI & Navigation",
    intro: "Screens, routing, and navigation patterns that feel natural on a phone.",
  },
  "state-management": {
    domainLabel: "App Dev",
    domainHref: "app_dev.html",
    title: "State Management",
    intro: "Keeping an app's data in sync across screens without things breaking.",
  },
  "apis-firebase": {
    domainLabel: "App Dev",
    domainHref: "app_dev.html",
    title: "APIs & Firebase",
    intro: "Connecting an app to a backend — auth, a database, and live data.",
  },
  "testing-deployment": {
    domainLabel: "App Dev",
    domainHref: "app_dev.html",
    title: "Testing & Deployment",
    intro: "Testing on real devices and shipping a build members can actually install.",
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
