import Image from 'next/image';
import { optimizeContentfulImage } from '../../lib/helpers/image';

const GenericpageHeader = ({ image }) => {
  return (
    <div className="mt-20 md:mb-11 lg:mb-2 relative">
      <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full ">
        {image && (
          <Image
            className="w-full h-full object-cover"
            fill
            src={optimizeContentfulImage(image.url, 1600)}
            alt={image.description || 'Pagina header afbeelding - Diamond Fysio Amsterdam'}
          />
        )}
      </div>
    </div>
  );
};
export default GenericpageHeader;
