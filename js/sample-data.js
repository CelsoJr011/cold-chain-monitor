// Fictional shipments: routes, boxes and readings are all made up.
// Trips are placed "yesterday", relative to today, so the demo never looks
// old. The readings are generated instead of typed by hand — a 5-hour trip
// with one reading every 5 minutes is 60 lines per shipment.

const INTERVAL_MIN = 5;

function pad(n) {
  return String(n).padStart(2, '0');
}

// Local "YYYY-MM-DDTHH:MM". toISOString() would convert to UTC and shift the
// trip by 3 hours here in Brazil.
function toLocalStamp(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// A normal box with ice packs doesn't stay at a perfect 5 °C: it swings a bit.
// Two sine waves give that swing without Math.random, so the demo (and the
// screenshots in the README) look the same every time.
function baseTemp(i, offset) {
  return 4.8 + 0.7 * Math.sin((i + offset) / 7) + 0.3 * Math.sin((i + offset) / 2.3);
}

// `events` changes the temperature of some readings to tell a story
// (a door left open, a cooling failure...). `skip` removes readings to
// simulate a logger that stopped recording for a while.
function buildReadings({ start, count, offset = 0, events = [], skip = [] }) {
  const readings = [];
  for (let i = 0; i < count; i++) {
    if (skip.some(([from, to]) => i >= from && i <= to)) continue;

    let temp = baseTemp(i, offset);
    for (const event of events) {
      if (i >= event.from && i <= event.to) temp = event.temp(i - event.from, temp);
    }

    const time = new Date(start.getTime() + i * INTERVAL_MIN * 60 * 1000);
    readings.push({ time: toLocalStamp(time), temp: Math.round(temp * 10) / 10 });
  }
  return readings;
}

function yesterdayAt(hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function buildSampleShipments() {
  return [
    {
      id: 'RT-101',
      route: 'Campinas — downtown pharmacies',
      box: 'TB-07',
      sample: true,
      // Everything went fine. Most days look like this one.
      readings: buildReadings({ start: yesterdayAt(6, 30), count: 60 }),
    },
    {
      id: 'RT-102',
      route: 'Sumaré — neighbourhood pharmacies',
      box: 'TB-03',
      sample: true,
      // Box opened for too long at a delivery: short spike to ~9 °C.
      readings: buildReadings({
        start: yesterdayAt(7, 0),
        count: 54,
        offset: 11,
        events: [{ from: 22, to: 25, temp: (k) => [8.6, 9.3, 9.0, 8.3][k] }],
      }),
    },
    {
      id: 'RT-103',
      route: 'Hortolândia — hospital and clinics',
      box: 'TB-11',
      sample: true,
      // Truck stuck in traffic in the afternoon heat, ice packs gave up.
      readings: buildReadings({
        start: yesterdayAt(12, 15),
        count: 66,
        offset: 23,
        events: [{ from: 30, to: 50, temp: (k) => 8.4 + Math.sin((k / 20) * Math.PI) * 5.1 }],
      }),
    },
    {
      id: 'RT-104',
      route: 'Americana — pharmacy chain',
      box: 'TB-05',
      sample: true,
      // Frozen ice pack placed right against the products: they got too cold.
      readings: buildReadings({
        start: yesterdayAt(5, 45),
        count: 48,
        offset: 37,
        events: [{ from: 2, to: 9, temp: (k) => 1.6 - Math.sin((k / 7) * Math.PI) * 2.1 }],
      }),
    },
    {
      id: 'RT-105',
      route: 'Paulínia — drugstores',
      box: 'TB-09',
      sample: true,
      // Temperature looked fine, but the logger stopped recording for 45 min.
      readings: buildReadings({ start: yesterdayAt(8, 10), count: 58, offset: 5, skip: [[20, 28]] }),
    },
  ];
}
