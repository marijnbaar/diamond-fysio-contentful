import Link from 'next/link';

const Button = ({ title, type, internal_link, external_link, extra_classes = '' }) => {
  const btnType = type
    ? `w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-100 bg-teal-500 hover:bg-teal-400 md:py-4 md:text-lg md:px-10 shadow ${extra_classes}`
    : `w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-beige hover:bg-gray-400 md:py-4 md:text-lg md:px-10 shadow ${extra_classes}`;
  return (
    <>
      {internal_link ? (
        <Link href={internal_link}>
          <a className={btnType}>{title}</a>
        </Link>
      ) : (
        <a href={external_link} className={btnType}>
          {title}
        </a>
      )}
    </>
  );
};

export default Button;
