import Button from '../Button';
import createSlug from '../../lib/helpers/createSlug';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import Image from 'next/legacy/image';

const HomepageHeader = ({ title, info, buttonCollection, image }) => {
  return (
    <div className="relative mt-20 lg:mt-0 pt-16 pb-11 lg:p-0 flex content-center items-center justify-center h-5/6 lg:h-screen">
      <div className="bg-cover bg-center absolute top-0 w-full h-full">
        {image && (
          <Image
            className="w-full h-full object-cover"
            layout="fill"
            src={image.url}
            alt={image.description}
            priority="true"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-multiply bg-gradient-to-r from-gray-500 to-gray-100"
        />
      </div>
      <div className="container max-w-8xl relative mx-auto">
        <div className="items-center flex flex-wrap">
          <div className="bg-gray opacity-90 rounded p-10 w-full lg:w-6/12 px-4 ml-auto mr-auto text-center">
            <div className="sm:text-center lg:text-left">
              {title?.json ? (
                <h1 className="prose text-4xl tracking-tight font-manrope font-extrabold text-white sm:text-5xl md:text-6xl">
                  {documentToReactComponents(title.json)}
                </h1>
              ) : null}
              {info?.json ? (
                <div className="prose mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {documentToReactComponents(info.json)}
                </div>
              ) : null}
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                {buttonCollection.items.map((btn, i) => (
                  <div className="my-2" key={i}>
                    <Button
                      key={i}
                      title={btn.title}
                      type={btn.type}
                      internal_link={
                        btn.internalLink &&
                        createSlug(btn.internalLink.slug, btn.internalLink.pageType)
                      }
                      external_link={btn.externalLink}
                      extra_classes="sm:w-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HomepageHeader;
