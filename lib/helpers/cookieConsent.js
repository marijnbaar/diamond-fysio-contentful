import { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';

export function useCookieConsent() {
  const [cookieConsent, setCookieConsent] = useState({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const consentCookie = getCookie('cookie-consent');

    if (consentCookie) {
      try {
        setCookieConsent(JSON.parse(consentCookie));
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }

    setLoaded(true);
  }, []);

  return { cookieConsent, loaded };
}
