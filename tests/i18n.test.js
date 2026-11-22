import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, translate, allKeys } from '../js/i18n.js';

// If I add a text in English and forget PT or FR, this test catches it.
test('every language has the same keys as English', () => {
  const english = allKeys('en').sort();
  for (const lang of Object.keys(LANGUAGES)) {
    assert.deepEqual(allKeys(lang).sort(), english, `missing or extra keys in "${lang}"`);
  }
});

test('fills placeholders', () => {
  assert.equal(translate('pt', 'detail.title', { id: 'RT-101' }), 'Carga RT-101');
  assert.equal(translate('fr', 'import.errorLine', { line: 4, reason: 'x' }), 'Ligne 4 : x');
});

test('falls back to English, then to the key itself', () => {
  assert.equal(translate('de', 'verdict.quarantine'), 'Quarantine');
  assert.equal(translate('pt', 'does.not.exist'), 'does.not.exist');
});

// A translation that drops {n} or {id} would show a sentence without the
// number that matters, so the placeholders have to match too.
test('translations keep the same {placeholders} as English', () => {
  const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join(',');
  for (const lang of Object.keys(LANGUAGES)) {
    for (const key of allKeys('en')) {
      assert.equal(placeholders(translate(lang, key)), placeholders(translate('en', key)), `${lang}: ${key}`);
    }
  }
});
