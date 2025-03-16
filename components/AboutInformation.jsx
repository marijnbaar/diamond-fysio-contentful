import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Button from './Button';
import createSlug from '../lib/helpers/createSlug';
import { useState, useEffect } from 'react';

export default function AboutInformation({ title, subtitle, description, aboutFeatureCollection }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  return (
    <div className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transform transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h2 className="text-base mx-auto font-semibold tracking-wider text-cyan-600 uppercase bg-cyan-50 inline-block px-4 py-1 rounded-full">
            {subtitle}
          </h2>
          <p className="mx-auto mt-4 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </p>
          <div className="prose prose-lg mt-6 max-w-prose mx-auto text-xl text-gray-500">
            {description && documentToReactComponents(description.json)}
          </div>
        </div>
        <div
          className={`mt-16 transform transition-all duration-700 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
          }`}
        >
          <dl className="space-y-10 mx-auto md:space-y-0 md:grid md:grid-cols-2 md:gap-x-12 md:gap-y-16">
            {aboutFeatureCollection &&
              aboutFeatureCollection.items.map((feature) => (
                <div
                  key={feature.title}
                  className="relative p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center"
                >
                  <dt>
                    <p className="text-center text-xl leading-6 font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </p>
                  </dt>
                  <dd className="mt-2 text-center text-base text-gray-600">
                    {feature.description}
                  </dd>
                  <div className="mt-auto pt-6 w-full flex justify-center">
                    {feature.button && (
                      <div className="my-2">
                        <Button
                          title={feature.button.title}
                          type={feature.button.type}
                          internal_link={
                            feature.button.internalLink &&
                            createSlug(
                              feature.button.internalLink.slug,
                              feature.button.internalLink.pageType
                            )
                          }
                          external_link={feature.button.externalLink}
                          extra_classes="sm:w-auto hover:scale-105 transition-all duration-300 hover:shadow-lg animate-pulse"
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
