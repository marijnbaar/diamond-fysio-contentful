import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { MailIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLinkIcon } from '@heroicons/react/solid';

export default function Team({ title, description, teamMemberCollection }) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            <p className="text-xl text-gray-500">{description}</p>
          </div>
          <ul
            role="list"
            className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl"
          >
            {teamMemberCollection &&
              teamMemberCollection.items.map((person) => (
                <div
                  key={person.name}
                  className="flex flex-col rounded-lg shadow-lg overflow-hidden"
                >
                  <li key={person.name}>
                    <div className="space-y-6 mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56 relative">
                      {person.image && (
                        <Image
                          src={person.image.url}
                          alt={person.image.description}
                          layout="fill"
                        />
                      )}
                    </div>
                    <div className="space-y-2 p-6 flex flex-col justify-between relative">
                      <div className="text-lg leading-6 font-medium">
                        <h3>{person.name}</h3>
                        <p className="text-teal-500 text-sm">{person.role}</p>
                        <p className="mt-3 text-base text-center text-gray-500 leading-8">
                          {person.descriptionHomepage &&
                            documentToReactComponents(person.descriptionHomepage.json)}
                        </p>
                        <div className="my-4">
                          <div className="inline-flex rounded-md shadow">
                            <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
                              <Link href="/team">Lees meer</Link>
                              <ExternalLinkIcon
                                className="-mr-1 ml-3 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <ul role="list" className="flex justify-center my-auto space-x-2">
                        <li>
                          {person.emailAddress && (
                            <a
                              href={`mailto:${person.emailAddress}`}
                              className="text-gray-400 hover:text-gray-500"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="sr-only">Email</span>
                              <MailIcon
                                className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </li>
                        <li>
                          {person.phoneNumber && (
                            <a
                              href={`https://api.whatsapp.com/send?phone=${person.phoneNumber}`}
                              className="text-gray-400 hover:text-gray-500"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="sr-only">Phone number</span>
                              <PhoneIcon
                                className="flex-shrink-0 ml-1 w-6 h-6 text-gray-400 hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </li>
                        <li>
                          {person.website && (
                            <a
                              href={person.website}
                              className="text-gray-400 hover:text-gray-500"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="sr-only">Website</span>
                              <GlobeAltIcon
                                className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-500"
                                aria-hidden="true"
                              />
                            </a>
                          )}
                        </li>
                        <li>
                          {person.linkedInUrl && (
                            <a
                              href={person.linkedInUrl}
                              className="text-gray-400 hover:text-gray-500"
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span className="sr-only">LinkedIn</span>
                              <svg
                                className="flex-shrink-0 w-6 h-6"
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
                          )}
                        </li>
                      </ul>
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
