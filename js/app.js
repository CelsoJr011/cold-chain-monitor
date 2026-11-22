import { evaluateShipment, summarizeShipments, minutesBetween, parseTimestamp, DEFAULT_RULES } from './monitor.js';
import { parseLoggerCsv } from './csv.js';
import { renderTemperatureChart } from './chart.js';
import { buildSampleShipments } from './sample-data.js';
import { LANGUAGES, detectLanguage, saveLanguage, translate, hasTranslation } from './i18n.js';

const STORAGE_KEY = 'cold-chain-monitor:imported';

// Only the shipments the user imported are saved. The sample ones are rebuilt
// on every visit, so their dates are always "yesterday" instead of getting
// older each time the page is opened.
let imported = loadImported();
let shipments = [...buildSampleShipments(), ...imported];
let lang = detectLanguage();
let selectedId = null;

// The last import message is kept as keys + params, not as text, so it can be
// redrawn in another language when the user switches.
let importMessage = null;

const t = (key, params) => translate(lang, key, params);
const locale = () => LANGUAGES[lang].locale;

// --- persistence ---------------------------------------------------------

function loadImported() {
  // localStorage can be blocked (private mode, some browsers). The app still
  // works, it just won't remember imported files.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Could not read imported shipments.', err);
  }
  return [];
}

function saveImported() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
  } catch (err) {
    console.warn('Could not save imported shipments.', err);
  }
}

// --- formatting ----------------------------------------------------------

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

// "4.5 °C" in English, "4,5 °C" in Portuguese and French.
function formatTemp(value) {
  return `${value.toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })} °C`;
}

function formatPercent(value) {
  return new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: 1 }).format(value / 100);
}

// 24-hour clock in every language — loggers and drivers' reports use it.
function formatTime(date) {
  return date.toLocaleTimeString(locale(), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
}

function formatDateTime(stamp) {
  const date = parseTimestamp(stamp);
  return `${date.toLocaleDateString(locale(), { day: 'numeric', month: 'short' })} ${formatTime(date)}`;
}

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return t('duration.min', { m });
  if (m === 0) return t('duration.h', { h });
  return t('duration.hm', { h, m });
}

// Sample routes have a translation per shipment ID. Routes typed by the user
// are shown as typed — free text can't be translated reliably.
function routeName(shipment) {
  const key = `route.${shipment.id}`;
  return shipment.sample && hasTranslation(lang, key) ? t(key) : shipment.route || '—';
}

// --- static texts --------------------------------------------------------

function applyStaticTranslations() {
  document.documentElement.lang = LANGUAGES[lang].locale;
  document.title = t('page.title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

// --- rendering -----------------------------------------------------------

// Worst first: the person checking this screen in the morning should see the
// quarantined shipments before anything else.
const SEVERITY = { quarantine: 0, review: 1, approved: 2 };

function evaluatedShipments() {
  return shipments
    .map((shipment) => ({ shipment, result: evaluateShipment(shipment.readings) }))
    .sort((a, b) =>
      SEVERITY[a.result.verdict] - SEVERITY[b.result.verdict]
      || parseTimestamp(a.shipment.readings[0].time) - parseTimestamp(b.shipment.readings[0].time));
}

function renderSummary() {
  const s = summarizeShipments(shipments);
  const cards = [
    { label: t('summary.shipments'), value: s.shipments },
    { label: t('summary.approved'), value: s.approved, css: 'approved' },
    { label: t('summary.review'), value: s.review, css: 'review' },
    { label: t('summary.quarantine'), value: s.quarantine, css: 'quarantine' },
    { label: t('summary.excursions'), value: s.excursions },
    { label: t('summary.timeInRange'), value: formatPercent(s.timeInRange) },
  ];

  document.getElementById('summary').innerHTML = cards
    .map((c) => `
      <div class="card ${c.css ?? ''}">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
      </div>`)
    .join('');
}

function renderList(rows) {
  const filter = document.getElementById('verdict-filter').value;
  const visible = rows.filter(({ result }) => filter === 'all' || result.verdict === filter);
  const tbody = document.getElementById('shipment-rows');

  if (visible.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">${t('list.empty')}</td></tr>`;
    return;
  }

  tbody.innerHTML = visible
    .map(({ shipment, result }) => `
      <tr class="clickable ${shipment.id === selectedId ? 'selected' : ''}" data-id="${escapeHtml(shipment.id)}" tabindex="0">
        <td><strong>${escapeHtml(shipment.id)}</strong></td>
        <td>${escapeHtml(routeName(shipment))}</td>
        <td>${escapeHtml(shipment.box || '—')}</td>
        <td>${formatDateTime(shipment.readings[0].time)}</td>
        <td>${formatDuration(result.totalMinutes)}</td>
        <td>${formatTemp(result.stats.min)} / ${formatTemp(result.stats.max)}</td>
        <td>${result.excursions.length}</td>
        <td><span class="badge ${result.verdict}">${t(`verdict.${result.verdict}`)}</span></td>
      </tr>`)
    .join('');
}

// Each reason gets the numbers that explain it, in the selected language.
function describeReason(reason, result) {
  const r = DEFAULT_RULES;
  const params = {
    freeze: { temp: formatTemp(result.stats.min), limit: formatTemp(r.freezeLimit) },
    hardMax: { temp: formatTemp(result.stats.max), limit: formatTemp(r.hardMax) },
    cumulative: { total: formatDuration(result.minutesOut), limit: formatDuration(r.maxMinutesOutOfRange) },
    excursion: { total: formatDuration(result.minutesOut), limit: formatDuration(r.maxMinutesOutOfRange) },
    gap: {},
  };
  return t(`reason.${reason}`, params[reason]);
}

function renderDetail(rows) {
  const box = document.getElementById('detail');
  const row = rows.find(({ shipment }) => shipment.id === selectedId);

  if (!row) {
    box.innerHTML = `<p class="hint">${t('detail.empty')}</p>`;
    return;
  }

  const { shipment, result } = row;
  const reasons = result.reasons.length
    ? result.reasons.map((reason) => `<li>${describeReason(reason, result)}</li>`).join('')
    : `<li>${t('reason.none', { min: formatTemp(DEFAULT_RULES.minTemp), max: formatTemp(DEFAULT_RULES.maxTemp) })}</li>`;

  const stats = [
    [t('detail.min'), formatTemp(result.stats.min)],
    [t('detail.max'), formatTemp(result.stats.max)],
    [t('detail.average'), formatTemp(result.stats.average)],
    [t('detail.timeInRange'), formatPercent(result.timeInRange)],
    [t('detail.timeOut'), formatDuration(result.minutesOut)],
    [t('detail.readings'), shipment.readings.length],
  ];

  const excursions = result.excursions.length
    ? `<div class="table-wrap"><table>
        <thead><tr>
          <th>${t('detail.type')}</th><th>${t('detail.from')}</th><th>${t('detail.to')}</th>
          <th>${t('detail.duration')}</th><th>${t('detail.peak')}</th>
        </tr></thead>
        <tbody>${result.excursions.map((e) => `
          <tr>
            <td><span class="exc ${e.type}">${t(`type.${e.type}`)}</span></td>
            <td>${formatTime(parseTimestamp(e.start))}</td>
            <td>${formatTime(parseTimestamp(e.end))}${e.open ? ` <small>(${t('detail.stillOpen')})</small>` : ''}</td>
            <td>${formatDuration(e.minutes)}</td>
            <td>${formatTemp(e.peak)}</td>
          </tr>`).join('')}
        </tbody></table></div>`
    : `<p class="hint">${t('detail.noExcursions')}</p>`;

  const gaps = result.gaps.length
    ? `<h3>${t('detail.gaps')}</h3><ul>${result.gaps.map((g) => `<li>${t('detail.gap', {
        start: formatTime(parseTimestamp(g.start)),
        end: formatTime(parseTimestamp(g.end)),
        duration: formatDuration(g.minutes),
      })}</li>`).join('')}</ul>`
    : '';

  box.innerHTML = `
    <div class="detail-header">
      <h2>${escapeHtml(t('detail.title', { id: shipment.id }))}</h2>
      <span class="badge big ${result.verdict}">${t(`verdict.${result.verdict}`)}</span>
    </div>
    <p class="hint">${escapeHtml(routeName(shipment))} · ${escapeHtml(shipment.box || '—')} · ${formatDateTime(shipment.readings[0].time)}</p>

    <div id="chart" class="chart-wrap"></div>
    <ul class="legend">
      <li><span class="key band"></span>${t('chart.allowed')}</li>
      <li><span class="key line"></span>${t('chart.reading')}</li>
      <li><span class="key out"></span>${t('chart.out')}</li>
      <li><span class="key limit"></span>${t('chart.limits')} (${formatTemp(DEFAULT_RULES.freezeLimit)} / ${formatTemp(DEFAULT_RULES.hardMax)})</li>
    </ul>

    <dl class="stats">${stats.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>

    <div class="verdict-box ${result.verdict}">
      <h3>${t('detail.why')}</h3>
      <ul>${reasons}</ul>
      <p><strong>${t('detail.next')}</strong> ${t(`action.${result.verdict}`)}</p>
    </div>

    <h3>${t('detail.excursions')}</h3>
    ${excursions}
    ${gaps}
    ${shipment.sample ? '' : `<button class="btn btn-danger" type="button" id="remove-shipment">${t('detail.remove')}</button>`}
  `;

  renderChart(shipment, result);
}

// Separate from renderDetail so a window resize only redraws the chart.
// The SVG is drawn at the real width of the box, otherwise the text would
// shrink to an unreadable size on a phone.
function renderChart(shipment, result) {
  const wrap = document.getElementById('chart');
  if (!wrap) return;
  wrap.innerHTML = renderTemperatureChart(shipment.readings, {
    width: Math.max(wrap.clientWidth, 280),
    gaps: result.gaps,
    formatTime,
    label: escapeHtml(t('detail.chart', { id: shipment.id })),
  });
}

function renderImportMessage() {
  const box = document.getElementById('import-message');
  if (!importMessage) {
    box.innerHTML = '';
    box.className = 'form-message';
    return;
  }
  box.className = `form-message ${importMessage.type}`;
  box.innerHTML = importMessage.lines.map(({ key, params }) => `<div>${escapeHtml(t(key, params))}</div>`).join('');
}

function renderFileName() {
  const input = document.querySelector('#import-form [name=file]');
  const file = input.files[0];
  document.getElementById('file-name').textContent = file ? file.name : t('import.noFile');
}

function renderAll() {
  applyStaticTranslations();
  renderFileName();
  const rows = evaluatedShipments();
  renderSummary();
  renderList(rows);
  renderDetail(rows);
  renderImportMessage();
}

// --- import --------------------------------------------------------------

// CSV errors come as { line, reason }. Only the first five are shown — a file
// with the wrong format would otherwise fill the screen with the same error.
function csvErrorLines(errors) {
  const lines = errors.slice(0, 5).map((e) => (e.line === 0
    ? { key: `csv.${e.reason}` }
    : { key: 'import.errorLine', params: { line: e.line, reason: t(`csv.${e.reason}`) } }));
  if (errors.length > 5) lines.push({ key: 'import.more', params: { n: errors.length - 5 } });
  return lines;
}

function importShipment({ id, route, box, csvText }) {
  if (!id) return { type: 'error', lines: [{ key: 'import.missingId' }] };
  if (shipments.some((s) => s.id === id)) return { type: 'error', lines: [{ key: 'import.duplicate', params: { id } }] };
  if (!csvText.trim()) return { type: 'error', lines: [{ key: 'import.noData' }] };

  const { readings, errors } = parseLoggerCsv(csvText);
  if (errors.length > 0) return { type: 'error', lines: csvErrorLines(errors) };

  const shipment = { id, route, box, sample: false, readings };
  imported.push(shipment);
  shipments.push(shipment);
  saveImported();
  selectedId = id;
  return { type: 'success', lines: [{ key: 'import.success', params: { id, n: readings.length } }] };
}

// An example in the Brazilian logger format (";" and decimal comma), with a
// short warm spike in the middle so the import shows something interesting.
function exampleCsv() {
  const start = new Date();
  start.setHours(7, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const lines = ['Data/Hora;Temperatura (°C)'];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start.getTime() + i * 10 * 60 * 1000);
    const temp = i >= 14 && i <= 15 ? 8.7 + i % 2 * 0.4 : 5 + Math.sin(i / 3);
    const stamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    lines.push(`${stamp};${temp.toFixed(1).replace('.', ',')}`);
  }
  return lines.join('\n');
}

// --- events --------------------------------------------------------------

document.querySelectorAll('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    lang = button.dataset.lang;
    saveLanguage(lang);
    renderAll();
  });
});

function selectShipment(id) {
  selectedId = id;
  renderAll();
  // On a phone the detail is far below the list, so jump to it.
  if (window.innerWidth < 900) document.getElementById('detail').scrollIntoView({ behavior: 'smooth' });
}

const rowsBody = document.getElementById('shipment-rows');
rowsBody.addEventListener('click', (event) => {
  const row = event.target.closest('tr[data-id]');
  if (row) selectShipment(row.dataset.id);
});
rowsBody.addEventListener('keydown', (event) => {
  const row = event.target.closest('tr[data-id]');
  if (row && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    selectShipment(row.dataset.id);
  }
});

document.getElementById('verdict-filter').addEventListener('change', () => renderList(evaluatedShipments()));

document.getElementById('detail').addEventListener('click', (event) => {
  if (event.target.id !== 'remove-shipment') return;
  imported = imported.filter((s) => s.id !== selectedId);
  shipments = shipments.filter((s) => s.id !== selectedId);
  saveImported();
  selectedId = null;
  renderAll();
});

document.getElementById('fill-example').addEventListener('click', () => {
  const form = document.getElementById('import-form');
  let n = 201;
  while (shipments.some((s) => s.id === `RT-${n}`)) n++;
  form.elements.id.value = `RT-${n}`;
  form.elements.route.value = 'Sumaré';
  form.elements.box.value = 'TB-01';
  form.elements.csv.value = exampleCsv();
});

document.querySelector('#import-form [name=file]').addEventListener('change', renderFileName);

document.getElementById('import-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const file = form.elements.file.files[0];
  // A chosen file wins over the text area.
  const csvText = file ? await file.text() : form.elements.csv.value;

  importMessage = importShipment({
    id: form.elements.id.value.trim().toUpperCase(),
    route: form.elements.route.value.trim(),
    box: form.elements.box.value.trim().toUpperCase(),
    csvText,
  });

  if (importMessage.type === 'success') form.reset();
  renderAll();
});

document.getElementById('reset-data').addEventListener('click', () => {
  imported = [];
  shipments = buildSampleShipments();
  saveImported();
  selectedId = defaultSelection();
  importMessage = null;
  renderAll();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const row = evaluatedShipments().find(({ shipment }) => shipment.id === selectedId);
    if (row) renderChart(row.shipment, row.result);
  }, 150);
});

// Opens on the worst shipment, which is the first one in the list.
function defaultSelection() {
  return evaluatedShipments()[0]?.shipment.id ?? null;
}

selectedId = defaultSelection();
renderAll();
