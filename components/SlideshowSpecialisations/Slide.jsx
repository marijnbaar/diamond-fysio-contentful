// import Image from 'next/image';
import Button from '../Button';
import createSlug from '../../lib/helpers/createSlug';

const Slide = ({ key, image, imageUrl, imageAlt, title, subtitle, href, description, button }) => {
  return (
    <div key={key} className="m-2 flex flex-col rounded-lg shadow-lg overflow-hidden">
      {image && (
        <div className="flex-shrink-0">
          <img className="h-56 w-full object-cover" src={imageUrl} alt={imageAlt} />
        </div>
      )}
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-cyan-600">
            <a href={subtitle} className="hover:underline">
              {title}
            </a>
          </p>
          <a href={href} className="block mt-2">
            <p className="text-xl font-semibold text-gray-900">{title}</p>
            <p className="mt-3 text-base text-gray-500">{description && description}</p>
          </a>
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
