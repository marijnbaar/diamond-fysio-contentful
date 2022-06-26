import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

export default function Text({ title, subtitle, description, longDescription }) {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-left">
          <div className="lg:text-center">
            <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
              {subtitle}
            </h2>
            <p className=" mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              {title}
            </p>
          </div>
          <div>
            <p className="prose mt-5 max-w-prose mx-auto text-xl text-gray-500">
              {description && documentToReactComponents(description.json)}
            </p>
          </div>
        </div>
        <div className="mt-10">
          <div>
            <p className="prose mt-5 max-w-prose mx-auto text-xl text-gray-500">
              {longDescription && documentToReactComponents(longDescription.json)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
