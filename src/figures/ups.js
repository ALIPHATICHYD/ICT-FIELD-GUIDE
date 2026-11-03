// Figure 02: how a UPS keeps a PC on when the power goes off.
import { mat, part } from './engine.js';
import { upsModel, upsRuntimeMin, UPS } from './models.js';

const fmtMin = (m) => (m == null ? '—' : !isFinite(m) ? '∞' : m >= 1 ? `${Math.round(m)} min` : `${Math.round(m * 60)} s`);

export default {
  id: 'ups',
  camera: [3, 6.5, 15], target: [0, 1.5, 0], shadow: [13, 5], zoom: [7, 28], fitAspect: 1.9,
  idleHint: 'Press step 1 to switch the mains on.',
  doneHint: 'That was a full power cut. Move the load slider and run it again.',
  bigIdea: 'a UPS is a battery and a very fast switch. It buys you minutes to save work, not hours.',
  slider: { label: 'Load on the UPS', min: 40, max: 450, step: 10, value: 120, format: (w) => `${w} W${w > UPS.maxW ? ' · overload!' : ''}` },
  steps: [
    { name: 'Mains on', hint: 'Power from the wall goes through the UPS to the PC. A charger keeps the battery full.', sfx: 'hmmm', sfxAt: [-1.2, 3.4, 1.6], dur: 2400 },
    { name: 'Power cut', hint: `The wall power stops. A relay clicks and the inverter takes over in about ${UPS.transferMs} ms, too fast for the PC to notice.`, sfx: 'klik!', sfxAt: [0.5, 3.3, 1.6], dur: 2200, real: UPS.transferMs / 1000 },
    { name: 'Run on battery', hint: 'The inverter turns 12 V from the battery into mains power. The UPS beeps every 30 seconds to tell you.', sfx: 'beep… beep', sfxAt: [0, 3.6, 1.6], dur: 3000, real: (s) => Math.max(0, upsRuntimeMin(s.slider) - UPS.lowBatteryMin) * 60 },
    { name: 'Low battery', hint: 'Fast beeping means about 2 minutes left. Save work and shut the PC down properly.', sfx: 'beep-beep-beep', sfxAt: [0, 3.6, 1.6], dur: 2600, real: UPS.lowBatteryMin * 60 },
    { name: 'Power back', hint: 'Mains returns, the relay clicks back and the charger slowly refills the battery. That takes hours, not minutes.', sfx: 'klik', sfxAt: [0.5, 3.3, 1.6], dur: 2400 }
  ],
  model: (step, t, state) => upsModel(step, t, state.slider),
  gauges: (m) => [
    ['mains', m.mains ? 'on' : 'off'],
    ['load', `${m.loadW} W${m.overload ? ' (over ' + UPS.maxW + ' W)' : ''}`],
    ['battery', `${Math.round(m.charge)}%`],
    ['runtime at this load', fmtMin(m.runtimeMin)],
    ['time left', m.onBattery ? fmtMin(m.minutesLeft) : '—'],
    ['switch time', `${m.transferMs} ms`],
    ['beeping', m.beeping || 'no']
  ],

  build(world, THREE) {
    const D = 2.6;
    const shell = mat(0x2a2e33), shell2 = mat(0x3a3f44);

    // Wall with socket.
    part(world, new THREE.BoxGeometry(0.2, 4.2, 4), mat(0xe6e0d2), { x: -6, y: 2.1 });
    part(world, new THREE.BoxGeometry(0.15, 0.7, 0.7), mat(0xffffff), { x: -5.85, y: 1.0, z: 0.6 });

    // UPS body, front side cut away.
    part(world, new THREE.BoxGeometry(2.4, 3.2, 0.08), shell2, { y: 1.6, z: -D / 2 });
    part(world, new THREE.BoxGeometry(2.4, 0.1, D), shell, { y: 0.05 });
    part(world, new THREE.BoxGeometry(2.4, 0.1, D), shell, { y: 3.2 });
    part(world, new THREE.BoxGeometry(0.1, 3.2, D), shell, { x: -1.2, y: 1.6 });
    part(world, new THREE.BoxGeometry(0.1, 3.2, D), shell, { x: 1.2, y: 1.6 });
    const cut = new THREE.BufferGeometry().setFromPoints([[-1.2, 0], [1.2, 0], [1.2, 3.25], [-1.2, 3.25], [-1.2, 0]].map(([x, y]) => new THREE.Vector3(x, y, D / 2)));
    const cl = new THREE.Line(cut, new THREE.LineDashedMaterial({ color: 0xc23b22, dashSize: 0.16, gapSize: 0.1 })); cl.computeLineDistances(); world.add(cl);

    // Status lights on top.
    const ledG = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0x2ecc71 }));
    const ledA = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xf2a900 }));
    ledG.position.set(-0.35, 3.3, 0.9); ledA.position.set(0.05, 3.3, 0.9); world.add(ledG, ledA);

    // Battery with a charge bar.
    part(world, new THREE.BoxGeometry(1.6, 1.0, 1.6), mat(0x8b9097), { x: 0, y: 0.6, z: -0.2 });
    part(world, new THREE.BoxGeometry(0.18, 0.14, 0.18), mat(0xc23b22), { x: -0.45, y: 1.17, z: 0.2 });
    part(world, new THREE.BoxGeometry(0.18, 0.14, 0.18), mat(0x1d2024), { x: 0.45, y: 1.17, z: 0.2 });
    const barBg = part(world, new THREE.BoxGeometry(1.2, 0.18, 0.02), mat(0x1d2024), { x: 0, y: 0.55, z: 0.62 });
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.14, 0.03), new THREE.MeshBasicMaterial({ color: 0x2ecc71 }));
    bar.position.set(0, 0.55, 0.63); world.add(bar);
    barBg.visible = true;

    // Boards: charger, inverter with transformer, relay.
    part(world, new THREE.BoxGeometry(1.0, 0.06, 1.4), mat(0x2f7a4f), { x: -0.55, y: 1.55, z: -0.2 });
    part(world, new THREE.BoxGeometry(1.0, 0.06, 1.4), mat(0x2f7a4f), { x: 0.0, y: 2.3, z: -0.2 });
    part(world, new THREE.BoxGeometry(0.7, 0.6, 0.6), mat(0xb87333), { x: 0.4, y: 2.65, z: -0.2 });
    part(world, new THREE.BoxGeometry(0.35, 0.3, 0.3), mat(0x2a5c9c), { x: -0.6, y: 2.55, z: 0.3 });
    const relayArm = part(world, new THREE.BoxGeometry(0.3, 0.04, 0.06), mat(0xd8dde2), { x: -0.6, y: 2.75, z: 0.3 });

    // PC: tower and monitor.
    part(world, new THREE.BoxGeometry(1.0, 2.2, 2.0), mat(0xd9d6cc), { x: 4.0, y: 1.1 });
    part(world, new THREE.BoxGeometry(0.2, 0.5, 0.6), mat(0xd9d6cc), { x: 5.6, y: 0.25 });
    part(world, new THREE.BoxGeometry(2.6, 1.7, 0.12), mat(0x1d2024), { x: 5.6, y: 1.5 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), new THREE.MeshBasicMaterial({ color: 0x0e1512 }));
    screen.position.set(5.6, 1.5, 0.065); world.add(screen);
    const powerLed = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0x2ecc71 }));
    powerLed.position.set(4.0, 1.9, 1.01); world.add(powerLed);

    // Cables.
    const cable = (pts) => {
      const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      world.add(new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.05, 6), mat(0x1d2024)));
      return c;
    };
    const wallCable = cable([[-5.8, 1.0, 0.6], [-4.5, 0.1, 0.8], [-2.5, 0.1, 0.8], [-1.25, 2.6, 0.4]]);
    const pcCable = cable([[1.25, 2.6, 0.4], [2.2, 0.1, 0.6], [3.2, 0.1, 0.6], [3.5, 1.0, 0.6]]);
    // Internal routes for the moving power dots.
    const route = (pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const mainsIn = route([[-1.15, 2.6, 0.4], [-0.6, 2.7, 0.4], [0.6, 2.9, 0.4], [1.15, 2.6, 0.4]]);
    const chargeR = route([[-0.6, 2.6, 0.5], [-0.55, 1.6, 0.6], [-0.4, 1.2, 0.5]]);
    const battR = route([[0.45, 1.2, 0.5], [0.2, 2.3, 0.6], [0.4, 2.65, 0.5], [1.15, 2.6, 0.4]]);

    function flow(curve, n, color) {
      const g = new THREE.SphereGeometry(0.07, 8, 6);
      const m = new THREE.MeshBasicMaterial({ color });
      const dots = Array.from({ length: n }, () => { const d = new THREE.Mesh(g, m); d.visible = false; world.add(d); return d; });
      return (on, now, speed = 1) => dots.forEach((d, i) => {
        d.visible = on;
        if (on) { const u = ((now / 1000) * 0.35 * speed + i / n) % 1; d.position.copy(curve.getPointAt(u)); }
      });
    }
    const fWall = flow(wallCable, 10, 0xf2c14e);
    const fIn = flow(mainsIn, 5, 0xf2c14e);
    const fPc = flow(pcCable, 10, 0xf2c14e);
    const fCharge = flow(chargeR, 4, 0x6fcb95);
    const fBatt = flow(battR, 6, 0xff8a3d);
    const fPcB = flow(pcCable, 10, 0xff8a3d);

    function update(step, t, state, now = performance.now()) {
      const m = upsModel(step, t, state.slider);
      const live = step >= 0;
      const mainsFlow = live && m.mains && !m.overload;
      fWall(mainsFlow, now); fIn(mainsFlow, now);
      fPc(mainsFlow && m.pcOn, now);
      fCharge(mainsFlow && m.charge < 100 || (live && step === 0), now, 0.6);
      const batt = live && m.onBattery && m.pcOn;
      fBatt(batt, now); fPcB(batt, now);
      relayArm.rotation.z = m.mains ? 0 : -0.5;
      ledG.material.color.set(live && m.mains ? 0x2ecc71 : 0x2a3a30);
      const beepOn = m.beeping === 'fast' ? Math.sin(now / 90) > 0 : m.beeping === 'slow' ? Math.sin(now / 400) > 0.6 : m.beeping === 'constant';
      ledA.material.color.set(live && (m.onBattery || m.overload) && beepOn ? 0xf2a900 : 0x3a3020);
      const on = live && m.pcOn && (m.mains || m.onBattery);
      screen.material.color.set(on ? 0x2b6650 : 0x0e1512);
      powerLed.material.color.set(on ? 0x2ecc71 : 0x2a3a30);
      const c = m.charge / 100;
      bar.scale.x = Math.max(0.02, c); bar.position.x = -0.58 * (1 - c);
      bar.material.color.set(c > 0.5 ? 0x2ecc71 : c > 0.2 ? 0xf2a900 : 0xc23b22);
    }
    let last = -1;
    function idle(lastStep, now, state) { if (lastStep >= 0) update(lastStep, 1, state, now); else if (last !== lastStep) update(-1, 0, state, now); last = lastStep; }

    return {
      update, idle,
      labels: [
        { text: 'wall socket', at: [-5.7, 1.6, 0.6] },
        { text: 'battery 12 V', at: [0, 0.9, 1.6] },
        { text: 'charger', at: [-0.55, 1.65, 1.6] },
        { text: 'inverter', at: [0.3, 2.35, 1.6] },
        { text: 'relay', at: [-0.6, 2.95, 1.6] },
        { text: 'PC', at: [4.0, 2.5, 1.0] }
      ]
    };
  }
};
