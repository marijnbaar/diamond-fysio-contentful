import setRichtTextToReactComponents from '../lib/helpers/setRichTextToReactComponents';

export default function Specialisations({
  title,
  subtitle,
  description,
  specialisationCollection
}) {
  return (
    <div className="relative bg-gray-50 py-16 sm:py-24 lg:py-32">
      <div className="relative">
        <div className="text-center mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title}
          </p>
          <p className="mt-5 mx-auto max-w-prose text-xl text-gray-500">{description}</p>
        </div>
        <div className="mt-12 mx-auto max-w-md px-4 grid gap-8 sm:max-w-lg sm:px-6 lg:px-8 lg:grid-cols-3 lg:max-w-7xl">
          {specialisationCollection.items.map((specialisation) => (
            <div
              key={specialisation.id}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden"
            >
              {specialisation.image && (
                <div className="flex-shrink-0">
                  <img
                    className=" h-56 w-full object-cover"
                    src={specialisation.image.url}
                    alt={specialisation.image.alt && specialisation.image.alt}
                  />
                </div>
              )}
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-600">
                    <a href={specialisation.subtitle} className="hover:underline">
                      {specialisation.title}
                    </a>
                  </p>
                  <a href={specialisation} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">{specialisation.title}</p>
                    <p className="mt-3 text-base text-gray-500">
                      {specialisation.description &&
                        setRichtTextToReactComponents(specialisation.description.json)}
                    </p>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
