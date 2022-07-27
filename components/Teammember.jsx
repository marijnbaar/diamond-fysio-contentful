import React from 'react';
import { Popover } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

function Teammember({ teamMemberCollection }) {
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
  }
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 text-center sm:px-6 lg:px-8 ">
        <div className="space-y-12">
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
                  {person.image && (
                    <div className="flex-shrink-0 mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56 relative">
                      {person.image && (
                        <Image
                          src={person.image.url}
                          alt={person.image.description}
                          layout="fill"
                        />
                      )}
                    </div>
                  )}
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900 mb-1">{person.name}</p>
                      <p className="text-teal-500 text-sm">{person.role}</p>
                      <p className="mt-2 text-base text-center text-gray-500 leading-8">
                        {person.descriptionHomepage &&
                          documentToReactComponents(person.descriptionHomepage.json)}
                      </p>
                      <div className="block mt-2">
                        <Popover>
                          {({ open }) => (
                            <>
                              <Popover.Button
                                className={classNames(
                                  open ? 'text-gray-900' : 'text-gray-500',
                                  'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige'
                                )}
                              >
                                <span>Lees meer</span>
                                <ChevronDownIcon
                                  className={classNames(
                                    open ? 'text-gray-600' : 'text-gray-400',
                                    'ml-2 h-5 w-5 group-hover:text-gray-500'
                                  )}
                                  aria-hidden="true"
                                />
                              </Popover.Button>
                              <Popover.Panel>
                                <p className="mt-3 text-base text-gray-500">
                                  {person.description && person.description}
                                </p>
                              </Popover.Panel>
                            </>
                          )}
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Teammember;
