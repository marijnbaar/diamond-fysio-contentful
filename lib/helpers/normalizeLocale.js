export function normalizeLocale(input) {
  if (!input) return null;
  const str = String(input);
  const map = {
    // Map NL to the desired Contentful code (Dutch default)
    nl: 'nl-NL',
    'nl-nl': 'nl-NL',
    en: 'en-US',
    'en-en': 'en-US',
    'en-gb': 'en-US',
    de: 'de-DE',
    fr: 'fr-FR'
  };
  const lower = str.toLowerCase();
  const candidate = Object.prototype.hasOwnProperty.call(map, lower) ? map[lower] : input;
  return candidate;
}

export default normalizeLocale;
