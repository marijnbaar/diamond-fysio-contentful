/**
 * BotID Client-side Utility
 *
 * This utility handles BotID token generation and verification on the client side.
 */

const BOTID_PUBLIC_KEY = process.env.NEXT_PUBLIC_BOTID_PUBLIC_KEY || '';

/**
 * Initialize BotID widget
 * @param {string} formId - Optional form ID to attach BotID to
 * @returns {Promise<string>} BotID token
 */
export async function initBotID(formId = null) {
  if (!BOTID_PUBLIC_KEY) {
    console.warn('NEXT_PUBLIC_BOTID_PUBLIC_KEY not configured. BotID protection is disabled.');
    return null;
  }

  // Load BotID script if not already loaded
  if (typeof window !== 'undefined' && !window.botid) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.botid.com/v1/botid.js';
      script.async = true;
      script.onload = () => {
        if (window.botid) {
          window.botid
            .init(BOTID_PUBLIC_KEY)
            .then(() => {
              const token = window.botid.getToken();
              resolve(token);
            })
            .catch(reject);
        } else {
          reject(new Error('BotID failed to initialize'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load BotID script'));
      document.head.appendChild(script);
    });
  }

  // If already loaded, just get the token
  if (typeof window !== 'undefined' && window.botid) {
    try {
      await window.botid.init(BOTID_PUBLIC_KEY);
      return window.botid.getToken();
    } catch (error) {
      console.error('BotID initialization error:', error);
      return null;
    }
  }

  return null;
}

/**
 * Get BotID token for form submission
 * @returns {Promise<string|null>}
 */
export async function getBotIDToken() {
  if (typeof window === 'undefined') return null;

  try {
    const token = await initBotID();
    return token;
  } catch (error) {
    console.error('Failed to get BotID token:', error);
    return null;
  }
}

/**
 * Hook for React components to use BotID
 * Requires React to be imported in the component file
 * @returns {Object} { token, loading, error }
 */
export function createBotIDHook(React) {
  return function useBotID() {
    const [token, setToken] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        getBotIDToken()
          .then((t) => {
            setToken(t);
            setLoading(false);
          })
          .catch((e) => {
            setError(e.message);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }, []);

    return { token, loading, error };
  };
}
