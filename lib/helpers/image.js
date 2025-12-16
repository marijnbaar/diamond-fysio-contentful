export const optimizeContentfulImage = (url, width = 1200) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('ctfassets.net')) return url;

  // Voeg query params toe of update bestaande
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=80&fm=webp`;
};
