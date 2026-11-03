import { test } from 'node:test';
import assert from 'node:assert/strict';
import { printerModel, printerNumbers, PRINTER, upsRuntimeMin, upsModel, UPS } from '../src/figures/models.js';
import { speedLabel } from '../src/figures/speed.js';

test('printer numbers follow from the spec', () => {
  const n = printerNumbers();
  assert.ok(Math.abs(n.secPerPage - 60 / 38) < 1e-9);
  assert.ok(n.paperMmS > 200 && n.paperMmS < 250, `paper speed ${n.paperMmS}`);
  assert.ok(n.drumRpm > 120 && n.drumRpm < 170, `drum ${n.drumRpm}`);
});

test('printer model: fuser warms, drum charges, laser only in step 3', () => {
  assert.equal(printerModel(-1, 0).fuserC, PRINTER.roomC);
  assert.equal(printerModel(6, 1).fuserC, PRINTER.fuserC);
  assert.ok(printerModel(3, 0.5).fuserC > PRINTER.roomC && printerModel(3, 0.5).fuserC < PRINTER.fuserC);
  assert.equal(printerModel(2, 0.5).drumV, PRINTER.drumChargeV);
  for (let s = -1; s < 7; s++) assert.equal(printerModel(s, 0.5).laser, s === 2);
});

test('UPS runtime: lighter load lasts longer, overload is zero', () => {
  const a = upsRuntimeMin(60), b = upsRuntimeMin(120), c = upsRuntimeMin(300);
  assert.ok(a > b && b > c);
  assert.ok(b > 10 && b < 40, `120 W runtime ${b}`);
  assert.equal(upsRuntimeMin(UPS.maxW + 1), 0);
  // Peukert: doubling the load more than halves the runtime.
  assert.ok(upsRuntimeMin(200) < upsRuntimeMin(100) / 2);
});

test('UPS model steps', () => {
  assert.equal(upsModel(0, 1, 120).mains, true);
  assert.equal(upsModel(2, 0.5, 120).onBattery, true);
  assert.ok(upsModel(2, 1, 120).minutesLeft <= UPS.lowBatteryMin + 1e-9);
  assert.equal(upsModel(3, 1, 120).pcOn, false);
  assert.equal(upsModel(0, 1, 500).overload, true);
});

test('speed badge', () => {
  assert.equal(speedLabel(1, 1000), '');
  assert.equal(speedLabel(0.004, 2000), '×1/500');
  assert.equal(speedLabel(6, 1500), '×4');
});
