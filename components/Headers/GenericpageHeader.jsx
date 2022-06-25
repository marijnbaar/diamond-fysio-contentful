const GenericpageHeader = ({ image }) => {
  return (
    <div>
      <img
        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-[82vh]"
        src={image.url}
        alt={image.description}
      />
    </div>
  );
};
export default GenericpageHeader;
