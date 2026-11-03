// Figure 01: how a laser printer puts toner on paper.
import { mat, part, roller, INK } from './engine.js';
import { printerModel, printerNumbers, PRINTER } from './models.js';

const N = printerNumbers();

// Paper path through the side cutaway (x along the printer, y up).
const PATH = [
  [0.4, 0.63], [1.9, 0.63], [2.55, 1.0], [2.6, 1.5], [2.2, 1.64], [0.8, 1.64], [-1.2, 1.64],
  [-2.3, 1.85], [-2.6, 2.6], [-2.55, 3.8], [-2.1, 4.34], [0.3, 4.34]
];
const LEN = [0];
for (let i = 1; i < PATH.length; i++) LEN.push(LEN[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
const at = (s) => {
  s = Math.max(0, Math.min(LEN[LEN.length - 1], s));
  let i = 1; while (i < LEN.length - 1 && LEN[i] < s) i++;
  const k = (s - LEN[i - 1]) / (LEN[i] - LEN[i - 1] || 1);
  const [x0, y0] = PATH[i - 1], [x1, y1] = PATH[i];
  return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, a: Math.atan2(y1 - y0, x1 - x0) };
};
const S_READY = LEN[4] - 0.75;          // waiting before the drum
const S_AFTER_TRANSFER = LEN[5] + 0.8;  // past the drum
const S_AFTER_FUSER = LEN[7] + 0.4;     // past the fuser
const S_END = LEN[LEN.length - 1] - 0.2;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// Text lines that make up the "page" image.
const LINES = [0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84].map((y, i) => ({ y, w: i === 0 ? 0.5 : 0.55 + ((i * 37) % 30) / 100 }));

export default {
  id: 'printer',
  camera: [6.5, 5.2, 13.5], target: [0, 2.1, 0], shadow: [9, 5.5], zoom: [7, 26],
  idleHint: 'Press step 1 to pull a sheet in.',
  doneHint: 'Page printed. Press Start over to run it again.',
  bigIdea: 'static electricity draws the page on the drum, and heat makes the toner stay on the paper.',
  steps: [
    { name: 'Pull a sheet in', hint: 'The pickup roller grabs one sheet from the tray.', sfx: 'whirr', sfxAt: [2.2, 1.2, 1.6], dur: 2200, real: 0.6 },
    { name: 'Charge the drum', hint: `A roller gives the green drum a static charge of ${PRINTER.drumChargeV} V all over.`, sfx: 'bzzt', sfxAt: [0.2, 2.4, 1.6], dur: 1600, real: 0.4 },
    { name: 'Draw with the laser', hint: 'The laser draws the page on the drum. Where it hits, the charge drops. You can\'t see it yet.', sfx: 'zzzt', sfxAt: [1.4, 3.0, 1.6], dur: 2600, real: N.scanSec },
    { name: 'Stick the toner', hint: 'Toner powder is charged too. It jumps onto the spots the laser drew, and nowhere else.', sfx: 'fffsh', sfxAt: [1.6, 2.0, 1.6], dur: 2000, real: N.scanSec },
    { name: 'Press it onto paper', hint: 'A roller under the paper pulls the toner off the drum and onto the sheet.', sfx: 'shhk', sfxAt: [0.8, 1.2, 1.6], dur: 2400, real: N.scanSec },
    { name: 'Melt it in', hint: `Hot rollers at about ${PRINTER.fuserC} °C melt the toner into the paper so it can't rub off.`, sfx: 'hsss', sfxAt: [-1.2, 2.3, 1.6], dur: 2400, real: N.scanSec },
    { name: 'Page out', hint: 'The finished page comes out on top. It feels warm because it just went through the fuser.', sfx: 'flap', sfxAt: [-1.0, 4.9, 1.0], dur: 1800, real: 0.6 }
  ],
  model: (step, t) => printerModel(step, t),
  gauges: (m) => [
    ['fuser', `${m.fuserC} °C`],
    ['drum', `${m.drumV} V${m.exposedV ? ` · ${m.exposedV} V where drawn` : ''}`],
    ['laser', m.laser ? `on · ${PRINTER.laserNm} nm` : 'off'],
    ['drum speed', `${m.drumRpm} rpm`],
    ['paper', `${m.paperMmS} mm/s`],
    ['one page', `${m.secPerPage.toFixed(2)} s at ${PRINTER.ppm} ppm`],
    ['tray', `${m.sheets}`]
  ],

  build(world, THREE) {
    const cream = mat(0xece9df), cream2 = mat(0xdcd8cb), dark = mat(0x3a3f44), black = mat(0x1d2024);
    const W = 3.2; // depth along z

    // Shell: back, bottom, left, right, top. The front side is cut away.
    part(world, new THREE.BoxGeometry(6, 4.2, 0.08), cream2, { y: 2.1, z: -W / 2 });
    part(world, new THREE.BoxGeometry(6, 0.1, W), cream, { y: 0.05 });
    part(world, new THREE.BoxGeometry(0.1, 4.2, W), cream, { x: -3, y: 2.1 });
    part(world, new THREE.BoxGeometry(0.1, 4.2, W), cream, { x: 3, y: 2.1 });
    part(world, new THREE.BoxGeometry(5.1, 0.1, W), cream, { x: 0.45, y: 4.2 });
    // Cutaway outline (red dashes) on the open side.
    const cut = new THREE.BufferGeometry().setFromPoints([[-3, 0], [3, 0], [3, 4.2], [-3, 4.2], [-3, 0]].map(([x, y]) => new THREE.Vector3(x, y, W / 2)));
    const cutLine = new THREE.Line(cut, new THREE.LineDashedMaterial({ color: 0xc23b22, dashSize: 0.18, gapSize: 0.12 }));
    cutLine.computeLineDistances(); world.add(cutLine);

    // Control panel with a tiny display.
    const lcdCanvas = document.createElement('canvas'); lcdCanvas.width = 256; lcdCanvas.height = 64;
    const lcdTex = new THREE.CanvasTexture(lcdCanvas);
    part(world, new THREE.BoxGeometry(1.4, 0.18, 0.9), dark, { x: 2.1, y: 4.32, z: 0.9 });
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), new THREE.MeshBasicMaterial({ map: lcdTex }));
    lcd.rotation.x = -Math.PI / 2; lcd.position.set(2.1, 4.42, 0.9); world.add(lcd);
    let lcdText = '';
    const setLcd = (txt) => {
      if (txt === lcdText) return; lcdText = txt;
      const g = lcdCanvas.getContext('2d'); g.fillStyle = '#14201B'; g.fillRect(0, 0, 256, 64);
      g.fillStyle = '#8FD3AE'; g.font = '600 30px monospace'; g.fillText(txt, 16, 43); lcdTex.needsUpdate = true;
    };

    // Paper tray and stack.
    part(world, new THREE.BoxGeometry(3.4, 0.08, W - 0.3), cream2, { x: 0.4, y: 0.16 });
    part(world, new THREE.BoxGeometry(0.12, 0.7, W - 0.2), cream2, { x: 2.75, y: 0.45 });
    const stack = part(world, new THREE.BoxGeometry(2.4, 0.38, 2.6), mat(0xffffff), { x: 0.4, y: 0.4 });

    // Output tray on top (a shallow slope).
    part(world, new THREE.BoxGeometry(2.8, 0.06, 2.8), cream2, { x: -0.6, y: 4.27, rz: -0.03 });

    // Rollers.
    const pick = roller(world, 0.22, 2.4, 0x55595e, { x: 1.4, y: 0.84 });
    const drum = roller(world, 0.3, 2.8, 0x2b6650, { x: 0.8, y: 1.95 });
    const charge = roller(world, 0.1, 2.7, 0x3a3f44, { x: 0.34, y: 2.12 });
    const dev = roller(world, 0.13, 2.7, 0x55595e, { x: 1.25, y: 2.06 });
    const transfer = roller(world, 0.13, 2.7, 0x3a3f44, { x: 0.8, y: 1.48 });
    const heat = roller(world, 0.24, 2.7, 0x7a3a24, { x: -1.2, y: 1.89 });
    const press = roller(world, 0.2, 2.7, 0x55595e, { x: -1.2, y: 1.39 });
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 2.72, 24), new THREE.MeshBasicMaterial({ color: 0xff6a2a, transparent: true, opacity: 0 }));
    glow.rotation.x = Math.PI / 2; glow.position.set(-1.2, 1.89, 0); world.add(glow);

    // Drum surface: shows the invisible drawing, then the toner on it.
    const dc = document.createElement('canvas'); dc.width = 256; dc.height = 64;
    const drumTex = new THREE.CanvasTexture(dc); drumTex.wrapS = THREE.RepeatWrapping;
    drum.material = mat(0xffffff, { map: drumTex });
    let drumKey = '';
    const paintDrum = (latent, toner, cleared, charged) => {
      const key = [latent, toner, cleared, charged].map((x) => x.toFixed(2)).join();
      if (key === drumKey) return; drumKey = key;
      const g = dc.getContext('2d');
      g.fillStyle = charged > 0 ? '#2b6650' : '#3d7a60'; g.fillRect(0, 0, 256, 64);
      if (charged > 0) { g.fillStyle = `rgba(120,160,255,${0.35 * charged})`; g.fillRect(0, 0, 256, 64); }
      LINES.forEach((l, i) => {
        const x = l.y * 256, f = i / LINES.length;
        if (f < cleared) return;
        if (f < toner) { g.fillStyle = '#111'; g.fillRect(x, 64 * (0.5 - l.w / 2), 12, 64 * l.w); }
        else if (f < latent) { g.fillStyle = '#bfe8d0'; g.fillRect(x, 64 * (0.5 - l.w / 2), 12, 64 * l.w); }
      });
      drumTex.needsUpdate = true;
    };

    // Toner cartridge, split so the laser can reach the drum.
    part(world, new THREE.BoxGeometry(0.75, 0.6, 2.9), black, { x: 0.2, y: 2.62 });
    part(world, new THREE.BoxGeometry(0.95, 0.75, 2.9), black, { x: 1.55, y: 2.55 });

    // Laser scanner, spinning mirror and beam.
    part(world, new THREE.BoxGeometry(1.7, 0.35, 1.4), mat(0x2a3a5c), { x: 0.95, y: 3.5 });
    const mirror = part(world, new THREE.CylinderGeometry(0.22, 0.22, 0.12, 6), mat(0xb8c4d0), { x: 1.4, y: 3.74 });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 8), new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
    beam.position.set(0.8, 2.82, 0); beam.visible = false; world.add(beam);

    // Faint paper route.
    const curve = new THREE.CatmullRomCurve3(PATH.map(([x, y]) => new THREE.Vector3(x, y - 0.03, -1.35)));
    world.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.02, 6), new THREE.MeshBasicMaterial({ color: 0x9aa39d })));

    // The sheet. Its top face carries the printed image.
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 256;
    const sheetTex = new THREE.CanvasTexture(sc);
    const white = new THREE.MeshToonMaterial({ color: 0xffffff });
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.025, 2.5), [white, white, new THREE.MeshBasicMaterial({ map: sheetTex }), white, white, white]);
    sheet.add(new THREE.LineSegments(new THREE.EdgesGeometry(sheet.geometry), new THREE.LineBasicMaterial({ color: INK })));
    world.add(sheet);
    let sheetKey = '';
    const paintSheet = (printed, fused) => {
      const key = printed.toFixed(2) + fused.toFixed(2);
      if (key === sheetKey) return; sheetKey = key;
      const g = sc.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 256);
      LINES.forEach((l, i) => {
        const f = 1 - (i + 1) / LINES.length; // the leading edge prints first
        if (f >= printed) return;
        const x = (1 - l.y) * 128 - 6, y0 = 256 * (0.5 - l.w / 2), h = 256 * l.w;
        if (f < 1 - fused) { // not fused yet: loose grey powder
          g.fillStyle = '#8a8a8a';
          for (let k = 0; k < 60; k++) g.fillRect(x + ((k * 7) % 8), y0 + ((k * 53) % h), 2, 2);
          g.globalAlpha = 0.5; g.fillRect(x, y0, 8, h); g.globalAlpha = 1;
        } else { g.fillStyle = '#111'; g.fillRect(x, y0, 8, h); }
      });
      sheetTex.needsUpdate = true;
    };
    const placeSheet = (s) => { const p = at(s); sheet.position.set(p.x, p.y, 0); sheet.rotation.set(0, 0, p.a); };

    function update(step, t, _state, now = performance.now()) {
      const e = ease(t);
      const m = printerModel(step, t);
      // spinning parts
      const spin = (now / 1000) * 6;
      pick.rotation.y = step === 0 ? -spin : pick.rotation.y;
      if (m.drumRpm) { drum.rotation.y = -spin * 0.8; dev.rotation.y = spin; charge.rotation.y = spin; transfer.rotation.y = spin * 0.8; }
      if (step === 4 || step === 5) { heat.rotation.y = -spin; press.rotation.y = spin; }
      mirror.rotation.y = step === 2 ? spin * 8 : mirror.rotation.y;
      beam.visible = step === 2 && Math.sin(now / 25) > -0.3;
      beam.position.z = step === 2 ? Math.sin(now / 90) * 1.1 : 0;
      glow.material.opacity = Math.max(0, (m.fuserC - 60) / 140) * (0.18 + 0.08 * Math.sin(now / 120));

      // sheet route and image
      let s = LEN[0], printed = 0, fused = 0;
      if (step < 0) { sheet.visible = false; }
      else {
        sheet.visible = true;
        if (step === 0) s = LEN[0] + (S_READY - LEN[0]) * e;
        else if (step <= 3) s = S_READY;
        else if (step === 4) { s = S_READY + (S_AFTER_TRANSFER - S_READY) * e; printed = t; }
        else if (step === 5) { s = S_AFTER_TRANSFER + (S_AFTER_FUSER - S_AFTER_TRANSFER) * e; printed = 1; fused = t; }
        else { s = S_AFTER_FUSER + (S_END - S_AFTER_FUSER) * e; printed = 1; fused = 1; }
      }
      placeSheet(s); paintSheet(printed, fused);
      stack.scale.y = step >= 0 ? 0.97 : 1;

      // drum image
      const charged = step === 1 ? t : step >= 2 && step <= 4 ? 1 : 0;
      const latent = step === 2 ? t : step >= 3 && step <= 4 ? 1 : 0;
      const toner = step === 3 ? t : step === 4 ? 1 : 0;
      const cleared = step === 4 ? t : 0;
      paintDrum(latent, toner, cleared, charged);
      setLcd(step < 0 ? 'READY' : step === 6 && t > 0.9 ? 'DONE' : step >= 1 && step <= 4 ? 'WARMING' : 'PRINTING');
    }
    function idle(lastStep, now) {
      // Keep the finished scene still, but let the fuser cool glow flicker.
      if (lastStep >= 5) glow.material.opacity = 0.18 + 0.05 * Math.sin(now / 160);
    }

    return {
      update, idle,
      labels: [
        { text: 'pickup roller', at: [1.4, 0.84, 1.85] },
        { text: 'drum', at: [0.8, 1.95, 1.85] },
        { text: 'laser', at: [0.95, 3.5, 1.2] },
        { text: 'toner', at: [1.55, 2.55, 1.85] },
        { text: 'fuser', at: [-1.2, 1.9, 1.85] },
        { text: 'paper tray', at: [-0.4, 0.4, 1.7] }
      ]
    };
  }
};
