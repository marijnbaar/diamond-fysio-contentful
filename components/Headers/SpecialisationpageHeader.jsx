import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/legacy/image';

export default function SpecialisationHeader({ title, descriptionRichText, image }) {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-4 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:py-20 xl:py-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 ml-11 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-36 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h3 className="text-2xl tracking-tight font-manrope font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
                {title && title}
              </h3>
              {descriptionRichText && (
                <div className="prose mt-3 text-base font-manrope text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:-mx-2">
                  {documentToReactComponents(descriptionRichText.json)}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="relative h-64 w-full sm:h-96 lg:w-full lg:h-full">
          {image && (
            <Image
              className="object-cover object-bottom md:object-cover"
              layout="fill"
              objectFit="cover"
              src={image.url}
              alt={image.description}
            />
          )}
        </div>
      </div>
    </div>
  );
}
