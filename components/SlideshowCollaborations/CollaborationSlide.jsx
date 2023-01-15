import Image from 'next/image';

const CollaborationSlide = ({ url, description }) => {
  return (
    <div className="mt-5 lg:mt-12 flex flex-col flex-wrap justify-center lg:flex-row mb-24 lg:mb-6 h-full">
      <div className="relative bg-white p-2 mx-auto bg-cover rounded-lg shadow-xl justify-between ring-1 ring-black ring-opacity-5">
        <Image width={200} height={100} className="object-contain" src={url} alt={description} />
      </div>
    </div>
  );
};

export default CollaborationSlide;
