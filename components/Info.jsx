import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/image';
import Link from 'next/link';

export default function Info({ title, subtitle, description, instagramPosts }) {
  return (
    <div className="bg-gray-50 -mt-11 -z-10 pt-16 sm:pt-24 lg:pt-10">
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
          <div className="flex flex-wrap flex-column h-[395px] sm:h-[320px] lg:h-[460px] justify-between px-6 md:px-0 overflow-hidden">
            {instagramPosts &&
              instagramPosts.data.map((image, id) =>
                image.media_type === 'IMAGE' ? (
                  <div key={id} className="relative m-2 lg:m-4 h-52 w-52 mx-auto rounded-sm">
                    <Link href={image.permalink} isExternal>
                      <a target="_blank">
                        <Image
                          src={image.media_url}
                          alt={image.caption}
                          unoptimized="true"
                          layout="fill"
                          objectFit="cover"
                          className="filter grayscale hover:filter-none cursor-pointer"
                        />
                      </a>
                    </Link>
                  </div>
                ) : (
                  <div className="relative m-2 lg:m-4 h-52 w-52 bg-black overflow-hidden mx-auto rounded-sm">
                    <Link href={image.permalink} isExternal>
                      <a target="_blank">
                        <video src={image.media_url} controls={true} className="h-48 w-52" />
                      </a>
                    </Link>
                  </div>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
