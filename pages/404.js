import Link from 'next/link';
import { useRouter } from 'next/router';

function FourOhFour() {
  const router = useRouter();
  const locale = router?.locale || 'nl';
  const isEn = locale === 'en';

  const t = {
    title: isEn ? 'Page not found' : 'Pagina niet gevonden',
    description: isEn
      ? 'Check the URL in your browser and try again.'
      : 'Check de url in de browser, en probeer het opnieuw.',
    homeButton: isEn ? 'Go back to home' : 'Ga terug naar home',
    contactButton: 'Contact'
  };

  const homeHref = locale === 'en' ? '/en' : '/';
  const contactHref = locale === 'en' ? '/en/contact' : '/contact';

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="max-w-max mx-auto">
        <main className="sm:flex">
          <p className="text-4xl font-extrabold text-teal-500 dark:text-teal-400 sm:text-5xl">
            404
          </p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 dark:sm:border-gray-700 sm:pl-6">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-5xl">
                {t.title}
              </h1>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">{t.description}</p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link
                href={homeHref}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-500 dark:bg-teal-600 hover:bg-teal-400 dark:hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
              >
                {t.homeButton}
              </Link>
              <Link
                href={contactHref}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
              >
                {t.contactButton}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

FourOhFour.displayName = 'FourOhFour';
export default FourOhFour;
