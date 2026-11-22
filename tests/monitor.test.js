import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyReading,
  typicalInterval,
  findExcursions,
  findGaps,
  evaluateShipment,
  summarizeShipments,
} from '../js/monitor.js';

// Small helper: builds readings every 5 minutes from a list of temperatures,
// so each test shows only what matters — the temperatures.
function readingsFrom(temps, start = '2026-03-10T08:00') {
  const base = new Date(start);
  return temps.map((temp, i) => {
    const d = new Date(base.getTime() + i * 5 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return { time: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`, temp };
  });
}

test('classifies a reading against the 2–8 °C range, limits included', () => {
  assert.equal(classifyReading(2), 'ok');
  assert.equal(classifyReading(8), 'ok');
  assert.equal(classifyReading(8.1), 'high');
  assert.equal(classifyReading(1.9), 'low');
});

test('takes the logger interval from the data (median, not average)', () => {
  const readings = readingsFrom([5, 5, 5, 5, 5]);
  readings.push({ time: '2026-03-10T10:00', temp: 5 }); // one big gap at the end
  assert.equal(typicalInterval(readings), 5);
});

test('counts an excursion from the last good reading to the next good one', () => {
  // 08:10 and 08:15 are above 8 °C. Last good reading 08:05, next good 08:20.
  const [excursion] = findExcursions(readingsFrom([5, 6, 8.5, 9.2, 7, 5]));
  assert.equal(excursion.type, 'high');
  assert.equal(excursion.start, '2026-03-10T08:05');
  assert.equal(excursion.end, '2026-03-10T08:20');
  assert.equal(excursion.minutes, 15);
  assert.equal(excursion.peak, 9.2);
  assert.equal(excursion.open, false);
});

test('splits warm and cold excursions and flags one still open at the end', () => {
  const excursions = findExcursions(readingsFrom([1.5, 4, 5, 9, 9.5]));
  assert.deepEqual(excursions.map((e) => [e.type, e.open]), [['low', false], ['high', true]]);
  assert.equal(excursions[0].peak, 1.5);
});

test('works with readings out of order', () => {
  const readings = readingsFrom([5, 9, 5]).reverse();
  assert.equal(findExcursions(readings).length, 1);
});

test('finds gaps where the logger stopped recording', () => {
  const readings = readingsFrom([5, 5, 5, 5]);
  readings.push({ time: '2026-03-10T09:00', temp: 5 }); // 45 min after 08:15
  const gaps = findGaps(readings);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].minutes, 45);
});

test('approves a shipment that stayed in range', () => {
  const result = evaluateShipment(readingsFrom([4, 5, 6, 5, 4]));
  assert.equal(result.verdict, 'approved');
  assert.deepEqual(result.reasons, []);
  assert.equal(result.timeInRange, 100);
});

test('sends a short excursion to review', () => {
  const result = evaluateShipment(readingsFrom([5, 5, 9, 5, 5]));
  assert.equal(result.verdict, 'review');
  assert.deepEqual(result.reasons, ['excursion']);
  assert.equal(result.minutesOut, 10);
  assert.equal(result.timeInRange, 50); // 10 of 20 minutes, worst case
});

test('sends missing data to review even when every reading is fine', () => {
  const readings = readingsFrom([5, 5, 5, 5]);
  readings.push({ time: '2026-03-10T09:30', temp: 5 });
  assert.deepEqual(evaluateShipment(readings).reasons, ['gap']);
});

test('quarantines when the product may have frozen', () => {
  const result = evaluateShipment(readingsFrom([5, 3, 0, 3, 5]));
  assert.equal(result.verdict, 'quarantine');
  assert.ok(result.reasons.includes('freeze'));
});

test('quarantines a spike above the hard limit, however short', () => {
  const result = evaluateShipment(readingsFrom([5, 5, 12.5, 5, 5]));
  assert.equal(result.verdict, 'quarantine');
  assert.deepEqual(result.reasons, ['hardMax']);
});

test('quarantines when the total time out of range passes the tolerance', () => {
  // 14 readings at 9 °C = 75 minutes out (worst case), tolerance is 60.
  const temps = [5, ...Array(14).fill(9), 5];
  const result = evaluateShipment(readingsFrom(temps));
  assert.deepEqual(result.reasons, ['cumulative']);
});

test('accepts custom rules', () => {
  const rules = { minTemp: 15, maxTemp: 25, freezeLimit: 0, hardMax: 30, maxMinutesOutOfRange: 60, gapFactor: 2 };
  assert.equal(evaluateShipment(readingsFrom([20, 22, 21]), rules).verdict, 'approved');
});

test('summarizes several shipments', () => {
  const summary = summarizeShipments([
    { readings: readingsFrom([5, 5, 5]) },
    { readings: readingsFrom([5, 9, 5]) },
    { readings: readingsFrom([5, -1, 5]) },
  ]);
  assert.equal(summary.shipments, 3);
  assert.equal(summary.approved, 1);
  assert.equal(summary.review, 1);
  assert.equal(summary.quarantine, 1);
  assert.equal(summary.excursions, 2);
});
