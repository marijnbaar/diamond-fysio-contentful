import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Info({ title, subtitle, description }) {
  const [instagramPosts, setData] = useState(null);

  useEffect(() => {
    fetch('/api/fetchPosts')
      .then((res) => res.json())
      .then((instagramPosts) => {
        return setData(instagramPosts);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div className="relative bg-gray-50 -mt-11 -z-10 pt-16 sm:pt-24 lg:pt-10">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title}
          </p>

          <div className="prose mt-5 max-w-prose mx-auto text-xl text-gray-500">
            {description && documentToReactComponents(description.json)}
          </div>
        </div>
        <div className="z-40 mt-12 sm:-mb-24 lg:mb-0 h-full">
          <div className="grid grid-cols-6 space-x-2 relative">
            {instagramPosts &&
              instagramPosts.data.map((image, id) =>
                image.media_type === 'IMAGE' ? (
                  <div key={id} className="relative h-12 w-12">
                    <Image
                      src={image.media_url}
                      alt={image.caption}
                      unoptimized="true"
                      layout="fill"
                      // objectFit="cover"
                    />
                  </div>
                ) : (
                  []
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
