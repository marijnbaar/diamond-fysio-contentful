import Image from 'next/image';

const GenericpageHeader = ({ image }) => {
  return (
    <div className="mt-20 md:mb-11 lg:mb-2 relative">
      <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full ">
        {image && <Image layout="fill" src={image.url} alt={image.description} />}
      </div>
    </div>
  );
};
export default GenericpageHeader;
