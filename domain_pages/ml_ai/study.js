/* =====================================================
   ACM-W BPHC — study.html content loader
   Reads ?topic=<slug> from the URL and fills in the
   template with that topic's title + (placeholder)
   study material. Add new topics to TOPICS below as
   more resource cards are added across domain pages.
   ===================================================== */

const TOPICS = {
  "python-for-ml": {
    domainLabel: "Machine Learning & AI",
    domainHref: "ml_ai.html",
    title: "Python for ML",
    intro: "The core Python toolkit — NumPy, pandas and plotting — that every ML notebook in this domain builds on.",
  },
  "supervised-learning": {
    domainLabel: "Machine Learning & AI",
    domainHref: "ml_ai.html",
    title: "Supervised Learning",
    intro: "Regression and classification, and the math that underpins both.",
  },
  "neural-networks": {
    domainLabel: "Machine Learning & AI",
    domainHref: "ml_ai.html",
    title: "Neural Networks & Deep Learning",
    intro: "Perceptrons, backpropagation, and building your first deep learning model.",
  },
  "nlp": {
    domainLabel: "Machine Learning & AI",
    domainHref: "ml_ai.html",
    title: "Natural Language Processing",
    intro: "Tokenization, embeddings, and how machines make sense of text.",
  },
  "mlops": {
    domainLabel: "Machine Learning & AI",
    domainHref: "ml_ai.html",
    title: "Model Deployment & MLOps",
    intro: "Taking a model from a notebook to a service other people can actually use.",
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
