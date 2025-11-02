import { MailIcon, PhoneIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Contactform from './Contactform';
import { BLOCKS } from '@contentful/rich-text-types';
import { useRouter } from 'next/router';

export default function Contact({
  title,
  description,
  subtitle,
  contactDescription,
  phonenumber,
  email,
  linkedInLink,
  facebookLink,
  instagramLink
}) {
  const router = useRouter();
  const locale = router?.locale || 'nl';
  const isEn = locale === 'en';

  // Localized strings
  const t = {
    contactHeader: isEn ? 'Get in touch' : 'Neem contact op',
    defaultTitle: isEn ? 'Contact Us' : 'Contacteer Ons',
    defaultDescription: isEn
      ? "We would love to hear from you. Send us a message and we will get back to you as soon as possible. You can also contact your therapist directly (you can find this information on the homepage). You can always email - if it's urgent, send a text."
      : 'We horen graag van u. Stuur ons een bericht en we nemen zo snel mogelijk contact met u op. Je kunt ook rechtstreeks contact opnemen met je therapeut (deze gegevens vind je op de homepagina). Mailen kan altijd - heeft het spoed, stuur een appje.',
    defaultSubtitle: isEn ? 'Contact information' : 'Contactinformatie',
    defaultContactSubtitle: isEn ? 'Contact details' : 'Contactgegevens',
    defaultContactDescription: isEn
      ? 'We are here to help and answer all your questions. We look forward to hearing from you.'
      : 'Wij staan voor u klaar om te helpen en al uw vragen te beantwoorden. We kijken ernaar uit om van u te horen.',
    phoneLabel: isEn ? 'Phone number' : 'Telefoonnummer',
    emailLabel: isEn ? 'Email' : 'E-mail',
    locationLabel: isEn ? 'Location' : 'Locatie',
    phoneNumber: isEn ? 'Phone number' : 'Telefoonnummer',
    characters: isEn ? 'characters' : 'karakters'
  };
  const RICHTEXT_OPTIONS = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => {
        return (
          <p className="text-base text-left font-medium tracking-wide max-w-xs text-white leading-7">
            {children}
          </p>
        );
      },
      [BLOCKS.HEADING_2]: (node, children) => {
        return <h3 className="mt-5 text-xl font-semibold text-white">{children}</h3>;
      }
    }
  };

  return (
    <div className="bg-gray-50">
      <main>
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto pt-36 pb-16 px-4 sm:px-6 lg:px-8">
            <div className="relative z-10">
              <div className="max-w-3xl pr-4">
                <span className="text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase text-sm">
                  {t.contactHeader}
                </span>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
                  {title || t.defaultTitle}
                </h1>
                <div className="mt-6">
                  <p className="text-xl text-gray-500 dark:text-gray-300 break-words whitespace-normal overflow-visible">
                    {description || t.defaultDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact section */}
        <section className="relative bg-gray-50 py-10" aria-labelledby="contact-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="relative bg-white shadow-2xl rounded-xl overflow-hidden">
              <h2 id="contact-heading" className="sr-only">
                {subtitle || t.defaultSubtitle}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Contact information */}
                <div className="relative overflow-hidden py-12 px-8 bg-gradient-to-br from-teal-500 to-teal-700 sm:px-10 xl:p-12">
                  {/* Decorative angle backgrounds */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    aria-hidden="true"
                  >
                    <svg
                      className="absolute right-0 top-0 opacity-30"
                      width="404"
                      height="384"
                      fill="none"
                      viewBox="0 0 404 384"
                    >
                      <defs>
                        <pattern
                          id="pattern-squares"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="404" height="384" fill="url(#pattern-squares)" />
                    </svg>
                    <svg
                      className="absolute bottom-0 left-0 opacity-30 transform rotate-180"
                      width="404"
                      height="384"
                      fill="none"
                      viewBox="0 0 404 384"
                    >
                      <defs>
                        <pattern
                          id="pattern-squares-2"
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <rect x="0" y="0" width="4" height="4" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="404" height="384" fill="url(#pattern-squares-2)" />
                    </svg>
                  </div>

                  <div className="relative">
                    <h3 className="text-2xl font-bold text-white">
                      {subtitle || t.defaultContactSubtitle}
                    </h3>
                    <div className="mt-4 text-base text-teal-50 max-w-3xl">
                      {contactDescription ? (
                        documentToReactComponents(contactDescription.json, RICHTEXT_OPTIONS)
                      ) : (
                        <p className="text-base text-left font-medium tracking-wide max-w-xs text-white leading-7">
                          {t.defaultContactDescription}
                        </p>
                      )}
                    </div>

                    <dl className="mt-8 space-y-6">
                      <dt>
                        <span className="sr-only">{t.phoneLabel}</span>
                      </dt>
                      <dd className="flex text-base text-teal-50 items-center transition duration-300 hover:text-white">
                        <PhoneIcon
                          className="flex-shrink-0 w-6 h-6 text-teal-200"
                          aria-hidden="true"
                        />
                        <span className="ml-3">{phonenumber || t.phoneNumber}</span>
                      </dd>

                      <dt>
                        <span className="sr-only">{t.emailLabel}</span>
                      </dt>
                      <dd className="flex text-base text-teal-50 items-center">
                        {email && (
                          <a
                            href={`mailto:${email}`}
                            target="_blank"
                            className="flex items-center transition duration-300 hover:text-white"
                            rel="noreferrer"
                          >
                            <MailIcon
                              className="flex-shrink-0 w-6 h-6 text-teal-200"
                              aria-hidden="true"
                            />
                            <span className="ml-3">{email}</span>
                          </a>
                        )}
                      </dd>

                      <dt>
                        <span className="sr-only">{t.locationLabel}</span>
                      </dt>
                      <dd className="flex text-base text-teal-50 items-center">
                        <LocationMarkerIcon
                          className="flex-shrink-0 w-6 h-6 text-teal-200"
                          aria-hidden="true"
                        />
                        <span className="ml-3">Fysio Diamond Factory</span>
                      </dd>
                    </dl>

                    <div role="list" className="mt-10 flex space-x-6">
                      <a
                        className="text-white hover:text-teal-100 transition-colors duration-300"
                        href={facebookLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span className="sr-only">Facebook</span>
                        <div className="h-6 w-6" aria-hidden="true">
                          <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                            <path
                              fillRule="evenodd"
                              d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </a>

                      <a
                        href={linkedInLink}
                        className="text-white hover:text-teal-100 transition-colors duration-300"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <div className="h-6 w-6" aria-hidden="true">
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="linkedin-in"
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

                      <a
                        className="text-white hover:text-teal-100 transition-colors duration-300"
                        href={instagramLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">Instagram</span>
                        <div className="h-6 w-6" aria-hidden="true">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path
                              fillRule="evenodd"
                              d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </a>
                    </div>

                    <div className="mt-12 rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        title="maps"
                        className="w-full h-72 border-0"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.432796832136!2d4.9049229732259505!3d52.362571890779066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c6095f2e60b59d%3A0xad61fcbb485f6074!2sFysio%20Diamond%20Factory!5e0!3m2!1snl!2sus!4v1657196883469!5m2!1snl!2sus"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Contact form column */}
                <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
                  <Contactform />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
