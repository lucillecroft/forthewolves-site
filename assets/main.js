/* For the Wolves HQ — site behaviour.
   To add real work: edit PROJECTS below. Put photos in /images and list them in `images`
   (the first is the cover). Photos are shown 1-bit dithered on hover, then develop into the real image.
   Projects without photos get a generated placeholder.
   Optional per project: credits: [["Photography", "Name"], ["Hair", "Name"], ...] shown at the end of the project page. */

const PROJECTS = [
  { title: "Subsonic Bloom", client: "Artist name", type: "Tour wardrobe", role: "Creative direction & styling", year: "2026",
    text: "Placeholder. Stage looks for a headline tour: armour, latex and a light rig built around the clothes.", images: [] },
  { title: "Chrome Teeth", client: "Artist name", type: "Album campaign", role: "Creative direction", year: "2026",
    text: "Placeholder. A full album world from cover shoot to visualisers and merch.", images: [] },
  { title: "Feral Couture", client: "House name", type: "Runway styling", role: "Styling", year: "2025",
    text: "Placeholder. Show styling for a womenswear collection: forty looks, one week, no compromise.", images: [] },
  { title: "Static Saint", client: "Artist name", type: "Music video", role: "Styling & art direction", year: "2025",
    text: "Placeholder. Wardrobe and art direction for a one-take music video shot overnight.", images: [] },
  { title: "Lunar Debris", client: "Magazine name", type: "Editorial", role: "Creative direction & styling", year: "2025",
    text: "Placeholder. A twelve-page editorial on the end of the world and what to wear to it.", images: [] },
  { title: "Night Mass", client: "Talent name", type: "Red carpet", role: "Talent styling", year: "2024",
    text: "Placeholder. Custom looks across an awards season, from first sketch to the final carpet.", images: [] },
];

const doc = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover)").matches;
const pad = (n, l = 3) => String(n).padStart(l, "0");
const css = (name) => getComputedStyle(doc).getPropertyValue(name).trim();
const isLight = () => false; // the site is black only
const hexToRgb = (h) => {
  const m = h.replace("#", "");
  const v = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
};

/* ================= HERO: liquid chrome wordmark =================
   The letters are polished chrome. The reflection's horizon tilts and slides with the cursor,
   and a hard specular glint sweeps across every few seconds (and follows the cursor on hover). */
const hero = document.getElementById("hero-canvas");
const hctx = hero.getContext("2d");
const BL = `UnifrakturMaguntia, "Old English Text MT", serif`;   // blackletter, now only for artwork
// wordmark face: Anybody, black weight, extra-wide, tight
const WM = (ctx, px) => { ctx.font = `300 ${px}px Anybody, "Arial Black", sans-serif`; try { ctx.fontStretch = "extra-expanded"; ctx.letterSpacing = `${(-px * 0.02).toFixed(1)}px`; } catch (e) {} };
let HW = 0, HH = 0, big = 0, small = 0, mask = null, work = null;
const view = { h: 0.5, tilt: 0, glint: -1 };          // current
const aim = { h: 0.5, tilt: 0, glint: null };         // where the pointer wants it
let sweepStart = performance.now() + 900, hovering = false, needsDraw = true;

function buildHero() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  HW = Math.round((hero.clientWidth || 1200) * dpr);
  const probe = document.createElement("canvas").getContext("2d");
  WM(probe, 100);
  big = (HW * 0.985) / (probe.measureText("WOLVES").width / 100);
  small = big * 0.42;
  HH = Math.round(small * 1.0 + big * 0.86);
  hero.width = HW; hero.height = HH;
  hero.style.aspectRatio = `${HW} / ${HH}`;

  mask = document.createElement("canvas"); mask.width = HW; mask.height = HH;
  const m = mask.getContext("2d");
  m.fillStyle = "#000"; m.textBaseline = "alphabetic";
  WM(m, small); m.fillText("FOR THE", 0, small * 0.76);
  m.font = `${small * 0.62}px "IBM Plex Mono", monospace`; m.textAlign = "right";
  m.fillText("HQ", HW - 2, small * 0.76);
  m.textAlign = "left"; WM(m, big);
  m.fillText("WOLVES", 0, HH - big * 0.06);

  work = document.createElement("canvas"); work.width = HW; work.height = HH;
  needsDraw = true; drawHero();
}

// chrome band for one line of type: bright sky, dark horizon at h, bright ground
function chromeFill(x, top, bottom, h, tilt) {
  const span = bottom - top, lean = tilt * span;
  const g = x.createLinearGradient(-lean, top, lean, bottom);
  const c = (v) => Math.min(1, Math.max(0, v));
  [[0, "#f4f4f6"], [0.45, "#c4c6ca"], [0.55, "#8e9095"], [1, "#dcdde0"]]
    .forEach(([o, col]) => g.addColorStop(c(o), col));
  return g;
}

function drawHero() {
  if (!mask) return;
  const x = work.getContext("2d");
  x.globalCompositeOperation = "source-over";
  x.clearRect(0, 0, HW, HH);
  // two bands, one per line of type, so each line carries its own reflection
  x.fillStyle = chromeFill(x, 0, small, view.h, view.tilt);
  x.fillRect(0, 0, HW, small * 1.05);
  x.fillStyle = chromeFill(x, HH - big * 0.92, HH - big * 0.02, view.h, view.tilt);
  x.fillRect(0, small * 1.05, HW, HH - small * 1.05);
  // specular glint: a hard, slanted white blade
  if (view.glint > -0.2 && view.glint < 1.2) {
    const gx = view.glint * (HW + HH) - HH * 0.5, w = HW * 0.05;
    const g = x.createLinearGradient(gx - w, 0, gx + w, 0);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.3, "rgba(8,8,10,.92)"); g.addColorStop(0.44, "rgba(8,8,10,.92)");
    g.addColorStop(0.5, "#ffffff"); g.addColorStop(0.62, "rgba(255,255,255,.9)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.save(); x.translate(gx, HH / 2); x.transform(1, 0, -0.45, 1, 0, 0); x.translate(-gx, -HH / 2);
    x.fillStyle = g; x.fillRect(gx - w, -HH, w * 2, HH * 3); x.restore();
  }
  x.globalCompositeOperation = "destination-in";
  x.drawImage(mask, 0, 0);

  hctx.globalCompositeOperation = "source-over";
  hctx.fillStyle = "#000000";
  hctx.fillRect(0, 0, HW, HH);
  hctx.drawImage(work, 0, 0);
  needsDraw = false;
}

function heroLoop(now) {
  // automatic sweep every ~6s unless the cursor is steering the glint
  let gTarget = aim.glint;
  if (gTarget === null) {
    const t = (now - sweepStart) / 3200;
    if (t > 1.15) sweepStart = now + 9000 + Math.random() * 4000;
    gTarget = t < 0 ? -1 : -0.15 + t * 1.3;
    if (Math.abs(view.glint - gTarget) > 0.0005) { view.glint = gTarget; needsDraw = true; }
  } else {
    const d = gTarget - view.glint;
    if (Math.abs(d) > 0.0005) { view.glint += d * 0.14; needsDraw = true; }
  }
  const target = hovering ? aim : { h: 0.5, tilt: 0 };
  ["h", "tilt"].forEach((k) => {
    const d = target[k] - view[k];
    if (Math.abs(d) > 0.0005) { view[k] += d * 0.08; needsDraw = true; }
  });
  if (needsDraw) drawHero();
  requestAnimationFrame(heroLoop);
}

hero.addEventListener("pointermove", (e) => {
  const r = hero.getBoundingClientRect();
  const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
  hovering = true;
  aim.h = 0.32 + v * 0.36;           // horizon rides up and down with the cursor
  aim.tilt = (u - 0.5) * 0.12;       // and leans toward it
  aim.glint = u * 1.05;              // the glint follows the cursor across
});
hero.addEventListener("pointerleave", () => { hovering = false; aim.glint = null; sweepStart = performance.now() + 600; });

/* ================= DITHER: placeholder images and photos ================= */
const BAYER = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];

function rng(seed) { let s = (seed * 7919) % 233280; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

// A figure in a dark room, generated from a seed, used until real photos are added.
function sceneLum(seed, w, h) {
  const r = rng(seed + 11);
  const fx = 0.38 + r() * 0.24, lx = r(), ly = 0.1 + r() * 0.3, lean = (r() - 0.5) * 0.25;
  const rim = r() > 0.5, bars = r() > 0.55;
  const noise = rng(seed + 99);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h;
      let L = 0.06 + 0.22 * (1 - v);
      const d = Math.hypot(u - lx, (v - ly) * 0.8);
      L += Math.max(0, 0.75 - d * 1.4);
      const cx = fx + lean * (v - 0.3);
      const head = Math.hypot((u - cx) / 0.075, (v - 0.24) / 0.07);
      const bodyW = 0.08 + Math.max(0, v - 0.33) * 0.55;
      const inBody = v > 0.31 && Math.abs(u - cx) < bodyW;
      const inFig = head < 1 || inBody;
      if (inFig) {
        const edge = inBody ? Math.abs(u - cx) / bodyW : head;
        L = rim ? 0.03 + Math.pow(edge, 6) * 0.9 * (u > cx ? 1 : 0.3) : 0.92 - edge * 0.35 - v * 0.25;
      }
      if (bars && !inFig && Math.floor(u * 9) % 2 === 0) L *= 0.5;
      L += (noise() - 0.5) * 0.08;
      out[y * w + x] = Math.max(0, Math.min(1, L));
    }
  }
  return out;
}

function lumFromImage(img, w, h) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  x.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  const d = x.getImageData(0, 0, w, h).data, out = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) out[p] = (0.299 * d[p * 4] + 0.587 * d[p * 4 + 1] + 0.114 * d[p * 4 + 2]) / 255;
  return out;
}

function paintDither(canvas, lum, w, h) {
  canvas.width = w; canvas.height = h;
  const x = canvas.getContext("2d"), img = x.createImageData(w, h);
  let ink = hexToRgb(css("--fg") || "#f1efe9"), ground = hexToRgb(css("--bg") || "#000000");
  if (ink.some(isNaN)) ink = [241, 239, 233];
  if (ground.some(isNaN)) ground = [0, 0, 0];
  // keep the photo's light as light in both themes
  if (isLight()) [ink, ground] = [ground, ink];
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
    const p = y * w + i, t = (BAYER[(y % 8) * 8 + (i % 8)] + 0.5) / 64;
    const k = Math.pow(lum[p], 1.4), c = [0, 1, 2].map((n) => Math.round(ground[n] + (ink[n] - ground[n]) * k));
    img.data[p * 4] = c[0]; img.data[p * 4 + 1] = c[1]; img.data[p * 4 + 2] = c[2]; img.data[p * 4 + 3] = 255;
  }
  x.putImageData(img, 0, 0);
}

// Renders an image into a box: coarse 1-bit first, then it develops (finer dither, or the real photo).
function mountImage(box, seed, src, develop = true) {
  clearTimeout(box._t);
  box.innerHTML = "";
  const cv = document.createElement("canvas");
  box.appendChild(cv);
  const coarse = [72, 90], fine = [300, 375];
  const finish = (lumFn) => {
    paintDither(cv, lumFn(...coarse), ...coarse);
    if (!develop) return;
    box._t = setTimeout(() => {
      if (src) { const im = new Image(); im.src = src; im.alt = ""; box.appendChild(im); }
      else paintDither(cv, lumFn(...fine), ...fine);
    }, reduceMotion ? 0 : 480);
  };
  if (src) {
    const im = new Image();
    im.onload = () => finish((w, h) => lumFromImage(im, w, h));
    im.onerror = () => finish((w, h) => sceneLum(seed, w, h));
    im.src = src;
  } else finish((w, h) => sceneLum(seed, w, h));
}

/* ================= WORK INDEX ================= */
const list = document.getElementById("index");
list.innerHTML = PROJECTS.map((p, i) => `
  <li><button class="row" type="button" data-i="${i}">
    <span class="thumb" aria-hidden="true"></span>
    <span class="n">FTW-${pad(i + 1)}</span>
    <span class="t">${p.title}</span>
    <span class="d">${p.type}</span>
    <span class="y">${p.year}</span>
  </button></li>`).join("");

function paintThumbs() {
  list.querySelectorAll(".row").forEach((row) => {
    const i = Number(row.dataset.i);
    mountImage(row.querySelector(".thumb"), i, PROJECTS[i].images[0], false);
  });
}

const peek = document.querySelector(".peek");
let peekI = -1, mx = 0, my = 0, px = 0, py = 0;
if (finePointer) {
  list.addEventListener("pointerover", (e) => {
    const row = e.target.closest(".row");
    if (!row) return;
    const i = Number(row.dataset.i);
    if (i !== peekI) { peekI = i; mountImage(peek, i, PROJECTS[i].images[0]); }
    peek.classList.add("on");
  });
  list.addEventListener("pointerleave", () => { peek.classList.remove("on"); clearTimeout(peek._t); peekI = -1; });
}

/* ================= PROJECT VIEW ================= */
const ov = document.getElementById("ov");
const slug = (i) => `ftw-${pad(i + 1)}`;
let lastFocus = null, current = -1;
function openProject(i, focus = true) {
  const p = PROJECTS[i];
  current = i;
  document.getElementById("ov-index").textContent = `FTW-${pad(i + 1)} / ${pad(PROJECTS.length)}`;
  document.getElementById("ov-title").textContent = p.title;
  document.getElementById("ov-text").textContent = p.text;
  document.getElementById("ov-meta").innerHTML = [["Client", p.client], ["Project", p.type], ["Role", p.role], ["Year", p.year]]
    .map(([k, v]) => `<div><dt class="tiny">${k}</dt><dd>${v}</dd></div>`).join("");

  // gallery: every photo the project lists, or five placeholders until photos arrive
  const shots = p.images.length ? p.images : [null, null, null, null, null];
  const gal = document.getElementById("ov-gal");
  gal.innerHTML = shots.map((_, n) =>
    `<figure class="shot"><div class="shot-img"></div><figcaption class="tiny">FTW-${pad(i + 1)} / ${pad(n + 1, 2)}</figcaption></figure>`).join("");
  gal.querySelectorAll(".shot-img").forEach((box, n) => { box._seed = i + n * 17; mountImage(box, i + n * 17, shots[n] || undefined); Melter.attach(box); });

  const credits = (p.credits && p.credits.length) ? p.credits
    : [["Creative direction", "For the Wolves HQ"], ["Photography", "TBC"], ["Hair", "TBC"], ["Make-up", "TBC"]];
  document.getElementById("ov-credits").innerHTML = credits
    .map(([k, v]) => `<div><dt class="tiny">${k}</dt><dd>${v}</dd></div>`).join("");

  const next = (i + 1) % PROJECTS.length;
  const nextBtn = document.getElementById("ov-next");
  nextBtn.dataset.i = next;
  nextBtn.querySelector(".t").textContent = PROJECTS[next].title;
  nextBtn.querySelector(".n").textContent = `Next / FTW-${pad(next + 1)}`;

  peek.classList.remove("on");
  if (!ov.classList.contains("open")) lastFocus = document.activeElement;
  ov.classList.add("open"); ov.setAttribute("aria-hidden", "false"); ov.scrollTop = 0;
  document.body.style.overflow = "hidden";
  try { history.replaceState(null, "", `#${slug(i)}`); } catch (e) {}
  if (focus) document.getElementById("ov-close").focus({ preventScroll: true });
}
function closeProject() {
  ov.classList.remove("open"); ov.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  current = -1;
  try { history.replaceState(null, "", "#shoots"); } catch (e) {}
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
list.addEventListener("click", (e) => { const row = e.target.closest(".row"); if (row) openProject(Number(row.dataset.i)); });
document.getElementById("ov-close").addEventListener("click", closeProject);
document.getElementById("ov-next").addEventListener("click", (e) => openProject(Number(e.currentTarget.dataset.i)));
// a shared link like forthewolveshq.com/#ftw-002 opens that project
function openFromHash() {
  if (!WORK_ON) return;
  const m = /^#ftw-(\d{3})$/.exec(location.hash);
  if (m && PROJECTS[Number(m[1]) - 1]) openProject(Number(m[1]) - 1, false);
}

/* ================= CURSOR READOUT + PEEK FOLLOW ================= */
const xy = document.querySelector(".xy");
if (finePointer) {
  window.addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    xy.style.transform = `translate(${mx + 14}px, ${my + 14}px)`;
  });
  (function follow() {
    px += (mx - px) * (reduceMotion ? 1 : 0.2); py += (my - py) * (reduceMotion ? 1 : 0.2);
    const w = peek.offsetWidth, h = peek.offsetHeight;
    const left = Math.min(window.innerWidth - w - 12, px + 28);
    const top = Math.max(12, Math.min(window.innerHeight - h - 12, py - h / 2));
    peek.style.transform = `translate(${left}px, ${top}px)`;
    requestAnimationFrame(follow);
  })();
}

/* ================= CLOCK ================= */
const clock = document.getElementById("clock");
function tick() {
  const d = new Date();
  clock.textContent = `FTW/HQ ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}`;
}
clock.textContent = "";

/* ================= COPY EMAIL ================= */
document.getElementById("copy-email").addEventListener("click", () => {
  const el = document.getElementById("email"), status = document.getElementById("copy-status");
  const fallback = () => {
    const range = document.createRange(); range.selectNodeContents(el);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    status.textContent = "Selected. Press Ctrl/⌘+C";
  };
  if (navigator.clipboard) navigator.clipboard.writeText(el.textContent.trim()).then(() => { status.textContent = "Copied"; }, fallback);
  else fallback();
});

/* ================= THEME ================= */
function repaint() { buildHero(); paintThumbs(); Field.build(); Reel.build(); buildHall(); peekI = -1; }

/* ================= HOWL ================= */
const howl = document.querySelector(".howl");
let typed = "";
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ov.classList.contains("open")) { closeProject(); return; }
  if (e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-4);
  if (typed === "howl") {
    typed = "";
    let n = 0;
    const flick = setInterval(() => {
      howl.classList.toggle("on");
      if (++n > 7) { clearInterval(flick); howl.classList.add("on"); setTimeout(() => howl.classList.remove("on"), 1400); }
    }, 70);
    sweepStart = performance.now();
  }
});

/* ================= BOOT ================= */
document.getElementById("year").textContent = new Date().getFullYear();
let resizeT;
window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(buildHero, 150); });

/* ================= GATE: are you a wolf, or are you a sheep? ================= */
(() => {
  const gate = document.getElementById("gate");
  if (!gate) return;
  let seen = false;
  try { seen = sessionStorage.getItem("ftw-wolf") === "1"; } catch (e) {}
  if (seen || /^#(ftw-\d{3}|reel|shoots|exhibit)$/.test(location.hash)) { gate.remove(); return; }
  doc.classList.add("gated");
  // the entity: a face pressing into black latex from the other side, only just there
  const ecv = document.getElementById("gate-entity");
  const ent = reduceMotion ? null : createMelt(ecv, {
    amb: 0.008, tint: 0, decay: 0.97, rad: 0.02, heat: 0, speed: 0.35, drag: 0.04, // a rendered latex face; the cursor only dents it
    auto(t, p) { // an invisible hand moving through it
      const x = .5 + Math.sin(t * .37) * .28 + Math.sin(t * 1.3) * .05, y = .55 + Math.sin(t * .51 + 1) * .22;
      p.vx += (x - p.x) * .9; p.vy += (y - p.y) * .9; p.x = x; p.y = y;
    },
  });
  if (ent) {
    ent.resize(); ent.setSource(document.createElement("canvas")); ent.start();
    const face = new Image();
    face.onload = () => ent.setSource(face);
    face.src = innerWidth < innerHeight ? "images/gate-face-p.jpg?v=4" : "images/gate-face-l.jpg?v=4";
    requestAnimationFrame(() => ecv.classList.add("on"));
    let lp = null;
    gate.addEventListener("pointermove", (e) => {
      const x = e.clientX / innerWidth, y = 1 - e.clientY / innerHeight;
      if (lp) ent.push(x, y, (x - lp[0]) * 4, (y - lp[1]) * 4);
      lp = [x, y];
    });
    window.addEventListener("resize", () => ent.resize());
  } else ecv.remove();
  const wolf = document.getElementById("pick-wolf"), baa = gate.querySelector(".gate-baa");
  let turnT;
  const enter = () => {
    clearTimeout(turnT);
    try { sessionStorage.setItem("ftw-wolf", "1"); } catch (e) {}
    doc.classList.remove("gated");
    gate.classList.add("gone");
    window.dispatchEvent(new Event("ftw:enter"));
    setTimeout(() => { if (ent) ent.stop(); gate.remove(); }, reduceMotion ? 0 : 950);
  };
  wolf.addEventListener("click", enter);
  // the sheep don't get a dead end: they get talked into becoming a wolf
  document.getElementById("pick-sheep").addEventListener("click", () => {
    gate.classList.add("baa-on");
    requestAnimationFrame(() => requestAnimationFrame(() => baa.classList.add("go")));
    turnT = setTimeout(() => gate.classList.add("turned"), reduceMotion ? 0 : 3400);
  });
  document.getElementById("pick-again").addEventListener("click", enter);
})();

/* ================= GENESIS: an exploding star assembling out of letters ================= */
// Letters drift in from nowhere and settle into an exploding star. The cursor tears through them; they reform.
const field = document.getElementById("field");
const Field = (() => {
  if (!field) return { build() {} };
  const fx = field.getContext("2d");
  const WORD = "forthewolves";
  let W = 0, H = 0, dpr = 1, fs = 12, cw = 7.2, lh = 14;
  let n = 0, hx, hy, x, y, vx, vy, ch, lit, delay, t0 = 0, visible = false, running = false, born = false;
  const ptr = { x: -9999, y: -9999, vx: 0, vy: 0, on: false };
  // the machine reading the idea: regions of the figure, each with a live match score
  let REG = [["core"], ["shockwave"], ["debris"]];
  const wrap = field.parentElement, info = document.getElementById("gen-info");
  // under the letters: the same figure as liquid light, melting. It surfaces as the idea forms.
  const mcv = document.createElement("canvas"); mcv.className = "field-melt"; mcv.setAttribute("aria-hidden", "true");
  wrap.insertBefore(mcv, field);
  const melt = reduceMotion ? null : createMelt(mcv, {
    amb: 0.05, tint: 0.92, decay: 0.986, rad: 0.02, heat: 0.9,
    auto(t, p) { if (ptr.on) return; const x = (W < 600 ? .5 : .6) + Math.sin(t * .29) * .2, y = .5 + Math.cos(t * .43 + 2) * .25; p.vx += (x - p.x) * .5; p.vy += (y - p.y) * .5; p.x = x; p.y = y; },
  });
  if (!melt) mcv.remove();
  let meltOn = false;
  const meltRun = (on) => { if (!melt || on === meltOn) return; meltOn = on; on ? melt.start() : melt.stop(); };
  function meltSource(cols, rows, off, boxW) {
    const w = 480, h = Math.max(2, Math.round(480 * H / W)), c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d"), im = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const u = (i / w * cols - off) / boxW, v = j / h, L = figure(u, v);
      const g = Math.round(Math.min(1, L * L * 1.1) * 255), q = (j * w + i) * 4;
      im.data[q] = im.data[q + 1] = im.data[q + 2] = g; im.data[q + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    const o = document.createElement("canvas"); o.width = w; o.height = h;
    const ox = o.getContext("2d"); ox.fillStyle = "#000"; ox.fillRect(0, 0, w, h);
    ox.filter = "blur(2px)"; ox.drawImage(c, 0, 0);
    ox.globalCompositeOperation = "lighter"; ox.filter = "blur(12px)"; ox.globalAlpha = .7; ox.drawImage(c, 0, 0);
    return o;
  }
  const tags = REG.map(([name]) => { const t = document.createElement("div"); t.className = "tag"; t.innerHTML = `<b>000% ${name}</b>`; wrap.appendChild(t); return t; });
  let region, regN = REG.map(() => 0), frameN = 0;
  function score() {
    const got = REG.map(() => 0);
    for (let k = 0; k < n; k++) if (region[k] < REG.length && Math.abs(x[k] - hx[k]) + Math.abs(y[k] - hy[k]) < 4) got[region[k]]++;
    const pc = got.map((g, r) => regN[r] ? Math.round(g / regN[r] * 99) : 0);
    tags.forEach((t, r) => { t.firstChild.textContent = `${pad(pc[r])}% ${REG[r][0]}`; t.dataset.lvl = pc[r] >= 90 ? "hi" : pc[r] >= 55 ? "mid" : "low"; });
    const all = Math.round(pc.reduce((a, b) => a + b, 0) / REG.length);
    mcv.style.opacity = (Math.max(0, all - 20) / 79 * 0.8).toFixed(3);
    info.innerHTML = [["Info", "Match"], ["Spark", "001"], ["Thought", pad(Math.round(Math.min(99, all * 1.4)))], ["Form", pad(Math.round((pc[0] + pc[2]) / 2))], ["World", pad(all)]]
      .map(([k, v], r) => `<div${r ? ` data-lvl="${+v >= 90 ? "hi" : +v >= 55 ? "mid" : "low"}"` : ""}><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  }

  // where the light is: an exploding star. A blinding core, a lens-flare cross, a ragged shockwave, streaks of debris.
  let ASP = 0.9;   // box width / height in pixels, so it stays round
  const hs2 = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  const nz1 = (t, k) => { const i = Math.floor(t), f = t - i, w = f * f * (3 - 2 * f); return hs2(i, k) + (hs2(i + 1, k) - hs2(i, k)) * w; };
  const nz2 = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hs2(xi, yi), b = hs2(xi + 1, yi), c = hs2(xi, yi + 1), d = hs2(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  function figure(u, v) {
    const X = (u - 0.5) * ASP, Y = v - 0.5, r = Math.hypot(X, Y), a = Math.atan2(Y, X), t = (a + Math.PI) / (2 * Math.PI) * 40;
    const core = Math.exp(-r * 34) * 1.8 + Math.exp(-r * 12) * .18;
    const flare = (Math.exp(-Math.abs(Y) * 220) * Math.exp(-Math.abs(X) * 2.6) + Math.exp(-Math.abs(X) * 220) * Math.exp(-Math.abs(Y) * 2.6)) * .95;
    const shellR = .31 + (nz1(t * .5, 3) - .5) * .06, shell = Math.exp(-Math.pow((r - shellR) / .014, 2)) * (.15 + .85 * Math.pow(nz1(t * 2, 7), 1.5));
    const len = .22 + .5 * Math.pow(nz1(t * 3.1, 11), 1.4), streak = Math.pow(Math.abs(Math.cos(a * 30 + nz1(t, 5) * 5)), 70) * (r < len ? 1 : Math.exp(-(r - len) * 30)) * Math.exp(-r * 1.1) * .9;
    const neb = Math.max(0, nz2(X * 11 + 4, Y * 11 + 2) - .62) * 1.6 * Math.exp(-Math.pow((r - .24) / .1, 2));
    return Math.min(1, core + flare + shell + streak + neb + 0.02);
  }
  // live boxes around three parts of the explosion (u0, v0, u1, v1 in the box)
  function regions() {
    const at = (X, Y, h) => { const u = 0.5 + X / ASP, v = 0.5 + Y, hu = h / ASP; return [u - hu, v - h, u + hu, v + h]; };
    return [["core", ...at(0, 0, 0.08)], ["shockwave", ...at(0.22, -0.22, 0.06)], ["debris", ...at(-0.3, 0.27, 0.06)]];
  }

  function build() {
    const r = field.getBoundingClientRect();
    if (!r.width) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    field.width = Math.round(W * dpr); field.height = Math.round(H * dpr);
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = W < 600 ? 10 : 12; cw = fs * 0.6; lh = fs * 1.15;
    fx.font = `${fs}px ${css("--mono") || "monospace"}`; fx.textBaseline = "top";
    const cols = Math.floor(W / cw), rows = Math.floor(H / lh);
    const R = rng(7), keep = [];
    // the figure lives in a portrait box; on wide screens it sits right of centre
    const boxW = Math.min(cols, Math.round(rows * lh / cw * 0.9)), off = Math.round((cols - boxW) * (W < 600 ? 0.5 : 0.62));
    ASP = (boxW * cw) / (rows * lh); REG = regions();
    // on phones the question sits above the field, so the glow and boxes start where the field starts
    const oy = field.offsetTop;
    Object.assign(mcv.style, { top: `${oy}px`, height: `${H}px`, bottom: "auto" });
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const u = (i - off) / boxW, v = j / rows;
      const L = figure(u, v);
      const t = (BAYER[(j % 8) * 8 + (i % 8)] + 0.5) / 64;
      if (L > 0.1 ? L > t * 1.1 : R() < 0.012) keep.push(i, j, L);
    }
    if (melt) { melt.resize(); melt.setSource(meltSource(cols, rows, off, boxW)); melt.clear(); }
    n = keep.length / 3;
    region = new Uint8Array(n); regN = REG.map(() => 0);
    const fh = rows * lh;
    REG.forEach(([, u0, v0, u1, v1], r) => {
      Object.assign(tags[r].style, { left: `${(off + u0 * boxW) * cw}px`, top: `${oy + v0 * fh}px`, width: `${(u1 - u0) * boxW * cw}px`, height: `${(v1 - v0) * fh}px` });
    });
    hx = new Float32Array(n); hy = new Float32Array(n); x = new Float32Array(n); y = new Float32Array(n);
    vx = new Float32Array(n); vy = new Float32Array(n); ch = new Array(n); lit = new Uint8Array(n); delay = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const i = keep[k * 3], j = keep[k * 3 + 1], L = keep[k * 3 + 2];
      hx[k] = i * cw; hy[k] = j * lh;
      ch[k] = L > 0.1 ? WORD[(i + j * 5) % WORD.length] : WORD[Math.floor(R() * WORD.length)];
      lit[k] = L > 0.8 && R() > 0.3 ? 1 : 0;
      x[k] = R() * W; y[k] = R() * H; vx[k] = vy[k] = 0;
      delay[k] = R() * 900 + (j / rows) * 600;
      const u = (i - off) / boxW, v = j / rows;
      region[k] = 9;
      for (let r = 0; r < REG.length; r++) { const [, u0, v0, u1, v1] = REG[r]; if (u >= u0 && u <= u1 && v >= v0 && v <= v1) { region[k] = r; regN[r]++; break; } }
    }
    if (reduceMotion || born) { for (let k = 0; k < n; k++) { x[k] = hx[k]; y[k] = hy[k]; } }
    draw(true); score();
    if (!reduceMotion) kick();
  }

  function draw(clean) {
    // the letters sit on glass: the trail fades to transparent so the entity shows through underneath
    if (clean) fx.clearRect(0, 0, W, H);
    else { fx.globalCompositeOperation = "destination-out"; fx.fillStyle = "rgba(0,0,0,0.32)"; fx.fillRect(0, 0, W, H); }
    fx.globalCompositeOperation = "source-over";
    fx.fillStyle = "#5d5e63";
    for (let k = 0; k < n; k++) if (!lit[k]) fx.fillText(ch[k], x[k], y[k]);
    fx.fillStyle = "#e9e9eb";
    for (let k = 0; k < n; k++) if (lit[k]) fx.fillText(ch[k], x[k], y[k]);
  }

  function step(now) {
    if (!t0) t0 = now;
    const age = now - t0, R2 = W < 600 ? 70 * 70 : 110 * 110;
    let energy = 0;
    for (let k = 0; k < n; k++) {
      if (age > delay[k]) { vx[k] += (hx[k] - x[k]) * 0.045; vy[k] += (hy[k] - y[k]) * 0.045; }
      if (ptr.on) {
        const dx = x[k] - ptr.x, dy = y[k] - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const f = 1 - d2 / R2, d = Math.sqrt(d2) || 1;
          vx[k] += (dx / d) * f * 6 + ptr.vx * f * 0.25;
          vy[k] += (dy / d) * f * 6 + ptr.vy * f * 0.25;
        }
      }
      vx[k] *= 0.8; vy[k] *= 0.8;
      x[k] += vx[k]; y[k] += vy[k];
      energy += Math.abs(vx[k]) + Math.abs(vy[k]) + Math.abs(hx[k] - x[k]) * 0.05;
    }
    ptr.vx *= 0.8; ptr.vy *= 0.8;
    draw(false);
    if (++frameN % 5 === 0) score();
    if (energy / Math.max(1, n) > 0.02 || ptr.on) requestAnimationFrame(step);
    else { born = true; running = false; for (let k = 0; k < n; k++) { x[k] = hx[k]; y[k] = hy[k]; } draw(true); score(); }
  }
  function kick() { if (!visible || running || reduceMotion || doc.classList.contains("gated")) return; running = true; requestAnimationFrame(step); }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); meltRun(visible && !doc.classList.contains("gated")); }, { threshold: 0.05 }).observe(field);
  window.addEventListener("ftw:enter", () => meltRun(visible));
  window.addEventListener("ftw:enter", () => setTimeout(kick, 500));
  if (!reduceMotion) {
    field.addEventListener("pointermove", (e) => {
      const r = field.getBoundingClientRect(), nx = e.clientX - r.left, ny = e.clientY - r.top;
      if (ptr.on) { ptr.vx = nx - ptr.x; ptr.vy = ny - ptr.y; if (melt) melt.push(nx / r.width, 1 - ny / r.height, ptr.vx / r.width * 5, -ptr.vy / r.height * 5); }
      ptr.x = nx; ptr.y = ny; ptr.on = true; kick();
    });
    field.addEventListener("pointerleave", () => { ptr.on = false; ptr.x = ptr.y = -9999; });
  }
  return { build };
})();

/* ================= SMEAR: images drag and pixel-sort under the cursor ================= */
function attachSmear(box) {
  return; // sleek: no pixel-sort smear
  if (!finePointer || reduceMotion || box._smear) return;
  box._smear = true;
  const sm = document.createElement("canvas"); sm.className = "smear";
  const sx = sm.getContext("2d");
  let amp = 0, py = 0.5, px = 0.5, dir = 1, last = null, raf = 0;
  const source = () => box.querySelector("img:last-of-type") || box.querySelector("canvas:not(.smear)");
  function frame() {
    const src = source();
    if (!src) { raf = 0; return; }
    const w = sm.width = 300, h = sm.height = 375;
    const iw = src.naturalWidth || src.width, ih = src.naturalHeight || src.height;
    const s = Math.max(w / iw, h / ih), dw = iw * s, dh = ih * s, ox = (w - dw) / 2, oy = (h - dh) / 2;
    sx.imageSmoothingEnabled = false;
    sx.drawImage(src, ox, oy, dw, dh);
    // horizontal bands near the cursor: hold one column of pixels and stretch it out, like a sort
    const band = h * 0.28, cy = py * h, cx = px * w, rh = 3;
    for (let yy = Math.max(0, cy - band); yy < Math.min(h, cy + band); yy += rh) {
      const f = Math.cos(((yy - cy) / band) * Math.PI / 2);
      const len = amp * f * w * (0.35 + 0.65 * Math.abs(Math.sin(yy * 12.9898) * 0.5 + 0.5));
      if (len < 2) continue;
      const col = Math.round(cx + Math.sin(yy * 0.31) * 6);
      const sxp = (col - ox) / s, syp = (yy - oy) / s;
      if (dir > 0) sx.drawImage(src, sxp, syp, 1 / s, rh / s, col, yy, len, rh);
      else sx.drawImage(src, sxp, syp, 1 / s, rh / s, col - len, yy, len, rh);
    }
    amp *= 0.9;
    sm.style.opacity = amp > 0.01 ? 1 : 0;
    raf = amp > 0.01 ? requestAnimationFrame(frame) : 0;
  }
  box.addEventListener("pointermove", (e) => {
    const r = box.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
    if (last) { const v = nx - last; if (Math.abs(v) > 0.002) dir = v > 0 ? -1 : 1; amp = Math.min(0.9, amp + Math.abs(v) * 4); }
    last = nx; px = nx; py = ny;
    if (!box.contains(sm)) box.appendChild(sm);
    if (!raf) raf = requestAnimationFrame(frame);
  });
  box.addEventListener("pointerleave", () => { last = null; });
}

/* ================= MELT: the entity. Images flow like wet paint and slowly reform ================= */
// One WebGL2 renderer: a displacement field the cursor pushes (it advects itself and decays),
// and the image drawn through it with a streaked, cold, filmic finish. Returns null without WebGL2.
function createMelt(cv, opt = {}) {
  const gl = cv.getContext("webgl2", { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl || !gl.getExtension("EXT_color_buffer_float")) return null;
  const amb = opt.amb ?? 0.02, tint = opt.tint ?? 0.85, decay = opt.decay ?? 0.985, heat = opt.heat ?? 0, gloss = opt.gloss ?? 0, speed = opt.speed ?? 1, drag = opt.drag ?? .5, sheen = opt.sheen ?? 1;
  const VS = `#version 300 es
in vec2 p; out vec2 uv; void main(){ uv = p * .5 + .5; gl_Position = vec4(p, 0, 1); }`;
  const FIELD = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uPrev; uniform vec2 uPtr, uVel; uniform float uRad, uAsp, uDecay;
void main(){
  vec2 d = texture(uPrev, uv).xy;
  vec2 a = texture(uPrev, uv - d * .02).xy * uDecay;
  vec2 q = uv - uPtr; q.x *= uAsp;
  a += uVel * exp(-dot(q, q) / uRad);
  o = vec4(clamp(a, -1.5, 1.5), 0, 1);
}`;
  const DRAW = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uImg, uField; uniform float uT, uAmb, uTint, uHeat, uGloss, uDrag, uSheen; uniform vec2 uCover;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float s = 0., a = .5; for (int i = 0; i < 5; i++){ s += a * n(p); p = p * 2.03 + 1.7; a *= .5; } return s; }
vec3 img(vec2 u){ u = (u - .5) * uCover + .5; return texture(uImg, vec2(u.x, 1. - u.y)).rgb; }
void main(){
  vec2 d = texture(uField, uv).xy;
  vec2 w = vec2(fbm(uv * 1.8 + vec2(uT * .05, -uT * .04)), fbm(uv * 1.8 + vec2(5.2 - uT * .045, 1.3 + uT * .035))) - .5;
  vec2 off = d * uDrag + w * uAmb;
  vec3 c = vec3(0); float tw = 0.;
  for (int i = 0; i < 12; i++){ float k = float(i) / 11.; float wt = 1. - k * .7; c += img(uv - off * k) * wt; tw += wt; }
  c /= tw;
  // fine ridges along the flow, like the striations in poured paint
  float m = length(off);
  vec2 dir = m > 1e-4 ? off / m : vec2(1, 0);
  vec2 r = vec2(dot(uv, vec2(-dir.y, dir.x)), dot(uv, dir));
  float rid = fbm(r * vec2(260., 3.) + uT * .2);
  c *= 1. + (rid - .5) * min(m * 6., .9);
  float L = dot(c, vec3(.299, .587, .114));
  vec3 cold = vec3(L * .8, L * .9, L * 1.12);
  c = mix(c, cold, uTint);
  // a dash of blood under the ice: where the flow is strongest, warm flesh shows through
  vec3 warm = vec3(L * 1.25, L * .42, L * .38);
  c = mix(c, warm, smoothstep(.04, .3, m) * uHeat * smoothstep(.15, .6, L));
  if (uGloss > 0.) {
    // black latex: the image becomes a relief under a skin of gloss, lit by one slow light
    vec2 q = uv - off * .5, e = vec2(1. / 300.);
    float hc = dot(img(q), vec3(.333));
    float hx = dot(img(q + vec2(e.x, 0)), vec3(.333)) - dot(img(q - vec2(e.x, 0)), vec3(.333));
    float hy = dot(img(q + vec2(0, e.y)), vec3(.333)) - dot(img(q - vec2(0, e.y)), vec3(.333));
    vec3 nr = normalize(vec3(-hx * uGloss, -hy * uGloss, 1.));
    vec3 l = normalize(vec3(cos(uT * .11) * .8, .5 + sin(uT * .07) * .35, .42));
    vec3 hv = normalize(l + vec3(0, 0, 1));
    float nh = max(dot(nr, hv), 0.);
    float spec = pow(nh, 120.) * 1.5 + pow(nh, 14.) * .1 * uSheen + pow(nh, 4.) * .03 * (uSheen - 1.);
    float fres = pow(1. - nr.z, 2.) * .35;
    c = vec3(.006) + hc * vec3(.05, .048, .046) * uSheen + (spec + fres) * vec3(.97, .95, .92);
  }
  c += (h(uv * vec2(1013., 977.) + fract(uT)) - .5) * (uGloss > 0. ? .012 : .045);
  o = vec4(c, 1);
}`;
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const prog = (fs) => { const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, "p"); gl.linkProgram(p); return p; };
  let pf, pd;
  try { pf = prog(FIELD); pd = prog(DRAW); } catch (e) { return null; }
  const U = (p, n) => gl.getUniformLocation(p, n);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = (w, h, data) => {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, data || null);
    return t;
  };
  const FW = 192, FH = 192;
  const fields = [0, 1].map(() => { const t = tex(FW, FH); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { t, f }; });
  const clearField = () => fields.forEach(({ f }) => { gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); });
  clearField();
  const imgTex = tex();
  let srcW = 1, srcH = 1, cur = 0, t0 = performance.now(), raf = 0, live = false, energy = 0;
  const ptr = { x: .5, y: .5, vx: 0, vy: 0 };
  function resize() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(1.5, window.devicePixelRatio || 1);
    cv.width = Math.max(2, Math.round(r.width * dpr)); cv.height = Math.max(2, Math.round(r.height * dpr));
  }
  function setSource(src) {
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    srcW = src.naturalWidth || src.width; srcH = src.naturalHeight || src.height;
  }
  function frame() {
    const now = performance.now(), t = (now - t0) / 1000 * speed;
    if (opt.auto) opt.auto(t, ptr);
    const asp = cv.width / cv.height;
    // field step
    gl.viewport(0, 0, FW, FH); gl.useProgram(pf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fields[1 - cur].f);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fields[cur].t);
    gl.uniform1i(U(pf, "uPrev"), 0); gl.uniform2f(U(pf, "uPtr"), ptr.x, ptr.y); gl.uniform2f(U(pf, "uVel"), ptr.vx, ptr.vy);
    gl.uniform1f(U(pf, "uRad"), opt.rad ?? 0.012); gl.uniform1f(U(pf, "uAsp"), asp); gl.uniform1f(U(pf, "uDecay"), decay);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    cur = 1 - cur;
    energy = energy * 0.97 + Math.abs(ptr.vx) + Math.abs(ptr.vy);
    ptr.vx = ptr.vy = 0;
    // draw
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); gl.useProgram(pd);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fields[cur].t);
    gl.uniform1i(U(pd, "uImg"), 0); gl.uniform1i(U(pd, "uField"), 1);
    gl.uniform1f(U(pd, "uT"), t); gl.uniform1f(U(pd, "uAmb"), amb); gl.uniform1f(U(pd, "uTint"), tint); gl.uniform1f(U(pd, "uHeat"), heat); gl.uniform1f(U(pd, "uGloss"), gloss); gl.uniform1f(U(pd, "uDrag"), drag); gl.uniform1f(U(pd, "uSheen"), sheen);
    const sa = srcW / srcH;
    gl.uniform2f(U(pd, "uCover"), sa > asp ? asp / sa : 1, sa > asp ? 1 : sa / asp);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = live ? requestAnimationFrame(frame) : 0;
  }
  return {
    canvas: cv, resize, setSource, clear: clearField,
    get energy() { return energy; },
    push(x, y, vx, vy) { ptr.x = x; ptr.y = y; ptr.vx += vx; ptr.vy += vy; },
    start() { if (!live) { live = true; raf = requestAnimationFrame(frame); } },
    stop() { live = false; cancelAnimationFrame(raf); raf = 0; },
  };
}

// A smooth (not dithered) greyscale version of a placeholder scene, for the melt to work on.
function smoothScene(seed, w = 240, h = 300) {
  const lum = sceneLum(seed, w, h), c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), im = x.createImageData(w, h);
  for (let p = 0; p < w * h; p++) { const v = Math.round(lum[p] * 255); im.data[p * 4] = im.data[p * 4 + 1] = im.data[p * 4 + 2] = v; im.data[p * 4 + 3] = 255; }
  x.putImageData(im, 0, 0);
  const o = document.createElement("canvas"); o.width = w; o.height = h;
  const ox = o.getContext("2d"); ox.filter = "blur(2px)"; ox.drawImage(c, 0, 0);
  return o;
}

// The presence behind the entry: a head and shoulders of light, drawn soft, then melted.
function entityImage(w = 640, h = 640) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, w, h);
  x.filter = "blur(18px)";
  const g = x.createRadialGradient(w * .5, h * .4, 0, w * .5, h * .4, w * .26);
  g.addColorStop(0, "#f4f7ff"); g.addColorStop(.55, "#9aa6c2"); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.beginPath(); x.ellipse(w * .5, h * .4, w * .19, h * .25, 0, 0, Math.PI * 2); x.fill();
  const s = x.createRadialGradient(w * .5, h * 1.02, 0, w * .5, h * 1.02, w * .5);
  s.addColorStop(0, "#6f7a94"); s.addColorStop(.7, "#1b1e26"); s.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = s; x.beginPath(); x.ellipse(w * .5, h * 1.02, w * .46, h * .32, 0, 0, Math.PI * 2); x.fill();
  // eyes, nose shadow and mouth: just enough for a face to surface when the flow calms
  x.filter = "blur(9px)"; x.fillStyle = "rgba(10,12,20,.85)";
  [[.42, .37], [.58, .37]].forEach(([u, v]) => { x.beginPath(); x.ellipse(w * u, h * v, w * .045, h * .025, 0, 0, Math.PI * 2); x.fill(); });
  x.fillStyle = "rgba(10,12,20,.5)"; x.beginPath(); x.ellipse(w * .5, h * .45, w * .02, h * .045, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = "rgba(10,12,20,.75)"; x.beginPath(); x.ellipse(w * .5, h * .53, w * .07, h * .012, 0, 0, Math.PI * 2); x.fill();
  return c;
}

// The entry backdrop: an eclipse. A black disc, a thin white rim, light bleeding out in rays.
function eclipseImage(w = 720, h = 720) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), im = x.createImageData(w, h), cx = w / 2, cy = h * .46, R = w * .22;
  const hs = (a, b) => { const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); };
  const nz = (t) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hs(i, 1) + (hs(i + 1, 1) - hs(i, 1)) * u; };
  const rays = (a) => .5 * nz(a * 6 + 20) + .3 * nz(a * 13 + 5) + .2 * nz(a * 29 + 9);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (i - cx) / R, dy = (j - cy) / R, rr = Math.hypot(dx, dy), q = (j * w + i) * 4;
    let L = 0;
    if (rr >= 1) { const a = Math.atan2(dy, dx) + Math.PI, ray = .5 + .5 * rays(a), fall = Math.exp(-(rr - 1) * (5 / ray)); L = Math.min(1.35, fall * .8 + Math.exp(-(rr - 1) * 55)); }
    im.data[q] = L * 185; im.data[q + 1] = L * 200; im.data[q + 2] = L * 240; im.data[q + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return c;
}

// Photos in a project melt under the cursor. One shared canvas moves to whichever photo you're over.
const Melter = (() => {
  if (!finePointer || reduceMotion) return { attach() {} };
  const cv = document.createElement("canvas"); cv.className = "melt";
  const m = createMelt(cv, { amb: 0.012, tint: 0.55, decay: 0.975, rad: 0.015, heat: 0.5 });
  if (!m) return { attach: attachSmear };
  let box = null, last = null, idle = 0;
  function source(b) {
    const im = b.querySelector("img");
    if (im && im.complete && im.naturalWidth) return im;
    return b._smooth || (b._smooth = smoothScene(b._seed || 0));
  }
  function watch() {
    if (!box) return;
    if (m.energy < 0.004 && !last) { if (++idle > 30) { m.stop(); cv.style.opacity = 0; box = null; return; } } else idle = 0;
    requestAnimationFrame(watch);
  }
  function attach(b) {
    b.addEventListener("pointerenter", () => {
      if (box !== b) { box = b; b.appendChild(cv); m.resize(); m.setSource(source(b)); m.clear(); }
      cv.style.opacity = 1; idle = 0; m.start(); requestAnimationFrame(watch);
    });
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
      if (last) m.push(x, y, (x - last[0]) * 7, (y - last[1]) * 7);
      last = [x, y];
    });
    b.addEventListener("pointerleave", () => { last = null; });
  }
  return { attach };
})();

/* ================= REEL ================= */
// Put the reel file in /video and set its path here, e.g. "video/ftw-reel-2026.mp4". Until then a placeholder reel plays.
const REEL_SRC = "";
const Reel = (() => {
  const cv = document.getElementById("reel-canvas"), vid = document.getElementById("reel-video");
  const tc = document.getElementById("reel-tc"), snd = document.getElementById("reel-sound");
  if (!cv) return { build() {} };
  let t0 = performance.now(), on = false;
  const tick = () => {
    const f = Math.floor((performance.now() - t0) / 40);
    tc.textContent = [Math.floor(f / 90000) % 24, Math.floor(f / 1500) % 60, Math.floor(f / 25) % 60, f % 25].map((n) => pad(n, 2)).join(":");
    if (on) requestAnimationFrame(tick);
  };
  if (REEL_SRC) {
    vid.src = REEL_SRC; vid.hidden = false; cv.hidden = true; snd.hidden = false;
    snd.addEventListener("click", () => { vid.muted = !vid.muted; snd.textContent = vid.muted ? "Sound off" : "Sound on"; });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { vid.play().catch(() => {}); tick(); } else vid.pause(); }, { threshold: 0.25 }).observe(vid);
    return { build() {} };
  }
  // placeholder: hard cuts between scenes, each one melting, like a reel edit
  const melt = reduceMotion ? null : createMelt(cv, {
    amb: 0.06, tint: 0.88, heat: 0.6, decay: 0.982, rad: 0.025,
    auto(t, p) { const x = .5 + Math.sin(t * .8) * .32, y = .5 + Math.sin(t * 1.1 + 1) * .3; p.vx += (x - p.x) * .7; p.vy += (y - p.y) * .7; p.x = x; p.y = y; },
  });
  const scenes = [3, 8, 14, 21, 5, 30].map((s) => smoothScene(s, 320, 180));
  scenes.splice(2, 0, entityImage(320, 320));
  let cut = 0, cutT;
  function build() {
    if (!melt) { const x = cv.getContext("2d"); cv.width = 320; cv.height = 180; x.drawImage(scenes[0], 0, 0, 320, 180); return; }
    melt.resize(); melt.setSource(scenes[cut]);
  }
  function nextCut() { cut = (cut + 1) % scenes.length; melt.setSource(scenes[cut]); melt.clear(); cutT = setTimeout(nextCut, 1400 + Math.random() * 1600); }
  if (melt) new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on) { melt.start(); tick(); cutT = setTimeout(nextCut, 1800); } else { melt.stop(); clearTimeout(cutT); }
  }, { threshold: 0.15 }).observe(cv);
  return { build };
})();

/* ================= EXHIBIT: artworks hung like a museum ================= */
// Placeholders until real works arrive. For each work set image: "images/art/name.jpg" and fill in the placard.
const ARTWORKS = [
  { title: "Untitled (Entity)", year: "2026", medium: "Pigment print", size: "120 × 150 cm", kind: "entity", ratio: 0.8, image: "" },
  { title: "Wolf Glyph I", year: "2025", medium: "Chrome leaf on board", size: "90 × 90 cm", kind: "glyph", ratio: 1, image: "" },
  { title: "Static Saint", year: "2025", medium: "1-bit print on cotton rag", size: "100 × 125 cm", kind: "dither", ratio: 0.8, image: "" },
  { title: "Pack Study", year: "2024", medium: "Ink on paper", size: "160 × 90 cm", kind: "field", ratio: 16 / 9, image: "" },
  { title: "Night Mass", year: "2026", medium: "C-type print", size: "80 × 100 cm", kind: "scene", ratio: 0.8, image: "" },
];
function artCanvas(a, i, h) {
  const w = Math.round(h * a.ratio), c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d");
  x.fillStyle = "#08080a"; x.fillRect(0, 0, w, h);
  const cover = (src) => { const s = Math.max(w / src.width, h / src.height); x.drawImage(src, (w - src.width * s) / 2, (h - src.height * s) / 2, src.width * s, src.height * s); };
  if (a.kind === "entity") cover(entityImage(512, 640));
  else if (a.kind === "scene") cover(smoothScene(40 + i, 240, 300));
  else if (a.kind === "dither") { const d = document.createElement("canvas"); paintDither(d, sceneLum(12 + i, 160, 200), 160, 200); x.imageSmoothingEnabled = false; cover(d); }
  else if (a.kind === "glyph") {
    x.fillStyle = "#0c0c0e"; x.fillRect(0, 0, w, h);
    const g = x.createLinearGradient(0, h * .18, 0, h * .86);
    [[0, "#fff"], [.28, "#c9cbcf"], [.46, "#7d7f85"], [.52, "#2c2d31"], [.56, "#e4e5e8"], [.78, "#a3a5aa"], [1, "#f4f4f6"]].forEach(([o, col]) => g.addColorStop(o, col));
    x.fillStyle = g; x.font = `${Math.round(h * .78)}px ${BL}`; x.textAlign = "center"; x.textBaseline = "middle";
    x.fillText("W", w / 2, h * .54);
  } else if (a.kind === "field") {
    const fs = Math.max(6, Math.round(h / 34)), word = "forthewolves";
    x.font = `${fs}px ${css("--mono") || "monospace"}`; x.textBaseline = "top";
    const lum = sceneLum(77, Math.floor(w / (fs * .6)), Math.floor(h / (fs * 1.1)));
    const cols = Math.floor(w / (fs * .6)), rows = Math.floor(h / (fs * 1.1));
    for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) {
      const L = lum[j * cols + k]; if (L < .25) continue;
      x.fillStyle = L > .7 ? "#e9e9eb" : L > .45 ? "#8a8b90" : "#3e3f44";
      x.fillText(word[(k + j * 5) % word.length], k * fs * .6, j * fs * 1.1);
    }
  }
  return c;
}
function mountArt(box, a, i, h) {
  box.innerHTML = "";
  if (a.image) { const im = new Image(); im.src = a.image; im.alt = a.title; box.appendChild(im); }
  else box.appendChild(artCanvas(a, i, h));
}
const placard = (a, i) => `<b>${a.title}</b><i>${a.year}</i><span>For the Wolves HQ</span><span>${a.medium}</span><span>${a.size}</span><span class="acc">FTW.${a.year}.${pad(i + 1)}</span>`;

const hall = document.getElementById("hall"), track = document.getElementById("hall-track");
function buildHall() {
  if (!track) return;
  track.querySelectorAll(".work").forEach((n) => n.remove());
  const h = Math.min(460, Math.max(220, Math.round(innerWidth * .32)));
  ARTWORKS.forEach((a, i) => {
    const b = document.createElement("button");
    b.className = "work"; b.type = "button"; b.dataset.i = i;
    b.setAttribute("aria-label", `${a.title}, ${a.year}. View larger`);
    b.innerHTML = `<span class="art"></span><span class="placard">${placard(a, i)}</span>`;
    mountArt(b.querySelector(".art"), a, i, h * 2);
    track.appendChild(b);
  });
  window.dispatchEvent(new Event("ftw:hall"));
}
// brutalist concrete: board-formed slabs with tie holes, generated once and used as the wall
function concrete() {
  const w = 720, h = 480, c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d"), im = x.createImageData(w, h), r = rng(5);
  const n2 = (i, j) => { const v = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return v - Math.floor(v); };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const board = Math.floor(j / 60), grain = Math.sin(i * .05 + board * 3 + Math.sin(j * .3) * .6) * 3;
    let v = 15 + board % 2 * 1.5 + grain + (n2(i, j) - .5) * 9 + (n2(i >> 3, j >> 3) - .5) * 5;
    if (j % 60 < 1) v -= 6; if (i % 240 < 1) v -= 4;
    v = Math.max(0, v); const q = (j * w + i) * 4; im.data[q] = v; im.data[q + 1] = v; im.data[q + 2] = v + 1.5; im.data[q + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  x.fillStyle = "rgba(0,0,0,.75)";
  for (let ty = 30; ty < h; ty += 120) for (let tx = 60; tx < w; tx += 120) { x.beginPath(); x.arc(tx + (r() - .5) * 2, ty, 3.2, 0, Math.PI * 2); x.fill(); }
  return c.toDataURL("image/jpeg", .8);
}
if (hall) {
  try { hall.style.setProperty("--concrete", `url(${concrete()})`); } catch (e) {}
  // a carousel: the work in the middle of the hall is lit, the rest wait in the dark
  const count = document.getElementById("hall-count");
  const works = () => [...track.querySelectorAll(".work")];
  let active = 0, st;
  const mark = () => {
    const mid = hall.scrollLeft + hall.clientWidth / 2;
    let best = 0, bd = Infinity;
    works().forEach((w, i) => { const d = Math.abs(w.offsetLeft + w.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    active = best;
    works().forEach((w, i) => w.classList.toggle("lit", i === best));
    if (count) count.textContent = `${pad(best + 1, 2)} / ${pad(ARTWORKS.length, 2)}`;
  };
  hall.addEventListener("scroll", () => { cancelAnimationFrame(st); st = requestAnimationFrame(mark); }, { passive: true });
  const go = (d) => { const w = works()[Math.max(0, Math.min(ARTWORKS.length - 1, active + d))]; if (w) hall.scrollTo({ left: w.offsetLeft + w.offsetWidth / 2 - hall.clientWidth / 2, behavior: reduceMotion ? "auto" : "smooth" }); };
  document.getElementById("hall-prev").addEventListener("click", () => go(-1));
  document.getElementById("hall-next").addEventListener("click", () => go(1));
  hall.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go(1); } if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); } });
  window.addEventListener("ftw:hall", () => requestAnimationFrame(mark));
  // drag to walk the hall
  let down = null, moved = 0;
  hall.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = { x: e.clientX, s: hall.scrollLeft }; moved = 0; });
  window.addEventListener("pointermove", (e) => { if (!down) return; const dx = e.clientX - down.x; moved = Math.max(moved, Math.abs(dx)); if (moved > 4) { hall.classList.add("drag"); hall.scrollLeft = down.s - dx; } });
  window.addEventListener("pointerup", () => { down = null; hall.classList.remove("drag"); });
  hall.addEventListener("click", (e) => { if (moved > 4) { e.preventDefault(); e.stopPropagation(); moved = 0; return; } const w = e.target.closest(".work"); if (w) openView(Number(w.dataset.i)); }, true);
}
const artView = document.getElementById("view");
let viewFrom = null;
function openView(i) {
  const a = ARTWORKS[i];
  mountArt(document.getElementById("view-art"), a, i, 1200);
  document.getElementById("view-placard").innerHTML = placard(a, i).replace("<b>", '<b id="view-title">');
  viewFrom = document.activeElement;
  artView.classList.add("open"); artView.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  document.getElementById("view-close").focus({ preventScroll: true });
}
function closeView() {
  artView.classList.remove("open"); artView.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  if (viewFrom) viewFrom.focus({ preventScroll: true });
}
if (artView) {
  document.getElementById("view-close").addEventListener("click", closeView);
  artView.addEventListener("click", (e) => { if (e.target === artView) closeView(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && artView.classList.contains("open")) closeView(); });
}

/* ---------- services: one name lit in chrome, cycling until someone points ---------- */
(() => {
  const list = document.getElementById("svc-list"), desc = document.getElementById("svc-desc");
  if (!list) return;
  const items = [...list.children];
  let cur = 0, held = false;
  const light = (i) => { items[cur].classList.remove("on"); cur = i; items[i].classList.add("on"); desc.textContent = items[i].firstElementChild.dataset.d; };
  items.forEach((li, i) => {
    const b = li.firstElementChild;
    b.addEventListener("pointerenter", () => { held = true; light(i); });
    b.addEventListener("focus", () => { held = true; light(i); });
    b.addEventListener("click", () => { held = true; light(i); });
  });
  list.addEventListener("pointerleave", () => { held = false; });
  if (!reduceMotion) setInterval(() => { if (!held && !document.hidden) light((cur + 1) % items.length); }, 3600);
})();

/* ================= PAGES: reel, shoots and exhibit each get their own page ================= */
const ROOMS = ["reel", "shoots", "exhibit"];
// The work rooms are switched off until the folio is ready. Set to true to bring them back (and unhide #work in index.html).
const WORK_ON = false;
const home = document.querySelector("main.home");
let room = null;
function route() {
  const h = location.hash.slice(1);
  if (!WORK_ON && (ROOMS.includes(h) || /^ftw-\d{3}$/.test(h))) { history.replaceState(null, "", location.pathname); }
  const next = !WORK_ON ? null : ROOMS.includes(h) ? h : /^ftw-\d{3}$/.test(h) ? "shoots" : null;
  if (next === room) return;
  const wasRoom = room;
  room = next;
  home.hidden = !!room;
  ROOMS.forEach((r) => { document.getElementById(`page-${r}`).hidden = r !== room; });
  if (room) {
    window.scrollTo(0, 0);
    if (room === "reel") Reel.build();
    if (room === "exhibit") buildHall();
    if (room === "shoots") paintThumbs();
    document.title = `${room[0].toUpperCase()}${room.slice(1)} / For the Wolves HQ`;
  } else {
    document.title = "For the Wolves HQ";
    buildHero(); Field.build();
    // coming back from a room: land on the doors, or on whichever section the link named
    const target = document.getElementById(h) || (wasRoom ? document.getElementById("work") : null);
    if (target) requestAnimationFrame(() => target.scrollIntoView());
  }
}
window.addEventListener("hashchange", route);

const boot = () => { buildHero(); paintThumbs(); Field.build(); Reel.build(); buildHall(); route(); openFromHash(); };  // sleek: the wordmark stays still
const fontReady = document.fonts && document.fonts.load
  ? Promise.all([document.fonts.load('100px "UnifrakturMaguntia"'), document.fonts.load('300 100px "Anybody"')]).then(() => document.fonts.ready)
  : Promise.resolve();
fontReady.then(boot, boot);
