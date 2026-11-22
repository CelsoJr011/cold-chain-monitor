import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLoggerCsv } from '../js/csv.js';

test('reads the Brazilian format: ";" separator and decimal comma', () => {
  const { readings, errors } = parseLoggerCsv('Data/Hora;Temperatura\n2026-03-10 08:00;4,5\n2026-03-10 08:05;5,1');
  assert.deepEqual(errors, []);
  assert.deepEqual(readings, [
    { time: '2026-03-10T08:00', temp: 4.5 },
    { time: '2026-03-10T08:05', temp: 5.1 },
  ]);
});

test('reads "," separator with decimal point, without a header', () => {
  const { readings } = parseLoggerCsv('2026-03-10T08:00,4.5\r\n2026-03-10T08:05,-0.5\r\n');
  assert.deepEqual(readings.map((r) => r.temp), [4.5, -0.5]);
});

test('ignores blank lines and seconds in the timestamp', () => {
  const { readings, errors } = parseLoggerCsv('\n2026-03-10 08:00:30;4\n\n2026-03-10 08:05:30;5\n');
  assert.deepEqual(errors, []);
  assert.equal(readings[0].time, '2026-03-10T08:00');
});

test('reports bad lines with their line number', () => {
  const { errors } = parseLoggerCsv('time;temp\n10/03/2026 08:00;4\n2026-03-10 08:05;abc\n2026-03-10 08:10');
  assert.deepEqual(errors, [
    { line: 2, reason: 'date' },
    { line: 3, reason: 'temperature' },
    { line: 4, reason: 'columns' },
  ]);
});

test('refuses an empty file or a single reading', () => {
  assert.deepEqual(parseLoggerCsv('   ').errors, [{ line: 0, reason: 'empty' }]);
  assert.deepEqual(parseLoggerCsv('2026-03-10 08:00;4').errors, [{ line: 0, reason: 'tooFew' }]);
});
