import Image from 'next/image';
import MyLink from 'next/link';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import createSlug from '../lib/helpers/createSlug';
import { useRouter } from 'next/router';

import { optimizeContentfulImage } from '../lib/helpers/image';

export default function Team({ title, description, teamMemberCollection }) {
  const { locale } = useRouter();
  const readMore = locale === 'en' ? 'Read more' : 'Lees meer';
  return (
    <div className="bg-gray-50 dark:bg-gray-900 pt-28 lg:pt-32">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-16">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <ul className="mx-auto space-y-8 sm:grid sm:grid-cols-2 sm:gap-8 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl">
            {teamMemberCollection &&
              teamMemberCollection.items
                .filter((person) => person != null)
                .map((person, index) => (
                  <div
                    key={person?.name || index}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden group animate-card"
                  >
                    {/* Decoratieve elementen */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500 dark:bg-teal-600 opacity-5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-600 dark:bg-teal-500 opacity-5 rounded-full -ml-4 -mb-4 group-hover:scale-150 transition-transform duration-700"></div>

                    <li key={person?.name || index} className="flex flex-col h-full relative z-10">
                      <div className="space-y-6 mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56 relative overflow-hidden bg-gray-100 dark:bg-gray-700 mt-8 group-hover:scale-105 transition-transform duration-300">
                        {person?.image?.url && (
                          <Image
                            src={optimizeContentfulImage(person.image.url, 800)}
                            alt={
                              person.image?.description ||
                              (person?.firstName && person?.lastName
                                ? `${person.firstName} ${person.lastName}, fysiotherapeut bij Diamond Fysio`
                                : 'Teamlid bij Diamond Fysio Amsterdam')
                            }
                            fill
                            className="filter grayscale group-hover:filter-none object-cover transition-all duration-500"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        )}
                      </div>
                      <div className="space-y-2 p-8 flex-grow flex flex-col justify-between relative">
                        <div className="text-lg leading-6 font-medium">
                          <h3 className="mb-1 text-gray-900 dark:text-gray-100 text-xl font-bold group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                            {person?.name || 'Unknown'}
                          </h3>
                          <p className="text-teal-500 dark:text-teal-400 text-sm font-semibold tracking-widest uppercase mb-4">
                            {person?.role || ''}
                          </p>
                          {person?.link && (
                            <MyLink
                              key={person.link?.sys?.id || index}
                              href={createSlug(
                                person.link.slug,
                                person.link.pageType || person.link.__typename
                              )}
                            >
                              <div className="mt-auto pt-4">
                                <div className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-teal-500 dark:bg-teal-600 hover:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg">
                                  <span className="mr-2">{readMore}</span>
                                  <ExternalLinkIcon className="h-5 w-5" aria-hidden="true" />
                                </div>
                              </div>
                            </MyLink>
                          )}
                        </div>
                      </div>
                    </li>
                  </div>
                ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
