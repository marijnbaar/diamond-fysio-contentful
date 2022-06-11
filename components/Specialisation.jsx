import React from 'react';
import Image from 'next/image';
import setRichtTextToReactComponents from '../lib/helpers/setRichTextToReactComponents';

const Specialisation = ({ image, description }) => {
  return (
    <>
      <div className="bg-blue-extraLight relative">
        <div className="mx-auto">
          <div
            className="lg:gap-y-11 pt-6'
            flex flex-col lg:grid lg:grid-cols-12 z-10 relative lg:pb-32 xl:pb-48"
          >
            <div className="order-3 translate-y-5 lg:translate-y-0 order-0 mb-4 lg:order-none lg:col-span-5 relative">
              <div className="z-10 h-[455px] xl-[355px] -translate-x-4 w-[calc(100%+16px)] sm:translate-x-0 sm:w-full relative lg:absolute lg:w-[calc(100%+32px+(100vw-992px)/2)] lg:left-[calc(-1*(32px+(100vw-992px)/2))] xl:w-[calc(100%+32px+(100vw-1184px)/2)] xl:left-[calc(-1*(32px+(100vw-1184px)/2))] 2xl:w-[calc(100%+32px+(100vw-1472px)/2)] 2xl:left-[calc(-1*(32px+(100vw-1472px)/2))]">
                {image && (
                  <Image src={image.url} alt={image.description} layout="fill" objectFit="cover" />
                )}
              </div>
            </div>
            <div className="relative lg:mt-0 p-11 lg:col-span-6">
              {description && (
                <div className="pb-4 lg:pb-24 text-base text-gray-500">
                  {setRichtTextToReactComponents(description.json)}
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
