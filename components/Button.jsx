import Link from 'next/link';

const Button = ({ title, type, internal_link, external_link, extra_classes = '' }) => {
  // Unified gradient style inspired by header CTA, with subtle hover and ring
  const btnType = `w-full inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 md:py-4 md:text-lg md:px-10 shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${extra_classes}`;
  return (
    <>
      {internal_link ? (
        <Link href={internal_link}>
          <p className={btnType} role="button" aria-label={title} tabIndex={0}>
            {title}
          </p>
        </Link>
      ) : (
        <a href={external_link} className={btnType} aria-label={title} rel="noopener noreferrer">
          {title}
        </a>
      )}
    </>
  );
};

export default Button;
