import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import TestimonialSlide from './TestimonialSlide';
import { SampleNextArrow, SamplePrevArrow } from './Arrow';

const SlideshowTestimonials = ({ testimonialCollection }) => {
  const settings = {
    dots: true,
    fade: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
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
      <div className="pb-16 bg-gradient-to-r from-teal-500 to-cyan-600 lg:pb-0 lg:z-10 lg:relative px-11">
        <div className="mx-auto">
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
  );
};

export default SlideshowTestimonials;
