// Every text on the screen, in the three languages I speak.
// Keys are grouped by screen area so it's easy to find what to change.

export const LANGUAGES = {
  en: { label: 'EN', locale: 'en-CA', name: 'English' },
  pt: { label: 'PT', locale: 'pt-BR', name: 'Português' },
  fr: { label: 'FR', locale: 'fr-CA', name: 'Français' },
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

  pt: {
    'page.title': 'Cold Chain Monitor — registros de temperatura 2–8 °C',
    'header.subtitle': 'Registros de temperatura das entregas de medicamentos refrigerados (2–8 °C)',
    'header.reset': 'Restaurar dados de exemplo',
    'header.language': 'Idioma',

    'summary.label': 'Resumo',
    'summary.shipments': 'Cargas',
    'summary.approved': 'Liberadas',
    'summary.review': 'Em análise',
    'summary.quarantine': 'Quarentena',
    'summary.excursions': 'Excursões',
    'summary.timeInRange': 'Tempo médio na faixa',

    'list.title': 'Cargas',
    'list.hint': 'Cada linha é uma caixa térmica com um data logger dentro. Clique numa carga para ver as leituras.',
    'list.filter': 'Filtrar por resultado',
    'list.all': 'Todos os resultados',
    'list.id': 'Carga',
    'list.route': 'Rota',
    'list.box': 'Caixa',
    'list.departure': 'Saída',
    'list.duration': 'Duração',
    'list.range': 'Mín. / máx.',
    'list.excursions': 'Exc.',
    'list.verdict': 'Resultado',
    'list.empty': 'Nenhuma carga para este filtro.',

    'verdict.approved': 'Liberada',
    'verdict.review': 'Em análise',
    'verdict.quarantine': 'Quarentena',

    'detail.title': 'Carga {id}',
    'detail.empty': 'Selecione uma carga na lista para ver o gráfico de temperatura e as excursões.',
    'detail.chart': 'Temperatura ao longo do tempo da carga {id}',
    'detail.min': 'Mínima',
    'detail.max': 'Máxima',
    'detail.average': 'Média',
    'detail.timeInRange': 'Tempo na faixa',
    'detail.timeOut': 'Tempo fora da faixa',
    'detail.readings': 'Leituras',
    'detail.why': 'Por que este resultado',
    'detail.next': 'O que fazer:',
    'detail.excursions': 'Excursões',
    'detail.noExcursions': 'Nenhuma excursão — todas as leituras ficaram entre 2 e 8 °C.',
    'detail.type': 'Tipo',
    'detail.from': 'De',
    'detail.to': 'Até',
    'detail.duration': 'Duração',
    'detail.peak': 'Pico',
    'detail.stillOpen': 'ainda fora da faixa na última leitura',
    'detail.gaps': 'Falta de dados',
    'detail.gap': 'Sem leituras de {start} até {end} ({duration}).',
    'detail.remove': 'Remover esta carga',

    'type.high': 'Acima de 8 °C',
    'type.low': 'Abaixo de 2 °C',

    'reason.freeze': 'Chegou a {temp} — em {limit} ou menos, o produto pode ter congelado.',
    'reason.hardMax': 'Chegou a {temp}, acima do limite máximo de {limit}. Mesmo um pico curto conta.',
    'reason.cumulative': 'Ficou {total} fora da faixa no total. A tolerância é de {limit}.',
    'reason.excursion': 'Saiu da faixa de 2–8 °C por {total}, ainda dentro da tolerância de {limit}.',
    'reason.gap': 'O data logger parou de registrar por um tempo, então não há como provar que a temperatura ficou ok.',
    'reason.none': 'Ficou entre {min} e {max} a viagem inteira, sem falta de dados.',

    'action.approved': 'Liberar os produtos normalmente.',
    'action.review': 'Enviar este relatório para a Qualidade. Ela decide se os produtos podem ser liberados.',
    'action.quarantine': 'Separar os produtos, identificados como quarentena, até a análise da Qualidade.',

    'chart.allowed': 'Faixa permitida (2–8 °C)',
    'chart.reading': 'Leituras',
    'chart.out': 'Fora da faixa',
    'chart.limits': 'Limites críticos',

    'duration.min': '{m} min',
    'duration.h': '{h} h',
    'duration.hm': '{h} h {m} min',

    'import.title': 'Importar arquivo do data logger',
    'import.hint': 'Uma leitura por linha: data e hora, depois a temperatura. Funciona tanto "2026-03-10 08:00;4,5" quanto "2026-03-10T08:00,4.5". Pode ter linha de cabeçalho.',
    'import.id': 'Identificação da carga',
    'import.route': 'Rota',
    'import.box': 'Caixa',
    'import.file': 'Arquivo CSV',
    'import.choose': 'Escolher arquivo',
    'import.noFile': 'Nenhum arquivo escolhido',
    'import.paste': 'Ou cole as leituras',
    'import.example': 'Preencher com um exemplo',
    'import.submit': 'Importar carga',
    'import.missingId': 'Informe a identificação da carga.',
    'import.duplicate': 'Já existe uma carga chamada {id}.',
    'import.noData': 'Escolha um arquivo ou cole as leituras primeiro.',
    'import.success': 'Carga {id} importada com {n} leituras.',
    'import.errorLine': 'Linha {line}: {reason}',
    'import.more': '…e mais {n} problemas.',

    'csv.empty': 'o arquivo está vazio.',
    'csv.columns': 'eram esperadas duas colunas (data/hora e temperatura).',
    'csv.date': 'data não reconhecida — use AAAA-MM-DD HH:MM.',
    'csv.temperature': 'a temperatura não é um número.',
    'csv.tooFew': 'são necessárias pelo menos duas leituras.',

    'footer.text': 'Dados fictícios, feito para estudo. Criado por',

    'route.RT-101': 'Campinas — farmácias do centro',
    'route.RT-102': 'Sumaré — farmácias de bairro',
    'route.RT-103': 'Hortolândia — hospital e clínicas',
    'route.RT-104': 'Americana — rede de farmácias',
    'route.RT-105': 'Paulínia — drogarias',
  },

  fr: {
    'page.title': 'Cold Chain Monitor — relevés de température 2–8 °C',
    'header.subtitle': 'Relevés de température des livraisons de médicaments réfrigérés (2–8 °C)',
    'header.reset': 'Réinitialiser les données',
    'header.language': 'Langue',

    'summary.label': 'Résumé',
    'summary.shipments': 'Expéditions',
    'summary.approved': 'Libérées',
    'summary.review': 'À analyser',
    'summary.quarantine': 'Quarantaine',
    'summary.excursions': 'Excursions',
    'summary.timeInRange': 'Temps moyen dans la plage',

    'list.title': 'Expéditions',
    'list.hint': 'Chaque ligne correspond à une caisse isotherme équipée d’un enregistreur de température. Cliquez sur une expédition pour voir ses relevés.',
    'list.filter': 'Filtrer par résultat',
    'list.all': 'Tous les résultats',
    'list.id': 'Expédition',
    'list.route': 'Tournée',
    'list.box': 'Caisse',
    'list.departure': 'Départ',
    'list.duration': 'Durée',
    'list.range': 'Min. / max.',
    'list.excursions': 'Exc.',
    'list.verdict': 'Résultat',
    'list.empty': 'Aucune expédition pour ce filtre.',

    'verdict.approved': 'Libérée',
    'verdict.review': 'À analyser',
    'verdict.quarantine': 'Quarantaine',

    'detail.title': 'Expédition {id}',
    'detail.empty': 'Sélectionnez une expédition dans la liste pour voir la courbe de température et les excursions.',
    'detail.chart': 'Évolution de la température de l’expédition {id}',
    'detail.min': 'Minimum',
    'detail.max': 'Maximum',
    'detail.average': 'Moyenne',
    'detail.timeInRange': 'Temps dans la plage',
    'detail.timeOut': 'Temps hors plage',
    'detail.readings': 'Relevés',
    'detail.why': 'Pourquoi ce résultat',
    'detail.next': 'Que faire :',
    'detail.excursions': 'Excursions',
    'detail.noExcursions': 'Aucune excursion — tous les relevés sont restés entre 2 et 8 °C.',
    'detail.type': 'Type',
    'detail.from': 'Début',
    'detail.to': 'Fin',
    'detail.duration': 'Durée',
    'detail.peak': 'Pic',
    'detail.stillOpen': 'toujours hors plage au dernier relevé',
    'detail.gaps': 'Données manquantes',
    'detail.gap': 'Aucun relevé de {start} à {end} ({duration}).',
    'detail.remove': 'Supprimer cette expédition',

    'type.high': 'Trop chaud',
    'type.low': 'Trop froid',

    'reason.freeze': 'Température de {temp} — à {limit} ou moins, le produit a pu geler.',
    'reason.hardMax': 'Température de {temp}, au-dessus de la limite critique de {limit}. Même un pic court compte.',
    'reason.cumulative': 'Hors plage pendant {total} au total. La tolérance est de {limit}.',
    'reason.excursion': 'Sortie de la plage 2–8 °C pendant {total}, toujours dans la tolérance de {limit}.',
    'reason.gap': 'L’enregistreur a cessé d’enregistrer pendant un moment : rien ne prouve que la température était correcte.',
    'reason.none': 'Entre {min} et {max} pendant tout le trajet, sans données manquantes.',

    'action.approved': 'Libérer les produits normalement.',
    'action.review': 'Envoyer ce rapport au service qualité, qui décide si les produits peuvent être libérés.',
    'action.quarantine': 'Isoler les produits, identifiés en quarantaine, jusqu’à l’analyse du service qualité.',

    'chart.allowed': 'Plage autorisée (2–8 °C)',
    'chart.reading': 'Relevés',
    'chart.out': 'Hors plage',
    'chart.limits': 'Limites critiques',

    'duration.min': '{m} min',
    'duration.h': '{h} h',
    'duration.hm': '{h} h {m} min',

    'import.title': 'Importer un fichier d’enregistreur',
    'import.hint': 'Un relevé par ligne : date et heure, puis la température. « 2026-03-10 08:00;4,5 » et « 2026-03-10T08:00,4.5 » fonctionnent tous les deux. Une ligne d’en-tête est acceptée.',
    'import.id': 'Numéro d’expédition',
    'import.route': 'Tournée',
    'import.box': 'Caisse',
    'import.file': 'Fichier CSV',
    'import.choose': 'Choisir un fichier',
    'import.noFile': 'Aucun fichier choisi',
    'import.paste': 'Ou collez les relevés',
    'import.example': 'Remplir avec un exemple',
    'import.submit': 'Importer l’expédition',
    'import.missingId': 'Indiquez un numéro d’expédition.',
    'import.duplicate': 'Une expédition {id} existe déjà.',
    'import.noData': 'Choisissez un fichier ou collez d’abord les relevés.',
    'import.success': 'Expédition {id} importée avec {n} relevés.',
    'import.errorLine': 'Ligne {line} : {reason}',
    'import.more': '… et {n} autres problèmes.',

    'csv.empty': 'le fichier est vide.',
    'csv.columns': 'deux colonnes attendues (date/heure et température).',
    'csv.date': 'date non reconnue — utilisez AAAA-MM-JJ HH:MM.',
    'csv.temperature': 'la température n’est pas un nombre.',
    'csv.tooFew': 'il faut au moins deux relevés.',

    'footer.text': 'Données fictives, projet d’étude. Réalisé par',

    'route.RT-101': 'Campinas — pharmacies du centre-ville',
    'route.RT-102': 'Sumaré — pharmacies de quartier',
    'route.RT-103': 'Hortolândia — hôpital et cliniques',
    'route.RT-104': 'Americana — chaîne de pharmacies',
    'route.RT-105': 'Paulínia — pharmacies',
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
