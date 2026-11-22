// Draws the temperature chart as plain SVG.
// I thought about Chart.js (used it in helpdesk-lite), but here I wanted to
// draw the 2–8 °C band and the hard limits exactly my way, and an SVG with a
// line and some rectangles is less code than configuring a library for it.

import { classifyReading, parseTimestamp, DEFAULT_RULES } from './monitor.js';

const PADDING = { top: 14, right: 14, bottom: 30, left: 40 };
const HEIGHT = 260;

// Range of the Y axis: always shows the 2–8 band with some room around it,
// and grows if a reading goes beyond that.
function yDomain(temps, rules) {
  const low = Math.min(rules.minTemp - 2, ...temps.map((t) => t - 1));
  const high = Math.max(rules.maxTemp + 2, ...temps.map((t) => t + 1));
  return [Math.floor(low / 2) * 2, Math.ceil(high / 2) * 2];
}

export function renderTemperatureChart(readings, { width, rules = DEFAULT_RULES, formatTime, gaps = [], label = '' }) {
  if (readings.length < 2) return '';

  const times = readings.map((r) => parseTimestamp(r.time).getTime());
  const temps = readings.map((r) => r.temp);
  const [yMin, yMax] = yDomain(temps, rules);
  const [tMin, tMax] = [times[0], times[times.length - 1]];

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = HEIGHT - PADDING.top - PADDING.bottom;
  const x = (t) => PADDING.left + ((t - tMin) / (tMax - tMin)) * plotW;
  const y = (temp) => PADDING.top + ((yMax - temp) / (yMax - yMin)) * plotH;

  const parts = [];

  // Allowed band first, so everything else is drawn on top of it.
  parts.push(`<rect class="band" x="${PADDING.left}" y="${y(rules.maxTemp)}" width="${plotW}" height="${y(rules.minTemp) - y(rules.maxTemp)}"></rect>`);

  for (let t = yMin; t <= yMax; t += 2) {
    parts.push(`<line class="grid" x1="${PADDING.left}" x2="${width - PADDING.right}" y1="${y(t)}" y2="${y(t)}"></line>`);
    parts.push(`<text class="axis" x="${PADDING.left - 6}" y="${y(t) + 4}" text-anchor="end">${t}°</text>`);
  }

  // Hard limits (freezing and the maximum spike) as dashed lines, only when
  // they fit in the visible range.
  for (const limit of [rules.freezeLimit, rules.hardMax]) {
    if (limit >= yMin && limit <= yMax) {
      parts.push(`<line class="limit" x1="${PADDING.left}" x2="${width - PADDING.right}" y1="${y(limit)}" y2="${y(limit)}"></line>`);
    }
  }

  // Around 5 time labels, fewer on a phone so they don't overlap.
  const labelCount = width < 480 ? 3 : 5;
  for (let i = 0; i < labelCount; i++) {
    const t = tMin + ((tMax - tMin) * i) / (labelCount - 1);
    const anchor = i === 0 ? 'start' : i === labelCount - 1 ? 'end' : 'middle';
    parts.push(`<text class="axis" x="${x(t)}" y="${HEIGHT - 8}" text-anchor="${anchor}">${formatTime(new Date(t))}</text>`);
  }

  // The line is broken where the logger stopped recording. Drawing a straight
  // line across a gap would "invent" readings that don't exist.
  const gapStarts = new Set(gaps.map((g) => parseTimestamp(g.start).getTime()));
  let path = '';
  readings.forEach((r, i) => {
    const command = i === 0 || gapStarts.has(times[i - 1]) ? 'M' : 'L';
    path += `${command}${x(times[i]).toFixed(1)},${y(r.temp).toFixed(1)} `;
  });
  parts.push(`<path class="line" d="${path.trim()}"></path>`);

  readings.forEach((r, i) => {
    if (classifyReading(r.temp, rules) !== 'ok') {
      parts.push(`<circle class="out" cx="${x(times[i]).toFixed(1)}" cy="${y(r.temp).toFixed(1)}" r="3.5"></circle>`);
    }
  });

  return `<svg class="chart" viewBox="0 0 ${width} ${HEIGHT}" width="${width}" height="${HEIGHT}" role="img" aria-label="${label}">${parts.join('')}</svg>`;
}
