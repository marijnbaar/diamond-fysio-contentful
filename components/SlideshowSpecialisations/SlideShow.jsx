import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slide from './Slide';

const Slideshow = ({
  title,
  subtitle,
  description,
  buttonCollection,
  specialisationCollection
}) => {
  const settings = {
    dots: true,
    fade: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  console.log('test', buttonCollection, specialisationCollection);
  return (
    <div className="relative bg-gray-50 py-16 sm:py-24 lg:py-32">
      <div className="relative">
        <div className="text-center mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title && title}
          </p>
          <p className="mt-5 mx-auto max-w-prose text-xl text-gray-500">
            {description && description}
          </p>
        </div>
        <div className="mt-12 mx-auto max-w-md px-4 sm:max-w-lg sm:px-6 lg:px-8 lg:max-w-7xl slideshow-slick">
          <Slider {...settings}>
            {specialisationCollection.items.map((specialisation, i) => (
              <Slide
                key={i}
                image={specialisation.image}
                imageUrl={specialisation.image.url}
                imageAlt={specialisation.image.alt}
                title={specialisation.title}
                subtitle={specialisation.subtitle}
                href={specialisation}
                description={specialisation.shortDescription}
                button={specialisation.button}
              />
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
