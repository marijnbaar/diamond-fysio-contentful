'use client';

import { useState, useEffect } from 'react';
import { getCookie, setCookie } from 'cookies-next';

export default function CookieSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showFirstLoadConsent, setShowFirstLoadConsent] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    preferences: false
  });

  // Check and show consent on first load
  useEffect(() => {
    // Ensure this runs only on client-side
    if (typeof window !== 'undefined') {
      // Check if this is the first ever visit
      const hasVisitedBefore = localStorage.getItem('cookie-consent-first-visit');
      const existingCookie = getCookie('cookie-consent');

      if (!hasVisitedBefore && !existingCookie) {
        // This is the first visit
        setShowFirstLoadConsent(true);
        localStorage.setItem('cookie-consent-first-visit', 'true');
      }

      // Load saved preferences
      const loadSavedPreferences = () => {
        const savedConsentCookie = getCookie('cookie-consent');
        if (savedConsentCookie) {
          try {
            const savedPreferences = JSON.parse(savedConsentCookie.toString());
            console.log('Loaded cookie preferences:', savedPreferences);
            setCookiePreferences(savedPreferences);
          } catch (e) {
            console.error('Error parsing cookie preferences', e);
          }
        }
      };

      loadSavedPreferences();

      // Mark as mounted
      setMounted(true);

      // Set up listener for the openCookieSettings event
      const handleOpenCookieSettingsEvent = () => {
        console.log('Cookie settings event received');
        handleOpenSettings();
      };

      window.addEventListener('openCookieSettings', handleOpenCookieSettingsEvent);

      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener('openCookieSettings', handleOpenCookieSettingsEvent);
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Don't render on server or before mount
  if (typeof window === 'undefined' || !mounted) {
    return null;
  }

  // Load saved preferences when modal opens
  const handleOpenSettings = () => {
    // Refresh the preferences when opening the modal
    const consentCookie = getCookie('cookie-consent');
    if (consentCookie) {
      try {
        setCookiePreferences(JSON.parse(consentCookie.toString()));
      } catch (e) {
        console.error('Error parsing cookie preferences', e);
      }
    }
    setShowSettings(true);
    setShowFirstLoadConsent(false);
  };

  const handleTogglePreference = (key) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled

    setCookiePreferences((prev) => {
      const newPrefs = {
        ...prev,
        [key]: !prev[key]
      };
      return newPrefs;
    });
  };

  const handleSavePreferences = () => {
    // Save cookie with a longer expiration time
    setCookie('cookie-consent', JSON.stringify(cookiePreferences), {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    });

    console.log('Saved cookie preferences:', cookiePreferences);

    // Apply preferences
    if (cookiePreferences.analytics) {
      console.log('Analytics cookies enabled');
      // Add analytics initialization code here
    }

    if (cookiePreferences.marketing) {
      console.log('Marketing cookies enabled');
      // Add marketing cookies initialization code here
    }

    if (cookiePreferences.preferences) {
      console.log('Preference cookies enabled');
      // Add preference cookies initialization code here
    }

    setShowSettings(false);
    setShowFirstLoadConsent(false);
  };

  const handleRejectAll = () => {
    // Save cookie with only essential cookies enabled
    const rejectedPreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };

    setCookie('cookie-consent', JSON.stringify(rejectedPreferences), {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: window.location.protocol === 'https:'
    });

    setShowSettings(false);
    setShowFirstLoadConsent(false);
  };

  return (
    <>
      {/* Existing settings button */}
      <button
        onClick={handleOpenSettings}
        className="text-sm bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600 transition-all duration-300 focus:outline-none"
      >
        Cookie instellingen
      </button>

      {/* First load consent popup */}
      {showFirstLoadConsent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Cookie Voorkeuren</h2>
            <p className="mb-4 text-gray-700">
              We gebruiken cookies om uw ervaring te verbeteren en anonieme statistieken te
              verzamelen. Kunt u ons toestemming geven voor het gebruik van cookies?
            </p>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded transition-colors"
              >
                Alleen essentiële cookies
              </button>
              <button
                onClick={handleOpenSettings}
                className="flex-1 px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                Mijn voorkeuren beheren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-4">Cookie instellingen</h2>

            <div className="space-y-4 mb-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Essentiële Cookies</p>
                  <p className="text-sm text-gray-600">
                    Vereist voor het functioneren van de website. Kan niet worden uitgeschakeld.
                  </p>
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
                  <p className="font-medium">Analytics Cookies</p>
                  <p className="text-sm text-gray-600">
                    Helpt ons de website te verbeteren door anonieme gebruiksinformatie te
                    verzamelen.
                  </p>
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
                  <p className="font-medium">Marketing Cookies</p>
                  <p className="text-sm text-gray-600">
                    Wordt gebruikt om bezoekers op websites te volgen om relevante advertenties weer
                    te geven.
                  </p>
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
                  <p className="font-medium">Voorkeur Cookies</p>
                  <p className="text-sm text-gray-600">
                    Stelt de website in staat om keuzes te onthouden die u maakt (zoals uw
                    gebruikersnaam of taal).
                  </p>
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
                Annuleren
              </button>
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 text-sm bg-teal-500 hover:bg-teal-600 text-white rounded transition-colors"
              >
                Voorkeuren opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
