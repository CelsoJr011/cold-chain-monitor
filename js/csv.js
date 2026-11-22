// Reads the CSV a temperature logger exports: one reading per line,
// "date time" and "temperature".
//
// Loggers configured in Brazil usually export with ";" as separator and a
// comma as decimal mark ("4,5"). Others use "," and a dot ("4.5"). Both work.

const MIN_READINGS = 2;

function detectSeparator(line) {
  return line.includes(';') ? ';' : ',';
}

function looksLikeHeader(columns) {
  // "time;temp", "Data/Hora;Temperatura (°C)"... anything where the second
  // column isn't a number is treated as a header and skipped.
  return columns.length >= 2 && Number.isNaN(Number(columns[1].replace(',', '.')));
}

// Returns { readings, errors }. Errors carry the line number and a reason
// code instead of a sentence, so the screen can show them in any language.
export function parseLoggerCsv(text) {
  const lines = String(text)
    .split(/\r?\n/)
    .map((line, index) => ({ number: index + 1, content: line.trim() }))
    .filter((line) => line.content !== '');

  if (lines.length === 0) return { readings: [], errors: [{ line: 0, reason: 'empty' }] };

  const separator = detectSeparator(lines[0].content);
  const readings = [];
  const errors = [];

  lines.forEach((line, index) => {
    const columns = line.content.split(separator).map((c) => c.trim());

    if (index === 0 && looksLikeHeader(columns)) return;

    if (columns.length < 2) {
      errors.push({ line: line.number, reason: 'columns' });
      return;
    }

    const [timeText, tempText] = columns;
    const time = timeText.replace(' ', 'T');
    const date = new Date(time);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(time) || Number.isNaN(date.getTime())) {
      errors.push({ line: line.number, reason: 'date' });
      return;
    }

    // With ";" as separator the decimal mark can be a comma. With "," as
    // separator it can't, otherwise "4,5" would already be two columns.
    const temp = Number(separator === ';' ? tempText.replace(',', '.') : tempText);
    if (tempText === '' || !Number.isFinite(temp)) {
      errors.push({ line: line.number, reason: 'temperature' });
      return;
    }

    readings.push({ time: time.slice(0, 16), temp });
  });

  if (errors.length === 0 && readings.length < MIN_READINGS) {
    errors.push({ line: 0, reason: 'tooFew' });
  }

  return { readings, errors };
}
