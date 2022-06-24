const image = [
  {
    url: 'https://images.pexels.com/photos/5473182/pexels-photo-5473182.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
  }
];

const AboutpageHeader = () => {
  return (
    <div>
      <img
        className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-[82vh]"
        src={image[0].url}
        alt={image[0].description}
      />
    </div>
  );
};
export default AboutpageHeader;
