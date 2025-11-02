import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { SampleNextArrow, SamplePrevArrow } from './SlideshowSpecialisations/Arrow';

export default function Info({ title, subtitle, description, instagramPosts }) {
  // Get posts array - handle both {data: [...]} and direct array formats
  const posts = instagramPosts?.data || (Array.isArray(instagramPosts) ? instagramPosts : []);
  const imagePosts = Array.isArray(posts)
    ? posts.filter((img) => img?.media_type === 'IMAGE' && img?.media_url)
    : [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 lg:py-16">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6 sm:max-w-3xl lg:px-8 lg:max-w-7xl">
        <div>
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-4xl">
            {title}
          </p>
          <div className="prose dark:prose-invert mt-5 max-w-prose mx-auto text-xl text-gray-500 dark:text-gray-400">
            {description &&
              (description.json
                ? documentToReactComponents(description.json, {
                    renderText: (text) =>
                      text
                        .split('\n')
                        .reduce(
                          (children, seg, i) =>
                            i === 0 ? [seg] : [...children, <br key={i} />, seg],
                          []
                        ),
                    renderNode: {
                      [BLOCKS.UL_LIST]: (node, children) => (
                        <ul className="list-disc list-outside pl-6 my-4">{children}</ul>
                      ),
                      [BLOCKS.OL_LIST]: (node, children) => (
                        <ol className="list-decimal list-outside pl-6 my-4">{children}</ol>
                      ),
                      [BLOCKS.LIST_ITEM]: (node, children) => <li className="mb-1">{children}</li>,
                      [BLOCKS.PARAGRAPH]: (node, children) => (
                        <p className="my-4 leading-relaxed">{children}</p>
                      )
                    }
                  })
                : typeof description === 'string'
                  ? description.split(/\n\n+/).map((p, i) => (
                      <p key={i} className="my-4 leading-relaxed">
                        {p}
                      </p>
                    ))
                  : null)}
          </div>
        </div>
        {imagePosts.length > 0 && (
          <div className="z-40 mt-12 sm:mb-11 lg:mb-0 theme-card animate-card rounded-2xl p-6 sm:p-8">
            <Slider
              autoplay={true}
              autoplaySpeed={3000}
              dots={true}
              fade={false}
              infinite={imagePosts.length > 4}
              speed={500}
              slidesToShow={Math.min(4, imagePosts.length)}
              slidesToScroll={1}
              lazyLoad="ondemand"
              nextArrow={<SampleNextArrow />}
              prevArrow={<SamplePrevArrow />}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: Math.min(3, imagePosts.length),
                    slidesToScroll: 1,
                    infinite: imagePosts.length > 3,
                    dots: true
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: Math.min(2, imagePosts.length),
                    slidesToScroll: 1,
                    infinite: imagePosts.length > 2,
                    dots: true
                  }
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                  }
                }
              ]}
            >
              {imagePosts.map((image, id) => (
                <div key={image.id || id} className="px-2">
                  <a
                    href={image.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={image.caption ? `Instagram: ${image.caption}` : 'Instagram post'}
                    className="relative h-52 w-52 mx-auto rounded overflow-hidden block hover:opacity-90 transition-opacity duration-300"
                  >
                    <Image
                      src={image.media_url}
                      alt={image.caption || 'Instagram post van Diamond Fysio Amsterdam'}
                      unoptimized={true}
                      fill
                      className="rounded object-cover"
                      loading="lazy"
                      sizes="208px"
                    />
                  </a>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </div>
  );
}
