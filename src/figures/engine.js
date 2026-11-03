// Shared runner for the "how it works" figures.
// A figure gives: steps, a pure model() for its numbers, and build() for its 3D parts.
// The engine draws step buttons, the Manual/Auto switch, sound words, labels,
// a speed badge and live numbers, all read from the same model.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { t as tr } from '../i18n.js';
import { store } from '../util.js';
import { speedLabel } from './speed.js';

export const INK = 0x1d2a44;

// Three-tone toon ramp: flat fills with a light top and darker sides.
let ramp;
function gradient() {
  if (ramp) return ramp;
  const data = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  ramp = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return ramp;
}

export function mat(color, extra = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: gradient(), ...extra });
}

// Adds a mesh with an inked outline.
export function part(parent, geometry, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, outline = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  if (outline) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), new THREE.LineBasicMaterial({ color: INK }));
    m.add(e);
  }
  parent.add(m);
  return m;
}

// A cylinder lying along z (rollers, drums).
export function roller(parent, r, len, color, pos) {
  return part(parent, new THREE.CylinderGeometry(r, r, len, 28), mat(color), { ...pos, rx: Math.PI / 2 });
}

// Dithered floor shadow, warm grey.
function shadowPlane(w, d) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  for (let y = 0; y < 128; y += 2) for (let x = 0; x < 128; x += 2) {
    const dx = (x - 64) / 64, dy = (y - 64) / 64, r = dx * dx + dy * dy;
    const p = Math.max(0, 1 - r) * 0.9;
    if (((x / 2 + y / 2) % 2 === 0 ? 0.25 : 0.75) < p) { g.fillStyle = '#c9bea8'; g.fillRect(x, y, 2, 2); }
  }
  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  m.rotation.x = -Math.PI / 2; m.position.y = -0.01;
  return m;
}

export function mountFigure(root, fig) {
  const autoKey = 'fg-fig-auto';
  root.innerHTML = `
    <div class="card fig">
      <div class="fighead">
        <div class="hint" aria-live="polite"></div>
        <div style="display:flex;gap:8px;align-items:center">
          <div class="toggle" role="group" aria-label="Mode"><button data-m="manual">${tr('manual')}</button><button data-m="auto">${tr('auto')}</button></div>
          <button class="btn ghost sm" data-reset>${tr('start')}</button>
        </div>
      </div>
      <div class="figbody">
        <div class="stepbtns" role="group" aria-label="Steps"></div>
        <div class="stage"><span class="speed"></span><span class="sfx"></span><span class="drag">${tr('dragToTurn')}</span></div>
      </div>
      ${fig.slider ? `<label class="slider"><span>${fig.slider.label}</span><input type="range" min="${fig.slider.min}" max="${fig.slider.max}" step="${fig.slider.step}" value="${fig.slider.value}"><b class="sv"></b></label>` : ''}
      <div class="gauges"></div>
      <div class="big"><b>${tr('bigIdea')}</b> ${fig.bigIdea}</div>
    </div>`;

  const stage = root.querySelector('.stage');
  const hintEl = root.querySelector('.hint');
  const btnWrap = root.querySelector('.stepbtns');
  const gaugesEl = root.querySelector('.gauges');
  const sfxEl = root.querySelector('.sfx');
  const speedEl = root.querySelector('.speed');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- three.js scene
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xf5f0e5);
  stage.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
  camera.position.set(...fig.camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfbd, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6); sun.position.set(4, 8, 6); scene.add(sun);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(...fig.target);
  controls.enableDamping = true; controls.enablePan = false;
  controls.minDistance = fig.zoom?.[0] ?? 6; controls.maxDistance = fig.zoom?.[1] ?? 30;
  controls.maxPolarAngle = Math.PI * 0.55;
  const baseDist = camera.position.distanceTo(controls.target);
  controls.maxDistance = Math.max(controls.maxDistance, baseDist * 3);
  const sh = shadowPlane(fig.shadow[0], fig.shadow[1]); sh.position.x = fig.target[0]; scene.add(sh);

  const world = new THREE.Group(); scene.add(world);
  const api = fig.build(world, THREE);

  // labels
  const labels = (api.labels || []).map((l) => {
    const el = document.createElement('span'); el.className = 'label'; el.textContent = l.text; stage.appendChild(el);
    return { el, pos: new THREE.Vector3(...l.at) };
  });
  const v = new THREE.Vector3();
  function project(p, el) {
    v.copy(p).project(camera);
    const w = stage.clientWidth, h = stage.clientHeight;
    el.style.left = `${(v.x * 0.5 + 0.5) * w}px`; el.style.top = `${(-v.y * 0.5 + 0.5) * h}px`;
    el.style.visibility = v.z < 1 ? 'visible' : 'hidden';
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    // Pull the camera back on tall, narrow screens so the whole machine fits.
    const want = baseDist * Math.max(1, (fig.fitAspect ?? 1.3) / camera.aspect);
    const dir = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, want);
  }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();

  // ---- step state
  let cur = 0; let running = -1; let t0 = 0; let auto = store.get(autoKey, false); let timer = null; let sfxAt = null;
  const state = { slider: fig.slider?.value };

  function setGauges(step, t) {
    gaugesEl.innerHTML = fig.gauges(fig.model(step, t, state)).map(([k, val]) => `<span>${k} <b>${val}</b></span>`).join('');
  }
  function renderBtns() {
    btnWrap.innerHTML = fig.steps.map((s, i) => {
      const cls = i === running ? 'run' : i < cur ? 'fin' : i === cur && !auto && running < 0 ? 'next' : '';
      const dis = running >= 0 || i !== cur || auto;
      return `<button class="${cls}" ${dis ? 'disabled' : ''} data-i="${i}"><i>${i < cur ? '✓' : i + 1}</i>${s.name}</button>`;
    }).join('');
  }
  function setMode(a) {
    auto = a; store.set(autoKey, a);
    root.querySelectorAll('[data-m]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.m === 'auto') === a)));
    reset(); if (a) play(0);
  }
  function reset() {
    clearTimeout(timer); running = -1; cur = 0;
    hintEl.textContent = fig.idleHint;
    api.update(-1, 0, state); setGauges(-1, 0); renderBtns();
    sfxEl.style.opacity = 0; speedEl.style.opacity = 0;
  }
  function play(i) {
    if (i !== cur || running >= 0) return;
    const s = fig.steps[i];
    running = i; t0 = performance.now();
    hintEl.textContent = s.hint;
    sfxEl.textContent = s.sfx || ''; sfxAt = s.sfxAt ? new THREE.Vector3(...s.sfxAt) : null; sfxEl.style.opacity = s.sfx ? 1 : 0;
    const sp = speedLabel(typeof s.real === 'function' ? s.real(state) : s.real, s.dur); speedEl.textContent = sp; speedEl.style.opacity = sp ? 1 : 0;
    renderBtns();
  }
  function finish(i) {
    running = -1; cur = i + 1; sfxEl.style.opacity = 0; speedEl.style.opacity = 0;
    if (cur >= fig.steps.length) hintEl.textContent = fig.doneHint;
    renderBtns();
    if (auto) timer = setTimeout(() => { if (cur >= fig.steps.length) { reset(); } play(cur); }, 900);
  }

  btnWrap.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) play(+b.dataset.i); });
  root.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.m === 'auto')));
  root.querySelector('[data-reset]').addEventListener('click', () => { if (auto) setMode(false); else reset(); });
  const slider = root.querySelector('.slider input');
  if (slider) {
    const sv = root.querySelector('.sv');
    const upd = () => { state.slider = +slider.value; sv.textContent = fig.slider.format(state.slider); setGauges(running >= 0 ? running : cur - 1, running >= 0 ? 0.5 : 1); };
    slider.addEventListener('input', upd); upd();
  }
  function onKey(e) {
    if ((e.key === ' ' || e.key === 'Enter') && e.target === document.body) { e.preventDefault(); if (!auto) { if (cur >= fig.steps.length) reset(); else play(cur); } }
  }
  document.addEventListener('keydown', onKey);

  // ---- loop
  let raf; let alive = true;
  function frame(now) {
    if (!alive) return;
    if (running >= 0) {
      const s = fig.steps[running];
      const tt = reduce ? 1 : Math.min(1, (now - t0) / s.dur);
      api.update(running, tt, state, now); setGauges(running, tt);
      if (tt >= 1) finish(running);
    } else if (api.idle) {
      api.idle(cur - 1, now, state);
    }
    controls.update();
    renderer.render(scene, camera);
    labels.forEach((l) => project(l.pos, l.el));
    if (sfxAt) project(sfxAt, sfxEl);
    raf = requestAnimationFrame(frame);
  }
  root.querySelectorAll('[data-m]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.m === 'auto') === auto)));
  reset(); if (auto) play(0);
  raf = requestAnimationFrame(frame);

  return function dispose() {
    alive = false; cancelAnimationFrame(raf); clearTimeout(timer); ro.disconnect();
    document.removeEventListener('keydown', onKey);
    controls.dispose();
    scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; (Array.isArray(m) ? m : [m]).forEach((x) => { x?.map?.dispose?.(); x?.dispose?.(); }); });
    renderer.dispose(); renderer.forceContextLoss?.();
  };
}
