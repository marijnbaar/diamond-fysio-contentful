// import Image from 'next/image';
import Button from '../Button';
import createSlug from '../../lib/helpers/createSlug';
import Image from 'next/legacy/image';

const Slide = ({ key, image, title, description, button, subtitle }) => {
  return (
    <div key={key} className="m-2 flex flex-col rounded-lg shadow-lg overflow-hidden">
      {image && (
        <div className="flex-shrink-0">
          <div className="h-56 w-full relative">
            {image && (
              <Image
                layout="fill"
                className="w-full h-full object-cover"
                src={image.url}
                alt={image.description}
              />
            )}
          </div>
        </div>
      )}
      <div className="flex-1 bg-white p-4 lg:p-6 flex flex-col justify-between">
        <div className="flex-1 ">
          <div className="text-sm font-medium text-cyan-600">
            <p className="hover:underline">{subtitle}</p>
          </div>
          <div className="block break-words mt-2">
            <p className="text-xl font-semibold text-gray-900">{title && title}</p>
            <p className="mt-3 text-base text-gray-500">{description && description}</p>
          </div>
          {button && (
            <div className="mt-9 mb-4">
              <Button
                title={button.title}
                type={button.type}
                internal_link={
                  button.internalLink &&
                  createSlug(button.internalLink.slug, button.internalLink.__typename)
                }
                external_link={button.externalLink}
                extra_classes="sm:w-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Slide;
