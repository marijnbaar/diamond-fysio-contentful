import { MailIcon, PhoneIcon, GlobeAltIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function Teammember({
  name,
  role,
  image,
  description,
  emailAddress,
  linkedInUrl,
  website,
  phoneNumber,
  specialisationTagsCollection,
  location,
  descriptionHomepage,
  quote
}) {
  return (
    <div className="bg-white">
      <section
        id="author"
        aria-labelledby="author-title"
        className="relative scroll-mt-14 lg:mt-16 pb-3 pt-8 sm:scroll-mt-32 sm:pb-16 sm:pt-10 lg:pt-16"
      >
        <div className="absolute inset-x-0 bottom-0 top-1/2 text-slate-900/10 [mask-image:linear-gradient(transparent,white)]">
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

        <div className="relative mx-auto max-w-5xl pt-16 sm:px-6 overflow-hidden">
          <div className="bg-slate-50 mt-11 rounded-3xl lg:grid lg:grid-cols-6">
            <div className="absolute z-10 mx-auto -mt-11 md:-mt-14 lg:-mt-20 h-44 w-44 right-0 overflow-hidden rounded-full bg-slate-200 md:float-right md:h-64 md:w-64 md:[shape-outside:circle(40%)] lg:mr-20 ">
              {image && (
                <div className="absolute inset-0 h-full w-full object-cover">
                  {image && (
                    <Image
                      src={image.url}
                      alt={image.description}
                      layout="fill"
                      className="filter grayscale hover:filter-none"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="lg:col-span-4 px-4 pt-24 sm:px-10 sm:pt-16 md:pt-20 lg:px-20 lg:pt-32">
              <h2
                className="inline-flex items-center rounded-full py-1 px-4 mr-2 text-teal-500 hover:text-teal-400 ring-1 ring-inset ring-teal-500"
                id="author-title"
              >
                <span className="text-base font-medium tracking-tight cursor-default">
                  {role && role}
                </span>
              </h2>
              <span className="mt-2 block text-teal-500 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
                {name && name}
              </span>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-slate-900">
                {quote && quote}
              </p>
              <p className="mt-2 text-lg tracking-tight text-slate-700">
                {description && description}
              </p>
            </div>
            <div className="lg:col-span-2 relative pb-10 sm:px-4 lg:px-2 bg-slate-50 rounded-3xl">
              <div className="relative lg:absolute -bottom-11 px-4">
                <h2
                  className="inline-flex items-center rounded-full py-1 px-4 text-teal-500 hover:text-teal-400 -ml-2"
                  id="author-title"
                >
                  {location && (
                    <span className="text-base font-medium flex tracking-tight cursor-default">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 mr-1"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
                        />
                      </svg>
                      {location && location}
                    </span>
                  )}
                </h2>
                <div className="mt-3 text-base text-left font-medium pl-2 tracking-tight text-gray-500 leading-8">
                  {descriptionHomepage && documentToReactComponents(descriptionHomepage.json)}
                </div>
                <div className="mt-2 text-sm font-small cursor-default flex flex-row flex-wrap text-teal-500">
                  {specialisationTagsCollection.items.map((specialisation) => (
                    <div
                      key={specialisation.tag}
                      className="opacity-80 ring-1 ring-inset ring-teal-500 hover:text-teal-400 p-2 px-4 m-1 rounded-full"
                    >
                      {specialisation.tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pb-10 pl-4 lg:pl-16 bg-slate-50 rounded-3xl">
              <div className="md:pl-0 mt-8 inline-flex items-center">
                <ul role="list" className="flex justify-center my-auto space-x-2">
                  <li>
                    {phoneNumber && (
                      <a
                        href={`https://api.whatsapp.com/send?phone=${phoneNumber}`}
                        className="text-gray-400 hover:text-gray-500"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <span className="sr-only">Phone number</span>
                        <PhoneIcon
                          className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-gray-500 md:ml-2"
                          aria-hidden="true"
                        />
                      </a>
                    )}
                  </li>
                  <li>
                    {linkedInUrl && (
                      <a
                        href={linkedInUrl}
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
                  <li>
                    {emailAddress && (
                      <a
                        href={`mailto:${emailAddress}`}
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
                    {website && (
                      <a
                        href={website}
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
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
