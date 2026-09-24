// 3D kana keyboard: each chapter of the page presses one key.
import * as THREE from "./vendor/three.module.min.js";
import { RoundedBoxGeometry } from "./vendor/RoundedBoxGeometry.js";
import { RoomEnvironment } from "./vendor/RoomEnvironment.js";

const stage = document.getElementById("stage");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (e) {
  throw e; // page stays fully readable without 3D
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xfff4e6, 0x8a7f6c, 0.6));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(3, 6, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x9fc4ff, 1.2); rim.position.set(-4, 3, -5); scene.add(rim);
const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ---------- drawing helpers ---------- */
const F = '"Zen Kaku Gothic New","Hiragino Sans",system-ui,sans-serif';
const FS = '"Shippori Mincho","Hiragino Mincho ProN",serif';
function T(g, s, x, y, size, color, font, weight, maxW) {
  g.fillStyle = color; g.font = (weight || 700) + " " + size + "px " + (font || F);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(s, x, y, maxW || g.canvas.width * 0.84);
}
const art = {
  india(g, w, h) { g.fillStyle = "#ff9933"; g.fillRect(0, 0, w, h / 3); g.fillStyle = "#fff"; g.fillRect(0, h / 3, w, h / 3); g.fillStyle = "#138808"; g.fillRect(0, h * 2 / 3, w, h / 3); g.strokeStyle = "#000080"; g.lineWidth = h * .03; g.beginPath(); g.arc(w / 2, h / 2, h * .13, 0, 7); g.stroke(); },
  amity(g, w, h) { g.fillStyle = "#12305e"; g.fillRect(0, 0, w, h); T(g, "AMITY", w / 2, h * .46, h * .4, "#f5c542", FS, 800); },
  japan(g, w, h) { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.fillStyle = "#bc002d"; g.beginPath(); g.arc(w / 2, h / 2, h * .3, 0, 7); g.fill(); },
  python(g, w, h) { g.fillStyle = "#1e3f66"; g.fillRect(0, 0, w, h); g.fillStyle = "#ffd343"; g.beginPath(); g.arc(w * .22, h / 2, h * .2, 0, 7); g.fill(); T(g, "py", w * .62, h / 2, h * .5, "#ffd343", F, 900); },
  aws(g, w, h) { g.fillStyle = "#232f3e"; g.fillRect(0, 0, w, h); T(g, "aws", w / 2, h * .42, h * .42, "#fff", F, 900); g.strokeStyle = "#ff9900"; g.lineWidth = h * .07; g.beginPath(); g.moveTo(w * .28, h * .7); g.quadraticCurveTo(w * .5, h * .86, w * .72, h * .68); g.stroke(); },
  why(g, w, h) { g.fillStyle = "#fbf6ec"; g.fillRect(0, 0, w, h); g.strokeStyle = "#c8312b"; g.lineWidth = h * .07; g.beginPath(); g.arc(w / 2, h / 2, h * .42, 0, 7); g.stroke(); T(g, "報連相", w / 2, h / 2, h * .26, "#c8312b", FS, 800); },
  works(g, w, h) { g.fillStyle = "#2b2f3a"; g.fillRect(0, 0, w, h); T(g, "</>", w / 2, h / 2, h * .46, "#9fe0b8", F, 900); },
  faq(g, w, h) { g.fillStyle = "#3a3346"; g.fillRect(0, 0, w, h); T(g, "？", w / 2, h * .52, h * .66, "#f3d9ff", FS, 800); },
};
const special = {
  "3": { art: "india", label: "INDIA" }, E: { art: "amity", label: "2024" }, G: { art: "japan", label: "日本" },
  V: { art: "python", label: "NOW" }, J: { art: "aws", label: "NEXT" }, H: { art: "why", label: "WHY" },
  P: { art: "works", label: "WORKS" }, "/": { art: "faq", label: "FAQ" }, ENTER: { hire: true },
};
const redraws = [];

/* ---------- keyboard ---------- */
const root = new THREE.Group(); scene.add(root);
const kb = new THREE.Group(); root.add(kb); kb.rotation.x = .12;
const P = .36;
const rows = [
  [["1", "ぬ"], ["2", "ふ"], ["3", "あ"], ["4", "う"], ["5", "え"], ["6", "お"], ["7", "や"], ["8", "ゆ"], ["9", "よ"], ["0", "わ"]],
  [["Q", "た"], ["W", "て"], ["E", "い"], ["R", "す"], ["T", "か"], ["Y", "ん"], ["U", "な"], ["I", "に"], ["O", "ら"], ["P", "せ"]],
  [["A", "ち"], ["S", "と"], ["D", "し"], ["F", "は"], ["G", "き"], ["H", "く"], ["J", "ま"], ["K", "の"], ["L", "り"], ["ENTER", "採用", 2]],
  [["Z", "つ"], ["X", "さ"], ["C", "そ"], ["V", "ひ"], ["B", "こ"], ["N", "み"], ["M", "も"], [",", "ね"], [".", "る"], ["/", "め"]],
];
const caseW = 12.9 * P, caseD = 5.4 * P;
const shell = new THREE.Mesh(new RoundedBoxGeometry(caseW, .2, caseD, 4, .06), new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: .5 }));
shell.position.y = .1; kb.add(shell);
const plate = new THREE.Mesh(new THREE.BoxGeometry(caseW - .16, .02, caseD - .16), new THREE.MeshStandardMaterial({ color: 0x2c2b29, roughness: .8 }));
plate.position.y = .21; kb.add(plate);

const keys = [], byName = {};
function makeKey(name, kana, x, z, w) {
  const sp = special[name];
  const cap = new THREE.Group(); cap.position.set(x, .3, z); kb.add(cap);
  const col = sp && sp.hire ? 0xd2452f : sp ? 0x2f3440 : 0xf4f0e8;
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, .16, P - .04, 3, .04),
    new THREE.MeshStandardMaterial({ color: col, roughness: .45, emissive: sp && sp.hire ? 0x5a0d05 : 0x000000 }));
  cap.add(body);
  const c = document.createElement("canvas"); c.width = Math.round(w * 400); c.height = Math.round((P - .04) * 400);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const paint = () => {
    const g = c.getContext("2d"), cw = c.width, ch = c.height; g.clearRect(0, 0, cw, ch);
    if (sp && sp.hire) { T(g, "採用", cw * .5, ch * .44, ch * .36, "#fff", FS, 800); T(g, "ENTER ⏎", cw * .5, ch * .8, ch * .14, "#ffd9d0"); }
    else if (sp) { g.save(); g.translate(cw * .14, ch * .16); const sw = cw * .72, sh = ch * .58; g.beginPath(); g.rect(0, 0, sw, sh); g.clip(); art[sp.art](g, sw, sh); g.restore(); T(g, sp.label, cw / 2, ch * .88, ch * .15, "#e9e4da"); }
    else {
      g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = "#2a2724"; g.font = "700 " + ch * .3 + "px " + F; g.fillText(name, cw * .14, ch * .12);
      g.textAlign = "right"; g.textBaseline = "bottom"; g.fillStyle = "#b0402c"; g.font = "700 " + ch * .28 + "px " + F; g.fillText(kana, cw * .88, ch * .9);
    }
    t.needsUpdate = true;
  };
  paint(); redraws.push(paint);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - .03, P - .07), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
  face.rotation.x = -Math.PI / 2; face.position.y = .081; cap.add(face);
  const k = { name, cap, body, sp, press: 0, typed: 0 }; keys.push(k); byName[name] = k;
}
rows.forEach((row, r) => {
  let x = -caseW / 2 + .2 + r * .09;
  row.forEach(([a, kana, wu = 1]) => { const w = P * wu - .04; makeKey(a, kana, x + w / 2, -caseD / 2 + .3 + r * P, w); x += P * wu; });
});
makeKey(" ", "", 0, -caseD / 2 + .3 + 4 * P, P * 5.6 - .04);

// soft contact shadow
{
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), gr = g.createRadialGradient(128, 128, 8, 128, 128, 128);
  gr.addColorStop(0, "rgba(40,30,20,.5)"); gr.addColorStop(1, "rgba(40,30,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = .002; root.add(m);
}

/* ---------- camera: one shot per page section ---------- */
const panels = [...document.querySelectorAll(".panel")];
const n0 = V(0, .82, .57).normalize();
function framing(p, n, d) {
  const mobile = innerWidth < 760, up = V(0, 1, 0);
  if (mobile && d < 6) d *= 1.4;
  const right = up.clone().cross(n).normalize(), upv = n.clone().cross(right).normalize();
  const shift = mobile ? upv.clone().multiplyScalar(-0.17 * d) : right.clone().multiplyScalar(-0.22 * d);
  return { pos: p.clone().addScaledVector(n, d).add(shift).addScaledVector(upv, .05 * d), look: p.clone().add(shift) };
}
let KF = [];
function shots() {
  root.rotation.set(0, 0, 0); root.updateMatrixWorld(true);
  KF = panels.map((p) => {
    const k = p.dataset.key;
    if (k === "HERO") return framing(V(0, .3, 0), n0, innerWidth < 760 ? 14 : 10);
    return framing(byName[k].cap.getWorldPosition(new THREE.Vector3()), n0, k === "ENTER" ? 3.6 : k === "P" || k === "/" || k === "H" ? 4.2 : 3.2);
  });
}
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < 760 ? 40 : 32; camera.updateProjectionMatrix(); shots();
}
addEventListener("resize", resize); resize();

// scroll position -> fractional section index, measured between section centres (sections can be taller than the screen)
function progress() {
  const mid = scrollY + innerHeight / 2, c = panels.map((p) => p.offsetTop + p.offsetHeight / 2);
  if (mid <= c[0]) return 0;
  for (let i = 0; i < c.length - 1; i++) if (mid < c[i + 1]) return i + (mid - c[i]) / (c[i + 1] - c[i]);
  return c.length - 1;
}

/* ---------- interaction ---------- */
const mouse = { x: 0, y: 0, active: false };
addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; mouse.active = true; });
// real typing presses the matching 3D key; typing HIRE jumps to contact
let buf = "";
addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const n = e.key === "Enter" ? "ENTER" : e.key.length === 1 ? e.key.toUpperCase() : null;
  if (!n || !byName[n]) return;
  byName[n].typed = 1;
  buf = (buf + n).slice(-4);
  if (buf === "HIRE") document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
});

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = (x) => x * x * (3 - 2 * x), clock = new THREE.Clock();
const curPos = KF[0].pos.clone(), curLook = KF[0].look.clone();
const ray = new THREE.Raycaster(), hit = new THREE.Vector3(), plane = new THREE.Plane(V(0, 1, 0), -.38), m2 = new THREE.Vector2(), tmp = new THREE.Vector3();

function frame() {
  const t = clock.getElapsedTime(), f = progress();
  const i = Math.floor(f), j = Math.min(KF.length - 1, i + 1), k = ease(f - i);
  const pos = KF[i].pos.clone().lerp(KF[j].pos, k), look = KF[i].look.clone().lerp(KF[j].look, k), d = reduce ? 1 : .08;
  curPos.lerp(pos, d); curLook.lerp(look, d); camera.position.copy(curPos); camera.lookAt(curLook);

  const z = Math.min(1, f), ty = mouse.x * (.3 - z * .24), tx = mouse.y * (.1 - z * .07);
  root.rotation.y += (ty - root.rotation.y) * .06; root.rotation.x += (tx - root.rotation.x) * .06;
  if (!reduce) root.position.y = Math.sin(t * 1.1) * .03;

  const ch = Math.round(f), activeKey = panels[ch].dataset.key;
  m2.set(mouse.x, -mouse.y); ray.setFromCamera(m2, camera);
  const ripple = mouse.active && ch === 0 && ray.ray.intersectPlane(plane, hit);
  for (const key of keys) {
    let press = key.name === activeKey ? 1 : 0;
    if (ripple) press = Math.max(press, Math.max(0, 1 - key.cap.getWorldPosition(tmp).distanceTo(hit) / .45));
    if (key.name === "ENTER" && activeKey === "ENTER" && !reduce) press = .5 + Math.sin(t * 5) * .5;
    key.typed *= .86; press = Math.max(press, key.typed);
    const want = .3 - press * .08; key.cap.position.y += (want - key.cap.position.y) * .25;
    if (key.sp && !key.sp.hire) key.body.material.emissive.setHex(key.name === activeKey ? 0x3a2a10 : 0x000000);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
document.fonts.ready.then(() => redraws.forEach((r) => r()));
frame();
