/* =====================================================
   WISPY PURPLE GLITTER — ambient hero background
   Two layers:
     1. Wisps  — soft, slow-drifting smoke-like tendrils
     2. Glitter — small twinkling sparkle points, plus
                   the occasional 4-point star flare
   Purely decorative, respects prefers-reduced-motion
   (handled in CSS: canvas is display:none there).
   ===================================================== */
(function(){
  const canvas = document.getElementById("glitterCanvas");
  if(!canvas) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduceMotion) return;

  const ctx = canvas.getContext("2d");
  const host = canvas.parentElement;

  // Purple palette — deep violet through soft lavender
  const HUES = [258, 266, 274, 282, 290];

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize(){
    W = host.clientWidth;
    H = host.clientHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  /* ---------------------------------------------------
     Wisp tendrils
     Each is a chain of points that sways using layered
     sine waves so the whole thing curls and drifts
     rather than moving in a straight line.
     --------------------------------------------------- */
  function makeWisp(i){
    return {
      baseX: Math.random() * 1.2 - 0.1,   // fraction of width, can start slightly off-canvas
      baseY: Math.random() * 1.0,
      len: 5 + Math.floor(Math.random() * 3),
      segLen: 26 + Math.random() * 30,
      amp: 18 + Math.random() * 26,
      freq: 0.5 + Math.random() * 0.6,
      speed: 0.10 + Math.random() * 0.14,
      drift: 0.006 + Math.random() * 0.01,
      hue: HUES[i % HUES.length],
      width: 10 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.05 + Math.random() * 0.06
    };
  }

  /* ---------------------------------------------------
     Glitter sparkle points
     --------------------------------------------------- */
  function makeSpark(){
    return {
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 1.8,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
      twinkleSpeed: 0.8 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.004,
      driftY: -0.002 - Math.random() * 0.004,
      isStar: Math.random() < 0.12
    };
  }

  let wisps = [];
  let sparks = [];

  function seed(){
    const area = Math.max(W * H, 1);
    const wispCount = Math.max(4, Math.min(8, Math.round(area / 90000)));
    const sparkCount = Math.max(30, Math.min(90, Math.round(area / 6000)));
    wisps = Array.from({length: wispCount}, (_, i) => makeWisp(i));
    sparks = Array.from({length: sparkCount}, makeSpark);
  }

  function drawStar(cx, cy, r, alpha, hue){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${hue}, 70%, 82%)`;
    ctx.beginPath();
    ctx.moveTo(0, -r * 2.4);
    ctx.lineTo(r * 0.5, -r * 0.5);
    ctx.lineTo(r * 2.4, 0);
    ctx.lineTo(r * 0.5, r * 0.5);
    ctx.lineTo(0, r * 2.4);
    ctx.lineTo(-r * 0.5, r * 0.5);
    ctx.lineTo(-r * 2.4, 0);
    ctx.lineTo(-r * 0.5, -r * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawWisp(w, t){
    const originX = w.baseX * W + Math.sin(t * w.drift * 10 + w.phase) * W * 0.06;
    const originY = ((w.baseY + t * w.speed * 0.05) % 1.2 - 0.1) * H;

    const pts = [];
    for(let i = 0; i < w.len; i++){
      const along = i * w.segLen;
      const sway = Math.sin(t * w.freq + w.phase + i * 0.7) * w.amp;
      pts.push({
        x: originX + sway,
        y: originY - along
      });
    }

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for(let i = 0; i < pts.length - 1; i++){
      const fade = 1 - i / pts.length;
      const grad = ctx.createLinearGradient(pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y);
      grad.addColorStop(0, `hsla(${w.hue}, 65%, 60%, ${w.opacity * fade})`);
      grad.addColorStop(1, `hsla(${w.hue + 8}, 65%, 68%, ${w.opacity * fade * 0.6})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = w.width * fade + 2;
      ctx.filter = "blur(10px)";
      ctx.beginPath();
      if(i === 0){
        ctx.moveTo(pts[i].x, pts[i].y);
      } else {
        ctx.moveTo(pts[i-1].x, pts[i-1].y);
      }
      const midX = (pts[i].x + pts[i+1].x) / 2;
      const midY = (pts[i].y + pts[i+1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSpark(s, t){
    const x = ((s.x + s.driftX * t * 10) % 1.05 + 1.05) % 1.05 * W;
    const y = ((s.y + s.driftY * t * 10) % 1.1 + 1.1) % 1.1 * H;
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.twinkleSpeed + s.phase));
    const alpha = twinkle * 0.85;

    if(s.isStar){
      drawStar(x, y, s.r * 1.6, alpha * 0.9, s.hue);
      return;
    }
    const glow = ctx.createRadialGradient(x, y, 0, x, y, s.r * 5);
    glow.addColorStop(0, `hsla(${s.hue}, 85%, 88%, ${alpha})`);
    glow.addColorStop(0.4, `hsla(${s.hue}, 75%, 72%, ${alpha * 0.5})`);
    glow.addColorStop(1, `hsla(${s.hue}, 75%, 60%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, s.r * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  let running = true;
  let start = null;

  function frame(ts){
    if(!running) return;
    if(start === null) start = ts;
    const t = (ts - start) / 1000;

    ctx.clearRect(0, 0, W, H);
    wisps.forEach(w => drawWisp(w, t));
    sparks.forEach(s => drawSpark(s, t));

    requestAnimationFrame(frame);
  }

  // Pause the animation when the hero isn't visible (saves CPU/battery)
  const io = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const wasRunning = running;
      running = entry.isIntersecting;
      if(running && !wasRunning){
        start = null;
        requestAnimationFrame(frame);
      }
    });
  }, {threshold: 0.01}) : null;

  function init(){
    resize();
    seed();
    requestAnimationFrame(frame);
    if(io) io.observe(host);
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); seed(); }, 150);
  });

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
