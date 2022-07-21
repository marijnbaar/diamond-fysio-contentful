import Image from 'next/image';

export default function Collaborations({ title, subtitle, logoCollection }) {
  return (
    <div className="relative bg-gray-50 py-7 lg:pt-9 lg:pb-11">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle && subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title && title}
          </p>
        </div>
        <div className="mt-5 lg:mt-12 flex flex-col flex-wrap justify-center lg:flex-row mb-24 lg:mb-6 h-full">
          {logoCollection &&
            logoCollection.items.map((logo, id) => (
              <div
                key={id}
                className="relative h-24 w-48 bg-white p-4 my-2 mx-auto lg:m-4 bg-cover rounded-lg shadow-xl justify-between ring-1 ring-black ring-opacity-5"
              >
                {logo && (
                  <Image
                    width={200}
                    height={100}
                    className="object-contain m-10 p-4"
                    src={logo.url}
                    alt={logo.description}
                  />
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
