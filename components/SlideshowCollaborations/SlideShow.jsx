import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import CollaborationSlide from './CollaborationSlide';
import { SampleNextArrow, SamplePrevArrow } from './Arrow';

const SlideshowCollaborations = ({ title, subtitle, logoCollection }) => {
  const settings = {
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    fade: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          initialSlide: 1
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
  return (
    <div className="relative">
      <div className="mx-auto">
        <div className="relative bg-gray-50 py-7 lg:pt-9 lg:pb-11">
          <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
            <div>
              <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
                {subtitle && subtitle}
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
                {title && title}
              </p>
            </div>
            <Slider {...settings}>
              {logoCollection.items.map((logo, i) => (
                <CollaborationSlide key={i} url={logo.url} description={logo.description} />
              ))}
            </Slider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideshowCollaborations;
