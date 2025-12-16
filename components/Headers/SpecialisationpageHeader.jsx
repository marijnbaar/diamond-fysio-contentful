import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import { optimizeContentfulImage } from '../../lib/helpers/image';

export default function SpecialisationHeader({ title, descriptionRichText, image }) {
  return (
    <div className="relative bg-gray-50 overflow-hidden">
      <section className="relative pt-28 pb-12 lg:pt-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="relative z-10 lg:col-span-6">
            {title?.json && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                {documentToReactComponents(title.json)}
              </h1>
            )}
            {descriptionRichText && (
              <div className="prose mt-5 text-gray-600 sm:text-lg max-w-prose prose-a:text-teal-600">
                {documentToReactComponents(descriptionRichText.json, {
                  renderText: (text) =>
                    text
                      .split('\n')
                      .reduce(
                        (children, seg, i) =>
                          i === 0 ? [seg] : [...children, <br key={i} />, seg],
                        []
                      ),
                  renderNode: {
                    [BLOCKS.PARAGRAPH]: (node, children) => (
                      <p className="my-4 leading-relaxed">{children}</p>
                    ),
                    [BLOCKS.UL_LIST]: (node, children) => (
                      <ul className="list-disc list-outside pl-6 my-4">{children}</ul>
                    ),
                    [BLOCKS.OL_LIST]: (node, children) => (
                      <ol className="list-decimal list-outside pl-6 my-4">{children}</ol>
                    ),
                    [BLOCKS.LIST_ITEM]: (node, children) => <li className="mb-1">{children}</li>
                  }
                })}
              </div>
            )}
          </div>

          <div className="mt-10 lg:mt-0 lg:col-span-6">
            <div className="relative h-64 sm:h-96 lg:h-[28rem] xl:h-[32rem] w-full rounded-xl overflow-hidden shadow-lg">
              {image && (
                <Image
                  className="object-cover"
                  fill
                  src={optimizeContentfulImage(image.url, 1600)}
                  alt={
                    image.description ||
                    (title
                      ? `${title} behandeling - Diamond Fysio Amsterdam`
                      : 'Specialisatie behandeling bij Diamond Fysio')
                  }
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
