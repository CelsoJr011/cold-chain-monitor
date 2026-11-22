// Rules for reading a cold chain temperature log.
// No DOM code in here, so the same functions run in the browser and in the
// Node tests (npm test).

const MINUTE_MS = 60 * 1000;

// Demo defaults. In real life these numbers come from the product's stability
// data and from the quality team's procedures — every product and every
// company has its own. That's why they all live in one object.
export const DEFAULT_RULES = {
  minTemp: 2,               // the 2–8 °C range most refrigerated medicines use
  maxTemp: 8,
  freezeLimit: 0,           // at or below this, the product may have frozen
  hardMax: 12,              // above this, even a short spike is too much
  maxMinutesOutOfRange: 60, // total time outside 2–8 °C before it's a quarantine
  gapFactor: 2,             // a gap bigger than 2× the logger interval = missing data
};

// Timestamps without a time zone ("2026-11-22T08:15") are read by JS as local
// time, which is what a logger installed in a truck in Brazil records. A space
// instead of the "T" is also common in exported files, so both are accepted.
export function parseTimestamp(value) {
  if (value instanceof Date) return value;
  return new Date(String(value).trim().replace(' ', 'T'));
}

export function minutesBetween(a, b) {
  return Math.round((parseTimestamp(b) - parseTimestamp(a)) / MINUTE_MS);
}

export function classifyReading(temp, rules = DEFAULT_RULES) {
  if (temp < rules.minTemp) return 'low';
  if (temp > rules.maxTemp) return 'high';
  return 'ok';
}

export function sortReadings(readings) {
  return [...readings].sort((a, b) => parseTimestamp(a.time) - parseTimestamp(b.time));
}

// The logger interval isn't always the same (5, 10, 15 min...), so it's taken
// from the data itself. The median ignores one or two weird gaps, the average
// wouldn't.
export function typicalInterval(readings) {
  const sorted = sortReadings(readings);
  const diffs = [];
  for (let i = 1; i < sorted.length; i++) {
    diffs.push(minutesBetween(sorted[i - 1].time, sorted[i].time));
  }
  if (diffs.length === 0) return 0;

  diffs.sort((a, b) => a - b);
  const middle = Math.floor(diffs.length / 2);
  return diffs.length % 2 ? diffs[middle] : Math.round((diffs[middle - 1] + diffs[middle]) / 2);
}

// An excursion is a run of readings in a row outside the range, in the same
// direction (too warm or too cold).
//
// The logger only tells us the temperature every few minutes, so we don't know
// exactly when it crossed 8 °C. I count the worst case: from the last good
// reading before the run until the first good reading after it. Quality teams
// prefer to overestimate an excursion than to underestimate it.
export function findExcursions(readings, rules = DEFAULT_RULES) {
  const sorted = sortReadings(readings);
  const excursions = [];
  let i = 0;

  while (i < sorted.length) {
    const type = classifyReading(sorted[i].temp, rules);
    if (type === 'ok') {
      i++;
      continue;
    }

    let j = i;
    while (j + 1 < sorted.length && classifyReading(sorted[j + 1].temp, rules) === type) j++;

    const run = sorted.slice(i, j + 1);
    const temps = run.map((r) => r.temp);
    const startTime = sorted[Math.max(i - 1, 0)].time;
    const endTime = sorted[Math.min(j + 1, sorted.length - 1)].time;

    excursions.push({
      type,
      start: startTime,
      end: endTime,
      minutes: minutesBetween(startTime, endTime),
      peak: type === 'high' ? Math.max(...temps) : Math.min(...temps),
      readings: run.length,
      // Still out of range at the last reading — the trip ended (or the file
      // was cut) before the temperature came back.
      open: j === sorted.length - 1,
    });

    i = j + 1;
  }

  return excursions;
}

// No reading for a long time doesn't mean the temperature was fine — it means
// we can't prove it was. So gaps are reported too.
export function findGaps(readings, rules = DEFAULT_RULES) {
  const sorted = sortReadings(readings);
  const interval = typicalInterval(sorted);
  if (interval === 0) return [];

  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    const minutes = minutesBetween(sorted[i - 1].time, sorted[i].time);
    if (minutes > interval * rules.gapFactor) {
      gaps.push({ start: sorted[i - 1].time, end: sorted[i].time, minutes });
    }
  }
  return gaps;
}

export function temperatureStats(readings) {
  if (readings.length === 0) return null;

  const temps = readings.map((r) => r.temp);
  const sum = temps.reduce((total, t) => total + t, 0);
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
    // Rounded to one decimal — loggers usually don't measure better than ±0.5 °C.
    average: Math.round((sum / temps.length) * 10) / 10,
  };
}

// Puts everything together and gives the shipment a verdict:
//   approved   → stayed in range the whole time, no missing data
//   review     → something happened, but within the tolerance: quality decides
//   quarantine → product is held until quality analyses it
// "reasons" says why, because a verdict without a reason is useless for the
// person who has to sign the release.
export function evaluateShipment(readings, rules = DEFAULT_RULES) {
  const sorted = sortReadings(readings);
  const excursions = findExcursions(sorted, rules);
  const gaps = findGaps(sorted, rules);
  const stats = temperatureStats(sorted);

  const totalMinutes = sorted.length > 1 ? minutesBetween(sorted[0].time, sorted[sorted.length - 1].time) : 0;
  const minutesOut = excursions.reduce((total, e) => total + e.minutes, 0);
  const timeInRange = totalMinutes > 0 ? Math.max(0, Math.round((1 - minutesOut / totalMinutes) * 1000) / 10) : 100;

  const reasons = [];
  // Freezing goes first: for many refrigerated products (insulin, vaccines)
  // getting too cold is worse than a short warm spike.
  if (stats && stats.min <= rules.freezeLimit) reasons.push('freeze');
  if (stats && stats.max > rules.hardMax) reasons.push('hardMax');
  if (minutesOut > rules.maxMinutesOutOfRange) reasons.push('cumulative');

  let verdict = 'approved';
  if (reasons.length > 0) {
    verdict = 'quarantine';
  } else {
    if (excursions.length > 0) reasons.push('excursion');
    if (gaps.length > 0) reasons.push('gap');
    if (reasons.length > 0) verdict = 'review';
  }

  return { verdict, reasons, excursions, gaps, stats, totalMinutes, minutesOut, timeInRange };
}

export function summarizeShipments(shipments, rules = DEFAULT_RULES) {
  const summary = { shipments: shipments.length, approved: 0, review: 0, quarantine: 0, excursions: 0, timeInRange: 100 };
  if (shipments.length === 0) return summary;

  let totalInRange = 0;
  for (const shipment of shipments) {
    const result = evaluateShipment(shipment.readings, rules);
    summary[result.verdict] += 1;
    summary.excursions += result.excursions.length;
    totalInRange += result.timeInRange;
  }
  summary.timeInRange = Math.round((totalInRange / shipments.length) * 10) / 10;
  return summary;
}
