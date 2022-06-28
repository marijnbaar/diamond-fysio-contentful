import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import TestimonialSlide from './TestimonialSlide';

const SlideshowTestimonials = ({ image, testimonialCollection }) => {
  const settings = {
    dots: true,
    fade: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
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
      <div className="pb-16 bg-gradient-to-r from-teal-500 to-cyan-600 lg:pb-0 lg:z-10 lg:relative">
        <div className="lg:mx-auto lg:max-w-7xl lg:px-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="relative lg:-my-8">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-white lg:hidden" />
            <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:p-0 lg:h-full">
              <div className="aspect-w-10 aspect-h-6 rounded-xl shadow-xl overflow-hidden sm:aspect-w-16 sm:aspect-h-7 lg:aspect-none lg:h-full">
                <img
                  className="object-cover lg:h-full lg:w-full"
                  src={image.url && image.url}
                  alt={image.alt && image.alt}
                />
              </div>
            </div>
          </div>
          <div className="mt-12 lg:m-2 lg:col-span-2 lg:pl-8">
            <div className="mx-auto max-w-md px-8 sm:max-w-2xl sm:px-6 lg:px-0 lg:py-20 lg:max-w-none">
              <Slider {...settings}>
                {testimonialCollection.items.map((testimonial, i) => (
                  <TestimonialSlide
                    key={i}
                    image={testimonial.image}
                    imageUrl={testimonial.image.url}
                    imageAlt={testimonial.image.alt}
                    quote={testimonial.quote}
                    name={testimonial.name}
                    profession={testimonial.profession}
                  />
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideshowTestimonials;
