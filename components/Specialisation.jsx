import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';

const Specialisation = ({ image, description, subtitle }) => {
  return (
    <>
      <div className="bg-gray-50 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="hidden lg:block lg:col-span-6 mb-8 lg:mb-0">
              <div className="z-10 h-64 sm:h-96 lg:h-[28rem] xl:h-[32rem] w-full relative rounded-xl overflow-hidden shadow-lg">
                {image && (
                  <Image
                    src={image.url}
                    alt={
                      image.description ||
                      (subtitle
                        ? `${subtitle} - Diamond Fysio Amsterdam`
                        : 'Specialisatie behandeling bij Diamond Fysio')
                    }
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="theme-card animate-card p-6 lg:p-10 w-full">
                <h2 className="pt-6 pb-2 text-base font-semibold tracking-wider text-cyan-600 uppercase">
                  {subtitle && subtitle}
                </h2>

                {description && (
                  <div className="prose pb-2 mt-2 text-base text-gray-600 prose-headings:text-gray-900 prose-a:text-teal-600 prose-img:rounded-xl prose-img:shadow">
                    {description.json
                      ? documentToReactComponents(description.json, {
                          renderText: (text) => {
                            return text.split('\n').reduce((children, textSegment, index) => {
                              return index === 0
                                ? [textSegment]
                                : [...children, <br key={index} />, textSegment];
                            }, []);
                          },
                          renderNode: {
                            [BLOCKS.UL_LIST]: (node, children) => (
                              <ul className="list-disc list-outside pl-6 my-4">{children}</ul>
                            ),
                            [BLOCKS.OL_LIST]: (node, children) => (
                              <ol className="list-decimal list-outside pl-6 my-4">{children}</ol>
                            ),
                            [BLOCKS.LIST_ITEM]: (node, children) => (
                              <li className="mb-1">{children}</li>
                            ),
                            [BLOCKS.PARAGRAPH]: (node, children) => (
                              <p className="my-4 leading-relaxed">{children}</p>
                            )
                          }
                        })
                      : // Fallback for plain string content: detect bullet-like lines and paragraphs
                        (() => {
                          if (typeof description === 'string') {
                            const lines = description.split('\n');
                            const bulletLines = lines.filter((l) => /^\s*[-*]\s+/.test(l));
                            if (bulletLines.length >= 2) {
                              return (
                                <ul className="list-disc list-outside pl-6 my-4">
                                  {lines.map((l, i) =>
                                    /^\s*[-*]\s+/.test(l) ? (
                                      <li key={i}>{l.replace(/^\s*[-*]\s+/, '')}</li>
                                    ) : null
                                  )}
                                </ul>
                              );
                            }
                            // Paragraph fallback on double newlines
                            const paragraphs = description.split(/\n\n+/);
                            return paragraphs.map((p, i) => (
                              <p key={i} className="my-4 leading-relaxed">
                                {p}
                              </p>
                            ));
                          }
                          return null;
                        })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Specialisation;
