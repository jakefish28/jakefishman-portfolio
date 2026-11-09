import * as THREE from 'three';

// Court dimensions in meters (ITF). The court's length runs along z.
const HALF_LEN = 23.77 / 2;
const HALF_DOUBLES = 10.97 / 2;
const HALF_SINGLES = 8.23 / 2;
const SERVICE = 6.4;

const CLAY = '#c4582e';
const GREEN = '#0b4d2e';
const SKY = '#a9cbe0';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('court');
const hero = canvas.parentElement;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch (e) {
  document.body.classList.add('no-webgl');
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, innerWidth < 760 ? 1.5 : 2));
renderer.setSize(hero.clientWidth, hero.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 70, 150);

const camera = new THREE.PerspectiveCamera(45, hero.clientWidth / hero.clientHeight, 0.1, 300);

scene.add(new THREE.HemisphereLight('#ffffff', '#b8673f', 1.1));
const sun = new THREE.DirectionalLight('#fff1dc', 2.4);
sun.position.set(-18, 34, 14);
sun.castShadow = true;
const shadowSize = innerWidth < 760 ? 1024 : 2048;
sun.shadow.mapSize.set(shadowSize, shadowSize);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
scene.add(sun);

// ---- Clay ----
function clayTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = CLAY;
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const light = Math.random() > 0.5;
    g.fillStyle = light ? 'rgba(232,140,96,0.35)' : 'rgba(120,48,20,0.3)';
    g.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(14, 14);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.MeshStandardMaterial({ map: clayTexture(), roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---- Lines ----
const lineMat = new THREE.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.9 });
function line(x, z, w, d) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.01, d), lineMat);
  m.position.set(x, 0.005, z);
  m.receiveShadow = true;
  scene.add(m);
}
const LW = 0.05;
for (const s of [-1, 1]) {
  line(0, s * HALF_LEN, HALF_DOUBLES * 2 + LW, LW * 2);       // baselines
  line(s * HALF_DOUBLES, 0, LW, HALF_LEN * 2);                // doubles sidelines
  line(s * HALF_SINGLES, 0, LW, HALF_LEN * 2);                // singles sidelines
  line(0, s * SERVICE, HALF_SINGLES * 2, LW);                 // service lines
  line(0, s * (HALF_LEN - 0.05), LW, 0.1);                    // center marks
}
line(0, 0, LW, SERVICE * 2);                                  // center service line

// ---- Net ----
function netTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(20,20,20,0.9)';
  g.lineWidth = 3;
  g.strokeRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(128, 9);
  return t;
}
const postX = HALF_DOUBLES + 0.914;
const net = new THREE.Mesh(
  new THREE.PlaneGeometry(postX * 2, 0.93),
  new THREE.MeshStandardMaterial({ map: netTexture(), transparent: true, alphaTest: 0.2, side: THREE.DoubleSide })
);
net.position.y = 0.93 / 2;
net.castShadow = true;
scene.add(net);
const tape = new THREE.Mesh(new THREE.BoxGeometry(postX * 2, 0.06, 0.02), lineMat);
tape.position.y = 0.94;
scene.add(tape);
const postMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.6 });
for (const s of [-1, 1]) {
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.07, 12), postMat);
  post.position.set(s * postX, 0.535, 0);
  post.castShadow = true;
  scene.add(post);
}

// ---- Walls and stands ----
const wallMat = new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.85 });
const standMats = ['#155c39', '#0f5232', '#1c6741'].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
function stands(width, z, xAxis) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 2.4, 0.4), wallMat);
  wall.position.set(0, 1.2, 0);
  const group = new THREE.Group();
  group.add(wall);
  for (let i = 0; i < 9; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(width, 0.6, 1.2), standMats[i % 3]);
    step.position.set(0, 2.4 + i * 0.6, 0.9 + i * 1.1);
    group.add(step);
  }
  group.traverse((o) => { o.castShadow = o.receiveShadow = true; });
  if (xAxis) {
    group.rotation.y = Math.sign(z) * Math.PI / 2;
    group.position.set(z, 0, 0);
  } else {
    group.rotation.y = z > 0 ? 0 : Math.PI;
    group.position.set(0, 0, z);
  }
  scene.add(group);
}
stands(40, 20, false);
stands(40, -20, false);
stands(40, 13, true);
stands(40, -13, true);

// ---- Ball marks ----
const markGeo = new THREE.CircleGeometry(0.11, 20);
const marks = [];
function addMark(x, z, angle = 0) {
  const m = new THREE.Mesh(markGeo, new THREE.MeshBasicMaterial({ color: '#8a3518', transparent: true, opacity: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = angle;
  m.scale.set(1, 1.9, 1);
  m.position.set(x, 0.012, z);
  scene.add(m);
  marks.push({ m, age: 0 });
}

// ---- Rally ----
const BALL_R = 0.1;
const ballGeo = new THREE.SphereGeometry(BALL_R, 20, 14);
const ballMat = new THREE.MeshStandardMaterial({ color: '#dcf04e', roughness: 0.6, emissive: '#3a4200', emissiveIntensity: 0.25 });
const ball = new THREE.Mesh(ballGeo, ballMat);
ball.castShadow = true;
scene.add(ball);

const arc = (a, b, t, h) => new THREE.Vector3(
  a.x + (b.x - a.x) * t,
  a.y + (b.y - a.y) * t + 4 * h * t * (1 - t) + BALL_R,
  a.z + (b.z - a.z) * t
);

let shot;
let side = 1;
function newShot(from) {
  side *= -1;
  const land = new THREE.Vector3((Math.random() * 2 - 1) * (HALF_SINGLES - 0.5), 0, side * (4 + Math.random() * 7));
  const dir = land.clone().sub(from).setY(0).normalize();
  const end = land.clone().addScaledVector(dir, 2.5 + Math.random()).setY(0.9);
  shot = { from: from.clone(), land, end, dir, t: 0, d1: 0.95 + Math.random() * 0.35, d2: 0.45, h1: 1.4 + Math.random(), h2: 1.1, marked: false };
}
newShot(new THREE.Vector3(0, 1, HALF_LEN));
if (reduceMotion) ball.visible = false;

function updateRally(dt) {
  shot.t += dt;
  if (shot.t < shot.d1) {
    ball.position.copy(arc(shot.from, shot.land, shot.t / shot.d1, shot.h1));
    return;
  }
  if (!shot.marked) {
    addMark(shot.land.x, shot.land.z, Math.atan2(shot.dir.x, shot.dir.z));
    shot.marked = true;
  }
  const u = Math.min((shot.t - shot.d1) / shot.d2, 1);
  ball.position.copy(arc(shot.land, shot.end, u, shot.h2));
  if (u >= 1) newShot(shot.end);
}

// ---- Click the court to drop a ball ----
const drops = [];
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
// A click, not pointerdown, so starting a scroll on a phone doesn't drop a ball.
hero.addEventListener('click', (e) => {
  if (e.target.closest('a, button, .stats')) return;
  const r = canvas.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObject(ground)[0];
  if (!hit) return;
  const m = new THREE.Mesh(ballGeo, ballMat);
  m.castShadow = true;
  m.position.set(hit.point.x, 4, hit.point.z);
  scene.add(m);
  drops.push({ m, vy: 0, life: 0, landed: false });
});

function updateDrops(dt) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i];
    d.life += dt;
    d.vy -= 9.8 * dt;
    d.m.position.y += d.vy * dt;
    if (d.m.position.y <= BALL_R) {
      d.m.position.y = BALL_R;
      if (!d.landed) {
        addMark(d.m.position.x, d.m.position.z, Math.random() * Math.PI);
        d.landed = true;
      }
      d.vy = Math.abs(d.vy) * 0.55;
    }
    if (d.life > 3) {
      scene.remove(d.m);
      drops.splice(i, 1);
    }
  }
}

function updateMarks(dt) {
  for (let i = marks.length - 1; i >= 0; i--) {
    const k = marks[i];
    k.age += dt;
    if (k.age > 6) k.m.material.opacity = Math.max(0, 0.85 * (1 - (k.age - 6) / 4));
    if (k.age > 10) {
      scene.remove(k.m);
      k.m.material.dispose();
      marks.splice(i, 1);
    }
  }
}

// ---- Camera ----
// Behind the baseline at rest; as the hero scrolls away the camera rises
// toward the broadcast view from above.
const START = { pos: new THREE.Vector3(6.5, 1.8, 18), look: new THREE.Vector3(-1.5, 0.8, 0) };
const END = { pos: new THREE.Vector3(0.6, 24, 9), look: new THREE.Vector3(0, 0, 0) };

const mouse = new THREE.Vector2();
hero.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  mouse.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
});

const camPos = START.pos.clone();
const camLook = START.look.clone();
const target = new THREE.Vector3();
const targetLook = new THREE.Vector3();
function updateCamera(dt) {
  const p = Math.min(Math.max(-hero.getBoundingClientRect().top / hero.offsetHeight, 0), 1);
  const t = p * p * (3 - 2 * p);
  target.lerpVectors(START.pos, END.pos, t);
  targetLook.lerpVectors(START.look, END.look, t);
  const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 5);
  camPos.lerp(target, k);
  camLook.lerp(targetLook, k);
  camera.position.copy(camPos);
  if (!reduceMotion) camera.position.add(new THREE.Vector3(mouse.x * 0.6, -mouse.y * 0.3, 0));
  camera.lookAt(camLook);
}

// ---- Loop: only render while the hero is on screen ----
// Watches the hero itself, so a phone's address bar sliding away doesn't clear
// the canvas and cause a flicker.
let heroW = hero.clientWidth;
let heroH = hero.clientHeight;
new ResizeObserver(() => {
  if (hero.clientWidth === heroW && hero.clientHeight === heroH) return;
  heroW = hero.clientWidth;
  heroH = hero.clientHeight;
  camera.aspect = heroW / heroH;
  camera.updateProjectionMatrix();
  renderer.setSize(heroW, heroH, false);
  renderer.render(scene, camera);
}).observe(hero);

updateCamera(0);
renderer.render(scene, camera);
canvas.classList.add('ready');

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!reduceMotion) updateRally(dt);
  updateDrops(dt);
  updateMarks(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
}
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    clock.getDelta();
    renderer.setAnimationLoop(frame);
  } else {
    renderer.setAnimationLoop(null);
  }
}).observe(hero);
