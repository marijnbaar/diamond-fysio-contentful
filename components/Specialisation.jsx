import React from 'react';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const Specialisation = ({ image, description, subtitle }) => {
  return (
    <>
      <div className="bg-grey-light relative">
        <div className="mx-auto">
          <div
            className="lg:gap-y-11
            flex flex-col lg:grid lg:grid-cols-12 z-10 relative"
          >
            <div className="order-3 lg:translate-y-0 order-0 lg:order-none lg:col-span-5 relative">
              <div className="z-10 h-full xl-[355px] w-full relative">
                {image && (
                  <Image src={image.url} alt={image.description} layout="fill" objectFit="cover" />
                )}
              </div>
            </div>
            <div className="relative lg:mt-0 p-4 lg:py-11 lg:px-14 lg:col-span-6 text-left ">
              <h2 className="pt-6 pb-2 text-base font-semibold tracking-wider text-cyan-600 uppercase">
                {subtitle && subtitle}
              </h2>

              {description && (
                <div className="prose pb-4 mt-2 lg:pb-24 text-base text-gray-500">
                  {documentToReactComponents(description.json)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Specialisation;
