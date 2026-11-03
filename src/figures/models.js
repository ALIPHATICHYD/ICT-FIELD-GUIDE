// Pure models: every number a figure shows comes from these functions.
// No three.js or DOM here, so they can be tested on their own (see tests/).

// ── Laser printer ───────────────────────────────────────────────
// Typical values for an office mono laser printer in the HP LaserJet M404 class.
// Sources: maker spec sheets (print speed), general laser-printer engineering
// references (drum and fuser values). Drum size and page gap are assumptions.
export const PRINTER = {
  ppm: 38,            // pages per minute, A4 (spec sheet class figure)
  pageMm: 297,        // A4 length, mm
  gapMm: 60,          // space between sheets, mm (assumed)
  drumMm: 30,         // drum diameter, mm (assumed, typical cartridge drum)
  fuserC: 200,        // fuser roller working temperature, °C (typical 180–210)
  roomC: 25,
  drumChargeV: -600,  // drum after the charge roller, volts (typical −600 to −800)
  drumExposedV: -100, // where the laser hits, volts
  laserNm: 780,       // laser wavelength, nm (common for laser printers)
  traySheets: 250
};

export function printerNumbers(p = PRINTER) {
  const secPerPage = 60 / p.ppm;
  const paperMmS = (p.pageMm + p.gapMm) / secPerPage;
  const drumRpm = (paperMmS / (Math.PI * p.drumMm)) * 60;
  return { secPerPage, paperMmS, drumRpm, scanSec: p.pageMm / paperMmS };
}

// step: -1 idle, 0..6 running steps; t: 0..1 progress in the step.
export function printerModel(step, t, p = PRINTER) {
  const n = printerNumbers(p);
  const s = step < 0 ? -1 : step + t; // continuous progress
  // Instant-on fuser warms while the image is being made (steps 1–4), then holds.
  const warm = Math.min(1, Math.max(0, (s - 1) / 4));
  const fuser = step < 0 ? p.roomC : p.roomC + (p.fuserC - p.roomC) * warm;
  const moving = step >= 0 && step !== 1 && step !== 2;
  const drumTurning = step >= 1 && step <= 4;
  let drumV = 0;
  if (step === 1) drumV = p.drumChargeV * t;
  else if (step >= 2 && step <= 4) drumV = p.drumChargeV;
  return {
    fuserC: Math.round(fuser),
    drumV: Math.round(drumV),
    exposedV: step >= 2 && step <= 4 ? p.drumExposedV : null,
    laser: step === 2,
    drumRpm: drumTurning ? Math.round(n.drumRpm) : 0,
    paperMmS: moving ? Math.round(n.paperMmS) : 0,
    secPerPage: n.secPerPage,
    sheets: p.traySheets - (step >= 0 ? 1 : 0)
  };
}

// ── UPS ─────────────────────────────────────────────────────────
// A typical small line-interactive desktop UPS (650 VA / 390 W class) with one
// 12 V 9 Ah sealed lead-acid battery. Runtime uses Peukert's law, which is why a
// heavy load drains the battery much faster than simple division suggests.
// Check against the maker's runtime chart for the exact model.
export const UPS = {
  batteryV: 12,
  batteryAh: 9,
  ratedHours: 20,     // Ah rating is at the 20-hour rate
  peukert: 1.2,       // typical for sealed lead-acid (assumed)
  inverterEff: 0.85,  // assumed
  maxW: 390,          // 650 VA class
  transferMs: 4,      // line-interactive switch time, typically 2–10 ms
  lowBatteryMin: 2    // warning before shutdown, common default
};

export function upsRuntimeMin(loadW, u = UPS) {
  if (loadW <= 0) return Infinity;
  if (loadW > u.maxW) return 0;
  const amps = loadW / (u.batteryV * u.inverterEff);
  const hours = u.ratedHours * Math.pow(u.batteryAh / (amps * u.ratedHours), u.peukert);
  return hours * 60;
}

// step: -1 idle, 0 mains on, 1 power cut, 2 on battery, 3 low battery, 4 power back.
export function upsModel(step, t, loadW, u = UPS) {
  const runtime = upsRuntimeMin(loadW, u);
  const overload = loadW > u.maxW;
  let charge = 100, mains = true, onBattery = false, pcOn = !overload, minutesLeft = runtime;
  if (step === 1) { mains = false; onBattery = t > 0.35; }
  if (step === 2) {
    mains = false; onBattery = true;
    const used = t * Math.max(0, runtime - u.lowBatteryMin);
    minutesLeft = runtime - used; charge = 100 * (minutesLeft / runtime);
  }
  if (step === 3) {
    mains = false; onBattery = true;
    minutesLeft = u.lowBatteryMin * (1 - t); charge = 100 * (minutesLeft / runtime);
    pcOn = t < 0.8;
  }
  if (step === 4) {
    mains = true; onBattery = false; pcOn = false;
    charge = 100 * (u.lowBatteryMin / runtime) + t * 20; minutesLeft = null;
  }
  if (!isFinite(charge)) charge = 100;
  return {
    mains, onBattery, pcOn, overload,
    loadW, runtimeMin: runtime, minutesLeft,
    charge: Math.max(0, Math.min(100, charge)),
    transferMs: u.transferMs,
    beeping: onBattery ? (step === 3 ? 'fast' : 'slow') : overload ? 'constant' : null
  };
}
