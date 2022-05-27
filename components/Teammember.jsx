import React from 'react';

function Teammember({ teamMemberCollection }) {
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
                    <div className="flex-shrink-0">
                      <img
                        className="mx-auto h-40 w-40 rounded-full xl:w-56 xl:h-56"
                        src={person.image.url}
                        alt={person.image.alt && person.image.alt}
                      />
                    </div>
                  )}
                  <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-cyan-600">
                        <div className="hover:underline">{person.specialisations}</div>
                      </div>
                      <div className="block mt-2">
                        <p className="text-xl font-semibold text-gray-900">{person.name}</p>
                        <p className="mt-3 text-base text-gray-500">
                          {person.description && person.description}
                        </p>
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
