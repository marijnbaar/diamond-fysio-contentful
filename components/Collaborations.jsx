// import Image from 'next/image';

export default function Collaborations({ title, subtitle, logoCollection }) {
  return (
    <div className="relative bg-gray-50 pt-16 sm:pt-24 lg:pt-10 lg:pb-44">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle && subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title && title}
          </p>
        </div>
        <div className="mt-12 flex -mb-1 sm:-mb-24 lg:mb-6 h-full">
          {logoCollection &&
            logoCollection.items.map((logo) => (
              <img
                key={logo.id}
                className=" h-28 w-96 bg-white p-4 bg-cover rounded-lg shadow-xl object-contain mx-3 ring-1 ring-black ring-opacity-5"
                src={logo.url}
                alt=""
              />
            ))}
        </div>
      </div>
    </div>
  );
}
