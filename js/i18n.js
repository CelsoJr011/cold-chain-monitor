// Every text on the screen lives here, even with only English for now —
// the plan is to add Portuguese and French as new dictionaries.
// Keys are grouped by screen area so it's easy to find what to change.

export const LANGUAGES = {
  en: { label: 'EN', locale: 'en-CA', name: 'English' },
};

const messages = {
  en: {
    'page.title': 'Cold Chain Monitor — 2–8 °C temperature logs',
    'header.subtitle': 'Temperature logs for refrigerated medicine deliveries (2–8 °C)',
    'header.reset': 'Reset sample data',
    'header.language': 'Language',

    'summary.label': 'Summary',
    'summary.shipments': 'Shipments',
    'summary.approved': 'Approved',
    'summary.review': 'Needs review',
    'summary.quarantine': 'Quarantine',
    'summary.excursions': 'Excursions',
    'summary.timeInRange': 'Avg. time in range',

    'list.title': 'Shipments',
    'list.hint': 'Each line is one thermal box with a temperature logger inside. Click a shipment to see its readings.',
    'list.filter': 'Filter by verdict',
    'list.all': 'All verdicts',
    'list.id': 'Shipment',
    'list.route': 'Route',
    'list.box': 'Box',
    'list.departure': 'Departure',
    'list.duration': 'Duration',
    'list.range': 'Min / max',
    'list.excursions': 'Exc.',
    'list.verdict': 'Verdict',
    'list.empty': 'No shipments for this filter.',

    'verdict.approved': 'Approved',
    'verdict.review': 'Needs review',
    'verdict.quarantine': 'Quarantine',

    'detail.title': 'Shipment {id}',
    'detail.empty': 'Select a shipment in the list to see the temperature chart and the excursions.',
    'detail.chart': 'Temperature over time for shipment {id}',
    'detail.min': 'Lowest',
    'detail.max': 'Highest',
    'detail.average': 'Average',
    'detail.timeInRange': 'Time in range',
    'detail.timeOut': 'Time out of range',
    'detail.readings': 'Readings',
    'detail.why': 'Why this verdict',
    'detail.next': 'What to do:',
    'detail.excursions': 'Excursions',
    'detail.noExcursions': 'No excursions — every reading was between 2 and 8 °C.',
    'detail.type': 'Type',
    'detail.from': 'From',
    'detail.to': 'To',
    'detail.duration': 'Duration',
    'detail.peak': 'Peak',
    'detail.stillOpen': 'still out of range at the last reading',
    'detail.gaps': 'Missing data',
    'detail.gap': 'No readings from {start} to {end} ({duration}).',
    'detail.remove': 'Remove this shipment',

    'type.high': 'Too warm',
    'type.low': 'Too cold',

    'reason.freeze': 'Reached {temp} — at or below {limit}, the product may have frozen.',
    'reason.hardMax': 'Reached {temp}, above the hard limit of {limit}. Even a short spike counts.',
    'reason.cumulative': 'Out of range for {total} in total. The tolerance is {limit}.',
    'reason.excursion': 'Left the 2–8 °C range for {total}, still within the {limit} tolerance.',
    'reason.gap': 'The logger stopped recording for a while, so there is no proof the temperature was fine.',
    'reason.none': 'Stayed between {min} and {max} the whole trip, with no missing data.',

    'action.approved': 'Release the products as usual.',
    'action.review': 'Send this report to the quality team. They decide if the products can be released.',
    'action.quarantine': 'Keep the products apart, labelled as quarantine, until the quality team analyses them.',

    'chart.allowed': 'Allowed range (2–8 °C)',
    'chart.reading': 'Readings',
    'chart.out': 'Out of range',
    'chart.limits': 'Hard limits',

    'duration.min': '{m} min',
    'duration.h': '{h} h',
    'duration.hm': '{h} h {m} min',

    'import.title': 'Import a logger file',
    'import.hint': 'One reading per line: date and time, then the temperature. Both "2026-03-10 08:00;4,5" and "2026-03-10T08:00,4.5" work. A header line is fine.',
    'import.id': 'Shipment ID',
    'import.route': 'Route',
    'import.box': 'Box',
    'import.file': 'CSV file',
    'import.choose': 'Choose file',
    'import.noFile': 'No file chosen',
    'import.paste': 'Or paste the readings',
    'import.example': 'Fill with an example',
    'import.submit': 'Import shipment',
    'import.missingId': 'Give the shipment an ID.',
    'import.duplicate': 'There is already a shipment called {id}.',
    'import.noData': 'Choose a file or paste the readings first.',
    'import.success': 'Shipment {id} imported with {n} readings.',
    'import.errorLine': 'Line {line}: {reason}',
    'import.more': '…and {n} more problems.',

    'csv.empty': 'the file is empty.',
    'csv.columns': 'expected two columns (date/time and temperature).',
    'csv.date': 'date not recognised — use YYYY-MM-DD HH:MM.',
    'csv.temperature': 'temperature is not a number.',
    'csv.tooFew': 'at least two readings are needed.',

    'footer.text': 'Fictional data, built for study. Made by',

    'route.RT-101': 'Campinas — downtown pharmacies',
    'route.RT-102': 'Sumaré — neighbourhood pharmacies',
    'route.RT-103': 'Hortolândia — hospital and clinics',
    'route.RT-104': 'Americana — pharmacy chain',
    'route.RT-105': 'Paulínia — drugstores',
  },
};

const STORAGE_KEY = 'cold-chain-monitor:language';

// First visit: follow the browser language if it's one of ours, otherwise English.
export function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && messages[saved]) return saved;
  } catch {
    // storage blocked — fall through to the browser language
  }
  const browser = (globalThis.navigator?.language || 'en').slice(0, 2).toLowerCase();
  return messages[browser] ? browser : 'en';
}

export function saveLanguage(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // the choice just won't be remembered next time
  }
}

// Looks up a key and fills the {placeholders}. Falls back to English and then
// to the key itself, so a missing translation shows on screen instead of crashing.
export function translate(lang, key, params = {}) {
  const text = messages[lang]?.[key] ?? messages.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => (name in params ? params[name] : `{${name}}`));
}

export function hasTranslation(lang, key) {
  return key in (messages[lang] ?? {});
}

// Used by the tests, to make sure no language is missing a key.
export function allKeys(lang) {
  return Object.keys(messages[lang] ?? {});
}
