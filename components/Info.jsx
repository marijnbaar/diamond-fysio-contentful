import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function Info({ title, subtitle, description, image }) {
  return (
    <div className="relative bg-gray-50 pt-16 sm:pt-24 lg:pt-10">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title}
          </p>
          <div>
            <p className="prose mt-5 max-w-prose mx-auto text-xl text-gray-500">
              {description && documentToReactComponents(description.json)}
            </p>
          </div>
        </div>
        <div className="mt-12 -mb-1 sm:-mb-24 lg:-mb-40 h-full">
          <img
            className="rounded-lg shadow-xl ring-1 ring-black ring-opacity-5"
            src={image && image.url}
            alt={image && image.description}
          />
        </div>
      </div>
    </div>
  );
}
