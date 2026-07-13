/* =====================================================
   HERO BACKGROUND IMAGE
   Replaces the placeholder element (#glitterCanvas) with a
   static <img> using "animated-background" as its class.
   Critical positioning/sizing styles are also set inline so
   it displays correctly even before/without a matching CSS
   rule — see the note in style.css for the recommended rule.
   ===================================================== */
(function(){
  const placeholder = document.getElementById("glitterCanvas");
  if(!placeholder) return;

  const IMAGE_SRC = "web-bg.jpg"; // place this file alongside index.html

  const img = document.createElement("img");
  img.id = "glitterCanvas"; // keep the id in case other code/CSS targets it
  img.className = "animated-background";
  img.src = IMAGE_SRC;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");

  // Inline fallback so it renders correctly even if the stylesheet
  // hasn't been updated with a .animated-background rule yet.
  Object.assign(img.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: "0",
    pointerEvents: "none",
    display: "block"
  });

  placeholder.replaceWith(img);
})();
