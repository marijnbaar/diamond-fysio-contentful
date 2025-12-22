import { useState, useEffect } from 'react';
import { XIcon } from '@heroicons/react/outline';

export default function WebsitePopup({ info, email }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Korte vertraging zodat de animatie smooth binnenkomt na laden
    let timer;
    if (info) {
      setIsOpen(true);
      timer = setTimeout(() => setIsVisible(true), 1000);
    }
    return () => clearTimeout(timer);
  }, [info]);

  if (!isOpen || !info) return null;

  const handleClose = () => {
    setIsVisible(false);
    // Wacht tot de fade-out klaar is voordat we hem uit de DOM halen
    setTimeout(() => setIsOpen(false), 500);
  };

  return (
    <div
      className={`fixed z-50 bottom-4 right-4 sm:bottom-8 sm:right-8 w-full max-w-sm px-4 sm:px-0 pointer-events-none transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-teal-500/20 ring-1 ring-black/5 pointer-events-auto">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-teal-400 to-cyan-500" />

        <div className="p-5 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
            aria-label="Sluiten"
          >
            <XIcon className="h-4 w-4" />
          </button>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center animate-bounce-slow">
                <span className="text-lg">🎄</span>
              </div>
            </div>

            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mededeling</h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                {info}
                {email && (
                  <>
                    {' '}
                    <a
                      href={`mailto:${email}`}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline font-medium"
                    >
                      {email}
                    </a>
                  </>
                )}
              </p>

              <button
                onClick={handleClose}
                className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline transition-colors"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </div>
  );
}
