import Link from 'next/link';
import createSlug from '../../lib/helpers/createSlug';
import { forwardRef, useState } from 'react';
import Image from 'next/image';
import CookieSettings from './CookieConsent';
import { useRouter } from 'next/router';

const MyLink = forwardRef(({ href, children, ...rest }, ref) => {
  return (
    <Link href={href} legacyBehavior>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  );
});

MyLink.displayName = 'MyLink';

export default function Footer({ footer }) {
  const router = useRouter();
  const locale = router?.locale || 'nl';
  const isEn = locale === 'en';
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const t = {
    backToTop: isEn ? 'Back to top' : 'Terug naar boven',
    footerLabel: isEn ? 'Footer' : 'Footer',
    dePraktijk: isEn ? 'THE PRACTICE' : 'DE PRAKTIJK',
    support: isEn ? 'SUPPORT' : 'SUPPORT',
    privacyHeading: isEn ? 'PRIVACY & DATA PROTECTION' : 'PRIVACY & GEGEVENSBESCHERMING',
    cookieHeading: isEn ? 'COOKIE POLICY' : 'COOKIEBELEID',
    gdprCompliant: 'AVG / GDPR Compliant',
    moreInfo: isEn ? 'More information' : 'Meer informatie',
    privacyLinkLabel: isEn ? 'Read our privacy statement' : 'Lees onze privacyverklaring',
    cookieDescription: isEn
      ? 'We use cookies to improve your experience on our website. You can adjust your cookie preferences below.'
      : 'Wij gebruiken cookies om uw ervaring op onze website te verbeteren. U kunt uw cookie-voorkeuren hieronder aanpassen.',
    copyrightSuffix: 'All rights reserved.',
    privacyBody: isEn
      ? 'Diamond Fysio Amsterdam complies with the requirements of the General Data Protection Regulation (GDPR). We take your privacy very seriously.'
      : 'Diamond Fysio Amsterdam voldoet aan de eisen van de Algemene Verordening Gegevensbescherming (AVG/GDPR). Wij nemen uw privacy zeer serieus.'
  };

  return (
    <footer className="bg-white border-t border-gray-200 relative" aria-labelledby="footer-heading">
      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="absolute right-8 -top-6 text-white rounded-full p-3 shadow-md bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-label={t.backToTop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>

      <h2 id="footer-heading" className="sr-only">
        {t.footerLabel}
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Top section with main columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1: Logo and Description */}
          <div className="md:col-span-1">
            <div className="z-10 h-20 w-20 relative mb-6">
              {/* Use the new logo image */}
              <Image
                src="/images/logo.jpg"
                alt="Diamond Fysio Logo"
                fill
                className="rounded object-cover"
                quality="100"
              />
            </div>
            {footer?.description && (
              <p className="text-gray-500 text-base mb-6">{footer.description}</p>
            )}
            <div className="flex items-center space-x-6 mt-4">
              <a
                href={footer.facebookLink || '#'}
                className="text-gray-300 hover:text-gray-500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <span className="sr-only">Facebook</span>
                <div className="h-8 w-8" aria-hidden="true">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </a>
              <a
                href={footer.instagramLink || '#'}
                className="text-gray-300 hover:text-gray-500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <span className="sr-only">Instagram</span>
                <div className="h-8 w-8" aria-hidden="true">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    />
                  </svg>
                </div>
              </a>
              <a
                href={footer.linkedInLink || '#'}
                className="text-gray-300 hover:text-gray-500"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <div className="h-8 w-8 flex items-center justify-center" aria-hidden="true">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="linkedin-in"
                    className="w-5"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
                    ></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Column 2: DE PRAKTIJK */}
          <div className="md:col-span-1">
            <h3 className="text-base font-medium text-gray-400 uppercase mb-4 break-words">
              {(footer.footerSubmenu && footer.footerSubmenu[0]?.title) || t.dePraktijk}
            </h3>
            <ul className="space-y-2">
              {footer.footerSubmenu &&
                footer.footerSubmenu[0]?.menuItems.map((menuItem) =>
                  menuItem.internalLink || menuItem.externalLink ? (
                    <li key={menuItem.sys.id}>
                      <MyLink
                        href={
                          menuItem.internalLink
                            ? createSlug(menuItem.internalLink.slug, menuItem.internalLink.pageType)
                            : menuItem.externalLink
                        }
                        className="text-gray-600 hover:text-teal-500 transition-colors"
                      >
                        {menuItem.title && menuItem.title}
                      </MyLink>
                    </li>
                  ) : (
                    <li key={menuItem.sys.id} className="text-gray-600 cursor-not-allowed">
                      {menuItem.title && menuItem.title}
                    </li>
                  )
                )}
            </ul>
          </div>

          {/* Column 3: SUPPORT */}
          <div className="md:col-span-1">
            <h3 className="text-base font-medium text-gray-400 uppercase mb-4 break-words">
              {(footer.footerSubmenu && footer.footerSubmenu[1]?.title) || t.support}
            </h3>
            <ul className="space-y-2">
              {footer.footerSubmenu &&
                footer.footerSubmenu[1]?.menuItems.map((menuItem) =>
                  menuItem.internalLink || menuItem.externalLink ? (
                    <li key={menuItem.sys.id}>
                      <MyLink
                        href={
                          menuItem.internalLink
                            ? createSlug(menuItem.internalLink.slug, menuItem.internalLink.pageType)
                            : menuItem.externalLink
                        }
                        className="text-gray-600 hover:text-teal-500 transition-colors"
                      >
                        {menuItem.title && menuItem.title}
                      </MyLink>
                    </li>
                  ) : (
                    <li key={menuItem.sys.id} className="text-gray-600 cursor-not-allowed">
                      {menuItem.title && menuItem.title}
                    </li>
                  )
                )}
            </ul>
          </div>

          {/* Column 4: PRIVACY & GEGEVENSBESCHERMING */}
          <div className="md:col-span-1">
            <h3 className="text-base font-medium text-gray-400 uppercase mb-4 break-words">
              {t.privacyHeading}
            </h3>
            <div className="flex items-center mb-3">
              <div className="text-teal-500 mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600">{t.gdprCompliant}</span>
            </div>
            <button
              onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
              className="text-sm text-white py-2 px-4 rounded bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {t.moreInfo}
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                showPrivacyInfo ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-4 bg-gray-100 rounded-md text-sm text-gray-600 shadow-sm">
                <p>{t.privacyBody}</p>
                <p className="mt-2">
                  <Link href="/privacy-policy" legacyBehavior>
                    <a className="text-teal-600 hover:underline font-medium">
                      {t.privacyLinkLabel}
                    </a>
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Column 5: COOKIEBELEID */}
          <div className="md:col-span-1">
            <h3 className="text-base font-medium text-gray-400 uppercase mb-4">
              {t.cookieHeading}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{t.cookieDescription}</p>
            <CookieSettings />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2025, Diamond Fysio Amsterdam. {t.copyrightSuffix}
          </p>
        </div>
      </div>
    </footer>
  );
}
