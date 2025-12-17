import { ExternalLinkIcon } from '@heroicons/react/solid';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import createSlug from '../lib/helpers/createSlug';

export default function CTA({ title, subtitle, description, descriptionText, image, button }) {
  const { locale } = useRouter();
  const isEn = (locale || 'nl').toLowerCase() === 'en';
  const label = (button && button.title) || (isEn ? 'Read more' : 'Lees meer');
  const desc = descriptionText || description;

  const internalHref =
    button && button.internalLink
      ? createSlug(button.internalLink.slug, button.internalLink.pageType)
      : '/about';

  return (
    <div className="relative bg-gradient-to-r from-gray-800 to-gray-900">
      <div className="relative h-56 sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2">
        {image && (
          <Image
            className="object-cover"
            src={image.url}
            alt={image.description || 'Call-to-action afbeelding - Diamond Fysio Amsterdam'}
            fill
            quality={85}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 mix-blend-multiply" />
      </div>
      <div className="relative mx-auto max-w-md px-4 py-12 sm:max-w-7xl sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
        <div className="md:ml-auto md:w-1/2 md:pl-10">
          <h2 className="text-base font-semibold uppercase tracking-wider text-gray-300">
            {title && title}
          </h2>
          <p className="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
            {subtitle && subtitle}
          </p>
          <p className="mt-3 text-lg text-gray-300">{desc && desc}</p>
          <div className="mt-8">
            <div className="inline-flex rounded-md shadow">
              <div className="inline-flex items-center justify-center px-5 py-3 border text-base font-medium rounded-md text-white border-white/30 hover:bg-white/10 transition-colors">
                {button && button.externalLink ? (
                  <>
                    <a
                      href={button.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      {label}
                    </a>
                    <ExternalLinkIcon
                      className="-mr-1 ml-3 h-5 w-5 text-white/70"
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <>
                    <Link href={internalHref} aria-label={label}>
                      {label}
                    </Link>
                    <ExternalLinkIcon
                      className="-mr-1 ml-3 h-5 w-5 text-white/70"
                      aria-hidden="true"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
