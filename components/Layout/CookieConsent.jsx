'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCookie, setCookie } from 'cookies-next';

export default function CookieSettings() {
  const { locale } = useRouter();
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showFirstLoadConsent, setShowFirstLoadConsent] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  const t =
    locale === 'en'
      ? {
          openButton: 'Cookie settings',
          modalTitle: 'Cookie settings',
          firstTitle: 'Cookie Preferences',
          firstText:
            'We use cookies to improve your experience and collect anonymous statistics. Do you allow cookies?',
          onlyEssential: 'Only essential cookies',
          managePrefs: 'Manage my preferences',
          sections: {
            essentialTitle: 'Essential cookies',
            essentialDesc: 'Required for the website to function. Cannot be disabled.',
            analyticsTitle: 'Analytics cookies',
            analyticsDesc:
              'Helps us improve the website by collecting anonymous usage information.',
            marketingTitle: 'Marketing cookies',
            marketingDesc: 'Used to track visitors to show relevant ads.',
            preferencesTitle: 'Preference cookies',
            preferencesDesc: 'Allows the website to remember your choices (e.g. language).'
          },
          cancel: 'Cancel',
          save: 'Save preferences'
        }
      : {
          openButton: 'Cookie instellingen',
          modalTitle: 'Cookie instellingen',
          firstTitle: 'Cookie Voorkeuren',
          firstText:
            'We gebruiken cookies om uw ervaring te verbeteren en anonieme statistieken te verzamelen. Kunt u ons toestemming geven voor het gebruik van cookies?',
          onlyEssential: 'Alleen essentiële cookies',
          managePrefs: 'Mijn voorkeuren beheren',
          sections: {
            essentialTitle: 'Essentiële Cookies',
            essentialDesc:
              'Vereist voor het functioneren van de website. Kan niet worden uitgeschakeld.',
            analyticsTitle: 'Analytics Cookies',
            analyticsDesc:
              'Helpt ons de website te verbeteren door anonieme gebruiksinformatie te verzamelen.',
            marketingTitle: 'Marketing Cookies',
            marketingDesc:
              'Wordt gebruikt om bezoekers op websites te volgen om relevante advertenties weer te geven.',
            preferencesTitle: 'Voorkeur Cookies',
            preferencesDesc:
              'Stelt de website in staat om keuzes te onthouden die u maakt (zoals uw gebruikersnaam of taal).'
          },
          cancel: 'Annuleren',
          save: 'Voorkeuren opslaan'
        };

  // Check and show consent on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasVisitedBefore = localStorage.getItem('cookie-consent-first-visit');
      const existingCookie = getCookie('cookie-consent');

      if (!hasVisitedBefore && !existingCookie) {
        setShowFirstLoadConsent(true);
        localStorage.setItem('cookie-consent-first-visit', 'true');
      }

      const loadSavedPreferences = () => {
        const savedConsentCookie = getCookie('cookie-consent');
        if (savedConsentCookie) {
          try {
            const savedPreferences = JSON.parse(savedConsentCookie.toString());
            setCookiePreferences(savedPreferences);
          } catch {}
        }
      };

      loadSavedPreferences();
      setMounted(true);

      const handleOpenCookieSettingsEvent = () => {
        handleOpenSettings();
      };

      window.addEventListener('openCookieSettings', handleOpenCookieSettingsEvent);
      return () => {
        window.removeEventListener('openCookieSettings', handleOpenCookieSettingsEvent);
      };
    }
  }, []);

  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  const handleOpenSettings = () => {
    const consentCookie = getCookie('cookie-consent');
    if (consentCookie) {
      try {
        setCookiePreferences(JSON.parse(consentCookie.toString()));
      } catch {}
    }
    setShowSettings(true);
    setShowFirstLoadConsent(false);
  };

  const handleTogglePreference = (key) => {
    if (key === 'essential') return;
    setCookiePreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSavePreferences = () => {
    setCookie('cookie-consent', JSON.stringify(cookiePreferences), {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    });
    setShowSettings(false);
    setShowFirstLoadConsent(false);
  };

  const handleRejectAll = () => {
    const rejectedPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setCookie('cookie-consent', JSON.stringify(rejectedPreferences), {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    });
    setShowSettings(false);
    setShowFirstLoadConsent(false);
  };

  return (
    <>
      <button
        onClick={handleOpenSettings}
        className="text-sm bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition-all duration-300 focus:outline-none"
      >
        {t.openButton}
      </button>

      {showFirstLoadConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">{t.firstTitle}</h2>
            <p className="mb-4 text-gray-700">{t.firstText}</p>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                {t.onlyEssential}
              </button>
              <button
                onClick={handleOpenSettings}
                className="flex-1 px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                {t.managePrefs}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">{t.modalTitle}</h2>

            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">{t.sections.essentialTitle}</p>
                  <p className="text-sm text-gray-600">{t.sections.essentialDesc}</p>
                </div>
                <div className="relative">
                  <div className="w-12 h-6 bg-teal-500 rounded-full overflow-hidden">
                    <div className="w-full h-full flex items-center justify-end transition-all duration-200">
                      <span className="block w-4 h-4 mr-1 rounded-full bg-white"></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">{t.sections.analyticsTitle}</p>
                  <p className="text-sm text-gray-600">{t.sections.analyticsDesc}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleTogglePreference('analytics')}
                    className="w-12 h-6 rounded-full overflow-hidden"
                    role="switch"
                    aria-checked={cookiePreferences.analytics}
                  >
                    <div
                      className={`w-full h-full ${
                        cookiePreferences.analytics ? 'bg-teal-500' : 'bg-gray-200'
                      } flex items-center ${
                        cookiePreferences.analytics ? 'justify-end' : 'justify-start'
                      } transition-all duration-200`}
                    >
                      <span
                        className={`block w-4 h-4 ${
                          cookiePreferences.analytics ? 'mr-1' : 'ml-1'
                        } rounded-full bg-white`}
                      ></span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">{t.sections.marketingTitle}</p>
                  <p className="text-sm text-gray-600">{t.sections.marketingDesc}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleTogglePreference('marketing')}
                    className="w-12 h-6 rounded-full overflow-hidden"
                    role="switch"
                    aria-checked={cookiePreferences.marketing}
                  >
                    <div
                      className={`w-full h-full ${
                        cookiePreferences.marketing ? 'bg-teal-500' : 'bg-gray-200'
                      } flex items-center ${
                        cookiePreferences.marketing ? 'justify-end' : 'justify-start'
                      } transition-all duration-200`}
                    >
                      <span
                        className={`block w-4 h-4 ${
                          cookiePreferences.marketing ? 'mr-1' : 'ml-1'
                        } rounded-full bg-white`}
                      ></span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">{t.sections.preferencesTitle}</p>
                  <p className="text-sm text-gray-600">{t.sections.preferencesDesc}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => handleTogglePreference('preferences')}
                    className="w-12 h-6 rounded-full overflow-hidden"
                    role="switch"
                    aria-checked={cookiePreferences.preferences}
                  >
                    <div
                      className={`w-full h-full ${
                        cookiePreferences.preferences ? 'bg-teal-500' : 'bg-gray-200'
                      } flex items-center ${
                        cookiePreferences.preferences ? 'justify-end' : 'justify-start'
                      } transition-all duration-200`}
                    >
                      <span
                        className={`block w-4 h-4 ${
                          cookiePreferences.preferences ? 'mr-1' : 'ml-1'
                        } rounded-full bg-white`}
                      ></span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
