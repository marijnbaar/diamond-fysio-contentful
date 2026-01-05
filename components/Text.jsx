import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import { useEffect } from 'react';

export default function Text({ title, subtitle, description, id }) {
  // Debug what's coming in from Contentful
  useEffect(() => {
    if (description && !description.json) {
      console.error('Description is missing json property:', description);
    }
  }, [description]);

  // Check if this is a highlight-style text (no title, just description)
  const isHighlightStyle = !title && !subtitle && description;

  // Rich text renderer options - different styling for highlight vs regular text
  const highlightOptions = {
    renderMark: {
      [MARKS.BOLD]: (text) => (
        <strong className="font-bold text-gray-900 dark:text-gray-100">{text}</strong>
      ),
      [MARKS.ITALIC]: (text) => <em className="italic text-gray-600 dark:text-gray-300">{text}</em>,
      [MARKS.UNDERLINE]: (text) => <span className="underline decoration-teal-400">{text}</span>
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="text-lg md:text-xl font-medium leading-loose tracking-wide text-gray-600 dark:text-gray-300">
          {children}
        </p>
      )
    }
  };

  const options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong className="font-bold text-gray-900">{text}</strong>,
      [MARKS.ITALIC]: (text) => <em className="italic text-gray-700">{text}</em>,
      [MARKS.UNDERLINE]: (text) => <span className="underline decoration-teal-400">{text}</span>
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="mb-6 text-gray-700 leading-relaxed mx-auto max-w-3xl animate-fadeIn">
          {children}
        </p>
      ),
      [BLOCKS.HEADING_1]: (node, children) => (
        <h2 className="text-4xl font-extrabold text-gray-900 mt-10 mb-6 text-center mx-auto animate-fadeIn">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-5 text-center mx-auto animate-fadeIn">
          {children}
        </h2>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <h3 className="text-2xl font-semibold text-gray-800 mt-7 mb-4 text-center mx-auto animate-fadeIn">
          {children}
        </h3>
      ),
      [BLOCKS.HEADING_4]: (node, children) => (
        <h4 className="text-xl font-semibold text-gray-800 mt-6 mb-3 text-center mx-auto animate-fadeIn">
          {children}
        </h4>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="list-disc pl-5 mb-6 mx-auto max-w-3xl text-gray-700 text-left animate-staggered">
          {children}
        </ul>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="list-decimal pl-5 mb-6 mx-auto max-w-3xl text-gray-700 text-left animate-staggered">
          {children}
        </ol>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => (
        <li className="mb-3 animate-fadeIn hover:translate-x-1 transition-transform duration-300 ease-in-out">
          {children}
        </li>
      ),
      [INLINES.HYPERLINK]: (node, children) => (
        <a
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 hover:text-teal-800 border-b border-teal-200 hover:border-teal-600 transition-all duration-300 hover:px-0.5"
        >
          {children}
        </a>
      ),
      [BLOCKS.TABLE]: (node, children) => (
        <div className="overflow-x-auto my-10 rounded-lg shadow mx-auto max-w-3xl animate-slideIn">
          <table className="w-full text-base border border-gray-200">
            <tbody>{children}</tbody>
          </table>
        </div>
      ),
      [BLOCKS.TABLE_ROW]: (node, children) => (
        <tr className="even:bg-gray-50 odd:bg-white hover:bg-gray-100 transition-colors duration-200">
          {children}
        </tr>
      ),
      [BLOCKS.TABLE_HEADER_CELL]: (node, children) => (
        <th className="px-4 py-3 bg-teal-50 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-200">
          {children}
        </th>
      ),
      [BLOCKS.TABLE_CELL]: (node, children) => (
        <td className="px-4 py-3 text-left border border-gray-200">{children}</td>
      ),
      [BLOCKS.QUOTE]: (node, children) => (
        <blockquote className="pl-6 py-3 my-8 border-l-4 border-teal-500 bg-gray-50 italic text-gray-700 mx-auto max-w-3xl text-left animate-fadeIn hover:bg-teal-50 hover:border-l-6 transition-all duration-300">
          {children}
        </blockquote>
      )
    }
  };

  // Safe rendering function for rich text
  const renderRichText = () => {
    try {
      if (!description) return null;
      if (!description.json) {
        // Handle legacy format or plain text
        return typeof description === 'string' ? (
          <p className="text-center text-gray-700">{description}</p>
        ) : null;
      }
      // Use highlight options for highlight style, regular options otherwise
      const renderOptions = isHighlightStyle ? highlightOptions : options;
      return documentToReactComponents(description.json, {
        ...renderOptions,
        renderText: (text) =>
          text
            .split('\n')
            .reduce(
              (children, seg, i) => (i === 0 ? [seg] : [...children, <br key={i} />, seg]),
              []
            )
      });
    } catch (error) {
      console.error('Error rendering rich text:', error);
      return <p className="text-center text-red-600">Error displaying content.</p>;
    }
  };

  // If this is a highlight-style text (no title/subtitle), use Highlight component styling
  if (isHighlightStyle) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-12 lg:py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-44 mb-0">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-teal-500/10 ring-1 ring-black/5 relative theme-card flex transition-transform hover:-translate-y-1 duration-700 ease-out">
            {/* Left accent bar with soft gradient */}
            <div className="w-1.5 bg-gradient-to-b from-teal-400 via-cyan-400 to-teal-400 opacity-80" />

            <div className="flex-1 py-10 px-8 lg:px-16 relative">
              {/* Soft background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

              <div className="relative">
                <blockquote className="text-gray-600 dark:text-gray-300">
                  <div className="animate-fade-in-up">{renderRichText()}</div>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
      </div>
    );
  }

  // Default Text component styling
  return (
    <div className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-slideUp">
          {subtitle && (
            <h2 className="inline-block text-sm font-semibold tracking-wider text-teal-600 uppercase bg-teal-50 px-4 py-1.5 rounded-full mb-4 transition-all duration-300 hover:bg-teal-100 hover:scale-105 transform">
              {subtitle}
            </h2>
          )}
          {title && (
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mx-auto max-w-4xl animate-fadeIn">
              {title}
            </h2>
          )}
        </div>
        <div className="mt-14 animate-slideUp">
          <div className="prose prose-lg mx-auto">{renderRichText()}</div>
        </div>
      </div>
    </div>
  );
}
