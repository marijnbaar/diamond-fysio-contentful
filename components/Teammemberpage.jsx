import { MailIcon, GlobeAltIcon, ArrowLeftIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';
import { BsWhatsapp } from 'react-icons/bs';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Teammember({
  name,
  role,
  image,
  emailAddress,
  linkedInUrl,
  website,
  phoneNumber,
  specialisationTagsCollection,
  location,
  descriptionTeampage,
  descriptionHomepage,
  quote,
  contact
}) {
  const router = useRouter();
  const locale = router?.locale || 'nl';
  const isEn = locale === 'en';
  const teamPagePath = isEn ? '/en/team' : '/team';
  const backButtonText = isEn ? 'Back to team' : 'Terug naar team';
  const RICHTEXT_OPTIONS = {
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => {
        return (
          <p className="text-base text-left font-medium tracking-tight text-gray-700 dark:text-gray-300 leading-relaxed animate-fadeIn mb-4">
            {children}
          </p>
        );
      },
      [BLOCKS.HEADING_2]: (node, children) => {
        return (
          <h3 className="mt-6 mb-4 text-2xl font-extrabold text-gray-800 dark:text-gray-200 animate-fadeIn">
            {children}
          </h3>
        );
      },
      [INLINES.HYPERLINK]: (node, children) => {
        return (
          <a
            href={node.data.uri}
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 border-b border-teal-200 dark:border-teal-600 hover:border-teal-600 dark:hover:border-teal-400 transition-all duration-300"
          >
            {children}
          </a>
        );
      }
    },
    renderText: (text) => {
      return text.split('\n').reduce((children, textSegment, index) => {
        return [...children, index > 0 && <br key={index} />, textSegment];
      }, []);
    }
  };
  return (
    <div className="bg-white dark:bg-gray-900">
      <section
        id="author"
        aria-labelledby="author-title"
        className="relative scroll-mt-14 lg:mt-16 pb-3 pt-8 sm:scroll-mt-32 sm:pb-16 sm:pt-10 lg:pt-16"
      >
        <div className="absolute inset-x-0 bottom-0 top-1/2 text-slate-900/10 dark:text-slate-100/10 [mask-image:linear-gradient(transparent,white)] dark:[mask-image:linear-gradient(transparent,gray-900)]">
          <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
            <defs>
              <pattern
                id=":Rem:"
                width="128"
                height="128"
                patternUnits="userSpaceOnUse"
                x="50%"
                y="100%"
              >
                <path d="M0 128V.5H128" fill="none" stroke="currentColor"></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#:Rem:)"></rect>
          </svg>
        </div>

        <div className="relative mx-auto max-w-5xl pt-16 sm:px-6 overflow-visible">
          {/* Back to team button - styled similar to footer "go to top" button */}
          <div className="mb-4 flex justify-start px-4 sm:px-0">
            <Link href={teamPagePath}>
              <button
                className="inline-flex items-center text-white rounded-full px-4 py-3 shadow-lg dark:shadow-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 dark:from-teal-600 dark:to-cyan-700 dark:hover:from-teal-500 dark:hover:to-cyan-600 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:focus-visible:ring-teal-400 group"
                aria-label={backButtonText}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">{backButtonText}</span>
              </button>
            </Link>
          </div>

          <div className="relative bg-white dark:bg-gray-800 mt-16 sm:mt-20 md:mt-24 rounded-3xl lg:grid lg:grid-cols-6 shadow-xl dark:shadow-xl dark:hover:shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp overflow-visible group transition-all duration-500">
            {/* Decoratieve rondjes animaties */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500 dark:bg-teal-600 opacity-5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-600 dark:bg-teal-500 opacity-5 rounded-full -ml-4 -mb-4 group-hover:scale-150 transition-transform duration-700"></div>

            <div className="absolute z-20 mx-auto -mt-12 md:-mt-16 lg:-mt-20 h-40 w-40 right-4 sm:right-6 md:right-8 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700 md:float-right md:h-56 md:w-56 md:[shape-outside:circle(45%)] lg:mr-16 lg:h-64 lg:w-64 shadow-xl dark:shadow-2xl border-4 border-white dark:border-gray-800 transform transition duration-500 hover:scale-105">
              {image && (
                <div className="absolute inset-0 h-full w-full object-cover">
                  {image && (
                    <Image
                      src={image.url}
                      alt={
                        image?.description ||
                        (name
                          ? `Portret van ${name}, fysiotherapeut bij Diamond Fysio Amsterdam`
                          : 'Portret van fysiotherapeut bij Diamond Fysio')
                      }
                      fill
                      className="filter grayscale hover:filter-none transition-all duration-500 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-4 px-4 md:px-8 pt-32 sm:px-10 sm:pt-28 md:pt-24 lg:px-20 lg:pt-32 animate-fadeIn">
              <h2
                className="inline-flex items-center rounded-full py-1 px-4 mr-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 ring-2 ring-inset ring-teal-500/30 dark:ring-teal-400/40 bg-teal-50 dark:bg-teal-900/30 transition-all duration-300 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                id="author-title"
              >
                <span className="text-base font-semibold tracking-tight cursor-default">
                  {role && role}
                </span>
              </h2>
              <span className="mt-2 block text-teal-600 dark:text-teal-400 font-display text-5xl font-extrabold tracking-tight sm:text-6xl animate-slideIn">
                {name && name}
              </span>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-gray-100 animate-fadeIn">
                {quote && quote}
              </p>
              <div className="text-lg tracking-tight mt-6 text-gray-700 dark:text-gray-300 leading-relaxed">
                {descriptionTeampage &&
                  documentToReactComponents(descriptionTeampage.json, RICHTEXT_OPTIONS)}
              </div>
            </div>
            <div className="flex lg:col-span-2 relative py-4 lg:pb-10 px-4 sm:px-10 md:px-8 lg:px-2 bg-gray-50 dark:bg-gray-900/50 rounded-3xl animate-slideIn">
              {/* Subtiele verticale lijn alleen op desktop */}
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-200/60 dark:via-gray-700/60 to-transparent"></div>
              <div className="relative lg:pt-48 flex flex-col w-full">
                <h2
                  className="inline-flex items-center rounded-full py-1 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors duration-300"
                  id="author-title"
                >
                  {location && (
                    <span className="text-base font-semibold flex tracking-tight cursor-default">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-1 text-teal-600 dark:text-teal-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                        />
                      </svg>
                      {location}
                    </span>
                  )}
                </h2>
                <div className="mt-2 text-sm font-medium cursor-default flex flex-row lg:order-3 flex-wrap text-teal-600 dark:text-teal-400 gap-2">
                  {specialisationTagsCollection &&
                    specialisationTagsCollection.items.map((specialisation, index) => (
                      <div
                        key={specialisation.tag}
                        className="opacity-90 ring-2 ring-inset ring-teal-500/30 dark:ring-teal-400/40 hover:text-white dark:hover:text-white p-2 lg:px-4 rounded-full hover:bg-teal-600 dark:hover:bg-teal-700 bg-teal-50 dark:bg-teal-900/30 transition-all duration-300 animate-fadeIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {specialisation.tag}
                      </div>
                    ))}
                </div>
                <div className="mt-4 text-base text-left font-medium lg:pl-2 lg:order-2 tracking-tight text-gray-700 dark:text-gray-300 leading-7 animate-staggered">
                  {descriptionHomepage && documentToReactComponents(descriptionHomepage.json)}
                </div>
              </div>
            </div>

            <div className="pb-10 pl-4 sm:pl-10 md:pl-8 lg:pl-20 bg-white dark:bg-gray-800 lg:col-span-4 animate-fadeIn mt-4 lg:mt-0 lg:rounded-br-3xl relative">
              {/* Subtiele horizontale lijn alleen op desktop */}
              <div className="hidden lg:block absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-200/60 dark:via-gray-700/60 to-transparent"></div>
              <div className="text-lg tracking-tight w-full text-gray-700 dark:text-gray-300 leading-relaxed pt-6">
                {contact && documentToReactComponents(contact.json, RICHTEXT_OPTIONS)}
              </div>
              <div className="mt-8 inline-flex items-center">
                <ul className="flex justify-center my-auto space-x-5">
                  {phoneNumber && (
                    <li className="animate-fadeIn hover:scale-110 transition-transform duration-300">
                      <a
                        href={`https://api.whatsapp.com/send?phone=${phoneNumber}`}
                        className="text-gray-400 hover:text-whatsapp-dark dark:text-gray-500 dark:hover:text-green-400 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">Phone number</span>
                        <BsWhatsapp
                          className="flex-shrink-0 w-8 h-8 text-whatsapp-light"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  )}
                  {linkedInUrl && (
                    <li
                      className="animate-fadeIn hover:scale-110 transition-transform duration-300"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <a
                        href={linkedInUrl}
                        className="text-linkedin hover:text-gray-500 dark:hover:text-blue-400 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">LinkedIn</span>
                        <svg
                          className="flex-shrink-0 w-8 h-8"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </a>
                    </li>
                  )}
                  {emailAddress && (
                    <li
                      className="animate-fadeIn hover:scale-110 transition-transform duration-300"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <a
                        href={`mailto:${emailAddress}`}
                        className="text-gmail hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">Email</span>
                        <MailIcon className="flex-shrink-0 w-8 h-8" aria-hidden="true" />
                      </a>
                    </li>
                  )}
                  {website && (
                    <li
                      className="animate-fadeIn hover:scale-110 transition-transform duration-300"
                      style={{ animationDelay: '0.3s' }}
                    >
                      <a
                        href={website}
                        className="text-web hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">Website</span>
                        <GlobeAltIcon className="flex-shrink-0 w-8 h-8" aria-hidden="true" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
