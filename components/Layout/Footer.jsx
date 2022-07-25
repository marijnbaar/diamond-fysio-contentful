import Link from 'next/link';
import createSlug from '../../lib/helpers/createSlug';
import { forwardRef } from 'react';
import Image from 'next/image';

const MyLink = forwardRef((props, ref) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  );
});

MyLink.displayName = 'MyLink';

export default function Footer({ footer }) {
  return (
    <footer className="bg-gray-50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="max-w-md mx-auto pt-12 px-4 sm:max-w-7xl sm:px-6 lg:pt-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="z-10 h-16 w-16 relative">
              {footer.logo && (
                <Image
                  src={footer.logo && footer.logo.url}
                  alt={footer.logo.description && footer.logo.description}
                  layout="fill"
                  objectFit="cover"
                  quality="100"
                />
              )}
            </div>
            <p className="text-gray-500 text-base">{footer.description && footer.description}</p>
            <div className="flex space-x-6">
              <a
                href={footer.facebookLink}
                className="text-gray-400 hover:text-gray-500"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">Facebook</span>
                <div className="h-6 w-6" aria-hidden="true">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </a>
              <a
                href={footer.instagramLink}
                className="text-gray-400 hover:text-gray-500"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">Instagram</span>
                <div className="h-6 w-6" aria-hidden="true">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </a>
              <a
                href={footer.linkedInLink}
                className="text-gray-400 hover:text-gray-500 pt-1"
                target="_blank"
                rel="noreferrer"
              >
                <span className="sr-only">LinkedIn</span>
                <div className="h-6 w-6" aria-hidden="true">
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="linkedin-in"
                    className="w-3.5"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                  >
                    <path
                      fill="currentColor"
                      d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"
                    ></path>
                  </svg>
                </div>
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  De praktijk
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footer.footerSubmenu &&
                    footer.footerSubmenu[0].menuItems.map((menuItem) =>
                      menuItem.internalLink || menuItem.externalLink ? (
                        <MyLink
                          key={menuItem.sys.id}
                          href={
                            menuItem.internalLink
                              ? createSlug(
                                  menuItem.internalLink.slug,
                                  menuItem.internalLink.__typename
                                )
                              : menuItem.externalLink
                          }
                        >
                          <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-500 hover:text-gray-900">
                                {menuItem.title && menuItem.title}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {menuItem.description && menuItem.description}
                              </p>
                            </div>
                          </div>
                        </MyLink>
                      ) : (
                        <div
                          key={menuItem.sys.id}
                          className="text-gray-500 hover:text-gray-900 cursor-not-allowed"
                        >
                          {menuItem.title && menuItem.title}
                        </div>
                      )
                    )}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                  Support
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {footer.footerSubmenu &&
                    footer.footerSubmenu[1].menuItems.map((menuItem) =>
                      menuItem.internalLink || menuItem.externalLink ? (
                        <MyLink
                          key={menuItem.sys.id}
                          href={
                            menuItem.internalLink
                              ? createSlug(
                                  menuItem.internalLink.slug,
                                  menuItem.internalLink.__typename
                                )
                              : menuItem.externalLink
                          }
                        >
                          <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-500 hover:text-gray-900">
                                {menuItem.title && menuItem.title}
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {menuItem.description && menuItem.description}
                              </p>
                            </div>
                          </div>
                        </MyLink>
                      ) : (
                        <div
                          key={menuItem.sys.id}
                          className="text-gray-500 hover:text-gray-900 cursor-not-allowed"
                        >
                          {menuItem.title && menuItem.title}
                        </div>
                      )
                    )}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8"></div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 py-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2022, Diamond Fysio Amsterdam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
