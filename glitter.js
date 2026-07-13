/* =====================================================
   QUANTUM NETWORK — ambient hero background
   A small graph of "qubit" nodes wired together like a
   circuit. Each node breathes with expanding superposition
   rings; pulses travel along the connecting wires and
   flash the node they arrive at, like a measurement event.
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

  // Palette pulled from the site's own accent colors
  const PALETTE = [
    { hue: 330, sat: 100, light: 68 }, // magenta
    { hue: 220, sat: 100, light: 62 }, // violet/blue
    { hue: 199, sat: 90,  light: 65 }  // amber/cyan
  ];

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
     Nodes (qubits)
     --------------------------------------------------- */
  function makeNode(){
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    return {
      x: 0.06 + Math.random() * 0.88,
      y: 0.08 + Math.random() * 0.84,
      driftAmpX: 0.008 + Math.random() * 0.016,
      driftAmpY: 0.008 + Math.random() * 0.016,
      driftFreqX: 0.12 + Math.random() * 0.18,
      driftFreqY: 0.12 + Math.random() * 0.18,
      phase: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.35 + Math.random() * 0.3,
      hue: c.hue, sat: c.sat, light: c.light,
      r: 2.2 + Math.random() * 1.6,
      isHub: Math.random() < 0.28,
      orbitPhase: Math.random() * Math.PI * 2,
      flash: 0
    };
  }

  let nodes = [];
  let edges = [];

  function nodePos(n, t){
    return {
      x: (n.x + Math.sin(t * n.driftFreqX + n.phase) * n.driftAmpX) * W,
      y: (n.y + Math.cos(t * n.driftFreqY + n.phase * 1.3) * n.driftAmpY) * H
    };
  }

  function buildEdges(){
    edges = [];
    const degree = new Array(nodes.length).fill(0);
    const maxDegree = 3;
    for(let i = 0; i < nodes.length; i++){
      const dists = [];
      for(let j = 0; j < nodes.length; j++){
        if(i === j) continue;
        const dx = (nodes[i].x - nodes[j].x) * W;
        const dy = (nodes[i].y - nodes[j].y) * H;
        dists.push({ j, d: Math.sqrt(dx*dx + dy*dy) });
      }
      dists.sort((a, b) => a.d - b.d);
      let added = 0;
      for(const cand of dists){
        if(added >= 2) break;
        if(degree[i] >= maxDegree || degree[cand.j] >= maxDegree) continue;
        const exists = edges.some(e => (e.a === i && e.b === cand.j) || (e.a === cand.j && e.b === i));
        if(exists) continue;
        edges.push({
          a: i, b: cand.j,
          offset: Math.random(),
          speed: 0.12 + Math.random() * 0.1,
          lastProgress: 0
        });
        degree[i]++; degree[cand.j]++;
        added++;
      }
    }
  }

  function seed(){
    const area = Math.max(W * H, 1);
    const count = Math.max(10, Math.min(22, Math.round(area / 42000)));
    nodes = Array.from({length: count}, makeNode);
    buildEdges();
  }

  function drawEdge(e, t){
    const pa = nodePos(nodes[e.a], t);
    const pb = nodePos(nodes[e.b], t);
    const na = nodes[e.a], nb = nodes[e.b];

    // wire
    const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
    grad.addColorStop(0, `hsla(${na.hue}, ${na.sat}%, ${na.light}%, 0.16)`);
    grad.addColorStop(1, `hsla(${nb.hue}, ${nb.sat}%, ${nb.light}%, 0.16)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();

    // traveling pulse
    const progress = (t * e.speed + e.offset) % 1;
    if(progress < e.lastProgress){
      nb.flash = 1;
      na.flash = Math.max(na.flash, 0.25);
    }
    e.lastProgress = progress;

    const px = pa.x + (pb.x - pa.x) * progress;
    const py = pa.y + (pb.y - pa.y) * progress;
    const pulseHue = na.hue;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, 6);
    glow.addColorStop(0, `hsla(${pulseHue}, 100%, 82%, 0.9)`);
    glow.addColorStop(1, `hsla(${pulseHue}, 100%, 70%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawNode(n, t){
    const p = nodePos(n, t);

    // orbit ring for hub nodes — a slowly rotating ellipse, like an
    // electron path around the qubit
    if(n.isHub){
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(t * 0.15 + n.orbitPhase);
      ctx.strokeStyle = `hsla(${n.hue}, ${n.sat}%, ${n.light}%, 0.22)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, n.r * 5.5, n.r * 2.2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // superposition rings — expanding, fading circles
    for(let i = 0; i < 2; i++){
      const cycle = (t * n.pulseSpeed + n.pulsePhase + i * 0.5) % 1;
      const radius = n.r * 2 + cycle * 22;
      const alpha = (1 - cycle) * 0.28;
      ctx.strokeStyle = `hsla(${n.hue}, ${n.sat}%, ${n.light}%, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // core
    const flashBoost = n.flash * 0.6;
    n.flash *= 0.9;
    const coreR = n.r * (1 + flashBoost);
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, coreR * 4);
    glow.addColorStop(0, `hsla(${n.hue}, 100%, ${Math.min(n.light + 18, 92)}%, ${0.9 + flashBoost * 0.1})`);
    glow.addColorStop(0.5, `hsla(${n.hue}, ${n.sat}%, ${n.light}%, ${0.35 + flashBoost * 0.2})`);
    glow.addColorStop(1, `hsla(${n.hue}, ${n.sat}%, ${n.light}%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.x, p.y, coreR * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${n.hue}, 100%, ${Math.min(n.light + 20, 95)}%, ${0.95})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, coreR, 0, Math.PI * 2);
    ctx.fill();
  }

  let running = true;
  let start = null;

  function frame(ts){
    if(!running) return;
    if(start === null) start = ts;
    const t = (ts - start) / 1000;

    ctx.clearRect(0, 0, W, H);
    edges.forEach(e => drawEdge(e, t));
    nodes.forEach(n => drawNode(n, t));

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
