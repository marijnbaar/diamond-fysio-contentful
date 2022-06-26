import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Button from './Button';
import createSlug from '../lib/helpers/createSlug';

export default function AboutInformation({ title, subtitle, description, aboutFeatureCollection }) {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
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
        <div className="mt-10">
          <dl className="space-y-10 mx-auto md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {aboutFeatureCollection &&
              aboutFeatureCollection.items.map((feature) => (
                <div key={feature.title} className="relative p-6">
                  <dt>
                    <p className="text-center lg:ml-2 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                  </dt>
                  <dd className="mt-2 text-center lg:ml-2 text-base text-gray-500">
                    {feature.description}
                  </dd>
                  <div className="m-auto lg:w-96">
                    {feature.button && (
                      <div className="my-2">
                        <Button
                          title={feature.button.title}
                          type={feature.button.type}
                          internal_link={
                            feature.button.internalLink &&
                            createSlug(
                              feature.button.internalLink.slug,
                              feature.button.internalLink.__typename
                            )
                          }
                          external_link={feature.button.externalLink}
                          extra_classes="sm:w-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
