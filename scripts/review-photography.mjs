/**
 * Writes photography-review.html — the page the owner uses to decide which of
 * their own photographs may be published.
 *
 *   node scripts/review-photography.mjs
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * Roughly half the collection shows recognisable guests: faces of named
 * customers on their holiday. Those cannot go on a commercial site because a
 * developer thought they were good frames — they need the operator's judgement
 * about who was asked and what they agreed to. Three more frames show elephant
 * riding and elephant bathing, which is a brand position rather than a consent
 * question, and equally not a decision to make on someone's behalf.
 *
 * So the frames are catalogued, numbered and described, and held. This page is
 * how they get released: it shows every held frame full size, says why it is
 * held, and lets the owner mark the ones that are cleared. The marks are kept
 * in the browser, and the button at the bottom copies them out as a list to
 * paste back.
 *
 * It reads the originals straight off the local disk, so nothing is uploaded
 * to make a decision about uploading, and the file is gitignored — it contains
 * absolute paths to one particular machine and is worthless anywhere else.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const SRC =
  process.env.PHOTO_SRC || "C:/Users/whisk/OneDrive/Documents/island route/Images";

const manifest = JSON.parse(
  readFileSync(path.join(HERE, "photography.manifest.json"), "utf8"),
);

const REASON = {
  guests:
    "Shows a recognisable guest. Needs their permission before it can be published.",
  person:
    "Shows a recognisable person who is not a guest. Same permission question.",
  quality: "Held on quality, not consent — see the note.",
};

const held = manifest.filter((m) => m.hold);
const live = manifest.filter((m) => m.publish);

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const url = (file) => pathToFileURL(path.join(SRC, file)).href;

const ethical = new Set([6, 31, 24]);

const card = (m, mode) => `
  <figure class="card ${mode}" data-n="${m.n}">
    <div class="shot" style="aspect-ratio:${m.width}/${m.height}">
      <img src="${esc(url(m.file))}" alt="" loading="lazy" decoding="async">
      <span class="n">${m.n}</span>
      ${ethical.has(m.n) ? `<span class="flag">brand decision</span>` : ""}
    </div>
    <figcaption>
      <p class="subject">${esc(m.subject || m.caption)}</p>
      ${
        mode === "held"
          ? `<p class="why">${esc(REASON[m.hold] || m.hold)}</p>
             <button type="button" class="release" aria-pressed="false">
               <span class="box" aria-hidden="true"></span>
               <span class="label">Cleared to publish</span>
             </button>`
          : `<p class="meta">${esc(m.category)}${m.place ? ` · ${esc(m.place)}` : ""}</p>
             <p class="why">${esc(m.alt)}</p>`
      }
    </figcaption>
  </figure>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Photography review · Island Route Sri Lanka</title>
<style>
  :root{
    --deep:#032722; --moss:#0d4034; --sand:#f6f1e7; --dune:#e8e0d2;
    --ink:#1b1b19; --copper:#b4713c; --copper-light:#d4a06a; --mist:#9fb3ac;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:var(--deep);color:var(--sand);
    font:16px/1.6 ui-sans-serif,system-ui,"Segoe UI",sans-serif;
    -webkit-font-smoothing:antialiased}
  .wrap{max-width:1320px;margin:0 auto;padding:0 24px 120px}
  header{padding:72px 0 40px;max-width:68ch}
  .eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;
    color:var(--copper-light);margin-bottom:18px}
  h1{font-size:clamp(28px,4vw,42px);line-height:1.1;font-weight:500;
    letter-spacing:-.01em;margin-bottom:20px}
  header p{color:var(--mist);margin-bottom:12px}
  header strong{color:var(--sand);font-weight:500}
  h2{font-size:clamp(20px,2.4vw,26px);font-weight:500;margin-bottom:8px}
  .section{padding-top:56px}
  .section>p{color:var(--mist);max-width:62ch;margin-bottom:28px}
  hr{border:0;border-top:1px solid rgba(246,241,231,.14);margin-top:56px}

  .grid{display:grid;gap:28px;
    grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
  .card{background:rgba(246,241,231,.04);border:1px solid rgba(246,241,231,.12);
    display:flex;flex-direction:column}
  .shot{position:relative;background:var(--moss);overflow:hidden}
  .shot img{width:100%;height:100%;object-fit:cover;display:block}
  .n{position:absolute;left:0;top:0;background:var(--copper);color:#fff;
    font:600 13px/1 ui-sans-serif,system-ui,sans-serif;padding:7px 10px;
    letter-spacing:.04em}
  .flag{position:absolute;right:0;top:0;background:#8a2f14;color:#fff;
    font:600 10px/1 ui-sans-serif,system-ui,sans-serif;padding:7px 9px;
    letter-spacing:.1em;text-transform:uppercase}
  figcaption{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;
    flex:1}
  .subject{font-size:15px;line-height:1.45}
  .meta{font-size:11px;letter-spacing:.14em;text-transform:uppercase;
    color:var(--copper-light)}
  .why{font-size:13px;color:var(--mist);line-height:1.5}

  /* 44px of height, well past the 24px WCAG 2.5.8 floor, on a control that
     will be tapped forty-nine times in a row on a phone. */
  .release{margin-top:auto;display:flex;align-items:center;gap:10px;
    min-height:44px;padding:8px 12px;width:100%;cursor:pointer;
    background:transparent;color:var(--sand);text-align:left;
    border:1px solid rgba(246,241,231,.22);font:inherit;font-size:13px;
    transition:border-color .15s,background-color .15s}
  .release:hover{border-color:var(--copper-light)}
  .release:focus-visible{outline:2px solid var(--copper-light);outline-offset:2px}
  .box{width:18px;height:18px;flex:none;border:1px solid rgba(246,241,231,.4);
    position:relative}
  .release[aria-pressed="true"]{background:rgba(180,113,60,.18);
    border-color:var(--copper)}
  .release[aria-pressed="true"] .box{background:var(--copper);
    border-color:var(--copper)}
  .release[aria-pressed="true"] .box::after{content:"";position:absolute;
    left:5px;top:1px;width:6px;height:11px;border:solid #fff;
    border-width:0 2px 2px 0;transform:rotate(42deg)}

  .bar{position:sticky;bottom:0;z-index:5;margin-top:48px;
    background:rgba(3,39,34,.94);backdrop-filter:blur(8px);
    border-top:1px solid rgba(246,241,231,.16);
    padding:16px 24px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
  .bar p{font-size:13px;color:var(--mist)}
  .bar b{color:var(--sand);font-weight:600}
  .bar button{min-height:44px;padding:10px 20px;cursor:pointer;
    background:var(--copper);color:#fff;border:1px solid var(--copper);
    font:inherit;font-size:13px;letter-spacing:.1em;text-transform:uppercase}
  .bar button:hover{background:var(--copper-light);border-color:var(--copper-light)}
  .bar button:focus-visible{outline:2px solid var(--sand);outline-offset:2px}
  .bar .ghost{background:transparent;color:var(--sand);
    border-color:rgba(246,241,231,.3)}
  .bar .ghost:hover{background:rgba(246,241,231,.08);
    border-color:var(--sand)}
  .out{width:100%;min-height:72px;background:rgba(0,0,0,.3);color:var(--sand);
    border:1px solid rgba(246,241,231,.2);padding:12px;font:13px/1.5
    ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical}
  .out[hidden]{display:none}
  @media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">Island Route Sri Lanka · photography</p>
    <h1>${held.length} photographs are waiting on your decision</h1>
    <p>Your collection came to ${manifest.length} unique frames. <strong>${live.length}</strong>
       are ready to publish and need nothing from you. <strong>${held.length}</strong> are held
       back, almost all because they show a guest's face clearly enough to
       recognise them.</p>
    <p>Publishing a recognisable customer on a commercial site is their call,
       not ours — and the site already carries a privacy notice, so it is worth
       being straight about it. Mark below only the frames where you know the
       guests agreed their photographs could be used in your marketing.</p>
    <p>Nothing on this page uploads anything. Your marks are saved in this
       browser, and the button at the bottom copies them out as a list.</p>
  </header>

  <section class="section">
    <h2>Held — your decision</h2>
    <p>Three frames are marked <em>brand decision</em> instead: they show
       elephant riding or elephant bathing, which many operators have stopped
       showing. That one is about what you want the brand to say.</p>
    <div class="grid">${held.map((m) => card(m, "held")).join("")}</div>
  </section>

  <hr>

  <section class="section">
    <h2>Going live — no faces, nothing to decide</h2>
    <p>These ${live.length} are what the gallery and the page sections will be built
       from. Each one already has a caption and a description for screen
       readers. ${live.filter((m) => m.place).length} of them name a place, and only because the
       landmark is in the frame — the rest describe what they show rather than
       guess where they were taken.</p>
    <div class="grid">${live.map((m) => card(m, "live")).join("")}</div>
  </section>
</div>

<div class="bar">
  <p><b id="count">0</b> of ${held.length} marked as cleared</p>
  <button type="button" id="copy">Copy the list</button>
  <button type="button" class="ghost" id="clear">Start again</button>
  <textarea class="out" id="out" hidden readonly aria-label="Cleared frames"></textarea>
</div>

<script>
  var KEY = "island-route-photo-release";
  var state = new Set();
  try {
    var saved = localStorage.getItem(KEY);
    if (saved) state = new Set(JSON.parse(saved));
  } catch (e) { /* private window, or storage blocked — marks just won't persist */ }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify([...state])); } catch (e) {}
    document.getElementById("count").textContent = state.size;
  }

  document.querySelectorAll(".release").forEach(function (btn) {
    var n = Number(btn.closest(".card").dataset.n);
    if (state.has(n)) btn.setAttribute("aria-pressed", "true");
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
      if (on) state.delete(n); else state.add(n);
      save();
    });
  });
  save();

  document.getElementById("copy").addEventListener("click", function () {
    var nums = [...state].sort(function (a, b) { return a - b; });
    var text = nums.length
      ? "Cleared to publish: " + nums.join(", ")
      : "Nothing cleared yet.";
    var out = document.getElementById("out");
    out.hidden = false;
    out.value = text;
    out.select();
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(function () {});
  });

  document.getElementById("clear").addEventListener("click", function () {
    state.clear();
    save();
    document.querySelectorAll(".release").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
    });
    document.getElementById("out").hidden = true;
  });
</script>
</body>
</html>
`;

const out = path.join(ROOT, "photography-review.html");
writeFileSync(out, html);
console.log(`Wrote ${out}`);
console.log(`  ${held.length} held for review, ${live.length} ready to publish`);
console.log(`Open it in a browser and mark the frames your guests cleared.`);
