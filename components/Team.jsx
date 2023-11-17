import Image from 'next/legacy/image';
import MyLink from 'next/link';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import createSlug from '../lib/helpers/createSlug';

export default function Team({ title, description, teamMemberCollection }) {
  return (
    <div className="bg-white mt-20 lg:mt-11">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl mb-24">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            <p className="text-xl text-gray-500">{description}</p>
          </div>
          <ul className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl">
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
                          className="filter grayscale hover:filter-none"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      )}
                    </div>
                    <div className="space-y-2 p-6 flex flex-col justify-between relative">
                      <div className="text-lg leading-6 font-medium">
                        <h3 className="mb-1">{person.name}</h3>
                        <p className="text-teal-500 text-sm">{person.role}</p>
                        {person.link && (
                          <MyLink
                            key={person.link.sys.id}
                            href={createSlug(person.link.slug, person.link.__typename)}
                          >
                            <div className="my-4 cursor-pointer">
                              <div className="inline-flex rounded-md shadow">
                                <div className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50">
                                  <p className="text-base font-medium text-gray-900 hover:bg-gray-50">
                                    Lees meer
                                  </p>
                                  <ExternalLinkIcon
                                    className="-mr-1 ml-3 h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </div>
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
