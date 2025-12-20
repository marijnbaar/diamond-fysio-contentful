export const optimizeContentfulImage = (url, width = 1200) => {
  if (!url || typeof url !== 'string') return url;

  let hostname;
  try {
    const parsed = new URL(url);
    hostname = parsed.hostname;
  } catch (e) {
    // If the URL cannot be parsed, do not attempt to optimize it.
    return url;
  }

  const isContentfulHost =
    hostname === 'ctfassets.net' || hostname.endsWith('.ctfassets.net');
  if (!isContentfulHost) return url;

  // Voeg query params toe of update bestaande
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}&q=80&fm=webp`;
};
