import { Fragment, useEffect, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import createSlug from '../../lib/helpers/createSlug';
import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/legacy/image';
import { MenuIcon, PhoneIcon, XIcon, UserCircleIcon } from '@heroicons/react/outline';
import { ChevronDownIcon } from '@heroicons/react/solid';

const MyLink = forwardRef(({ href, children, ...rest }, ref) => {
  return (
    <Link href={href} passHref>
      <div ref={ref} {...rest}>
        {children}
      </div>
    </Link>
  );
});

MyLink.displayName = 'MyLink';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navigation({ navigation }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);
  return (
    <Popover
      className={`z-30 fixed top-0 w-screen transition-all duration-300 ${
        scrolled
          ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-md'
          : 'bg-white bg-opacity-60 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1 cursor-pointer">
            <span className="sr-only">Diamond fysio</span>
            <Link href="/">
              <div className="h-16 w-16 relative">
                {navigation.logo && (
                  <Image
                    src={navigation.logo && navigation.logo.url}
                    alt={navigation.logo.description && navigation.logo.description}
                    layout="fill"
                    objectFit="cover"
                    quality="100"
                    priority="true"
                  />
                )}
              </div>
            </Link>
          </div>
          <div className="-mr-2 -my-2 md:hidden">
            <Popover.Button className="bg-transparent rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-300">
              <span className="sr-only">Open menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <Popover.Group as="nav" className="hidden md:flex space-x-10">
            <Popover
              className="relative"
              onMouseEnter={() => document.getElementById('specialicaties-button')?.click()}
              onMouseLeave={(e) => {
                e.persist();
                // Only close if we're not moving to the dropdown
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !relatedTarget.closest('.specialicaties-dropdown')) {
                  document.getElementById('specialicaties-button')?.click();
                }
              }}
            >
              {({ open }) => (
                <>
                  <Popover.Button
                    id="specialicaties-button"
                    className={classNames(
                      open ? 'text-gray-900' : 'text-gray-500',
                      'group bg-transparent rounded-md inline-flex items-center text-base font-medium hover:text-teal-500 focus:outline-none transition-colors duration-300'
                    )}
                  >
                    <span>Specialicaties</span>
                    <ChevronDownIcon
                      className={classNames(
                        open ? 'text-gray-600 rotate-180' : 'text-gray-400',
                        'ml-2 h-5 w-5 group-hover:text-gray-500 transition-transform duration-300'
                      )}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-300"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover className="absolute z-20 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 specialicaties-dropdown">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white bg-opacity-95 backdrop-blur-md px-5 py-6 sm:gap-8 sm:p-8">
                          {navigation &&
                            navigation.navigatieSubmenu[0].menuItems.map((menuItem) =>
                              menuItem.internalLink || menuItem.externalLink ? (
                                <MyLink
                                  key={menuItem.sys.id}
                                  href={
                                    menuItem.internalLink
                                      ? createSlug(
                                          menuItem.internalLink.slug,
                                          menuItem.internalLink.pageType
                                        )
                                      : menuItem.externalLink
                                  }
                                >
                                  <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                                    <div className="ml-4">
                                      <div className="text-base font-medium text-gray-900 group-hover:text-teal-500">
                                        {menuItem.title && menuItem.title}
                                      </div>
                                      <p className="mt-1 text-sm text-gray-700">
                                        {menuItem.description && menuItem.description}
                                      </p>
                                    </div>
                                  </div>
                                </MyLink>
                              ) : (
                                <div key={menuItem.sys.id} className="cursor-not-allowed">
                                  {menuItem.title && menuItem.title}
                                </div>
                              )
                            )}
                        </div>
                        <div className="px-5 py-5 bg-gray-50 bg-opacity-90 backdrop-blur-sm space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8 w-full">
                          {navigation.knop && (
                            <div key={navigation.knop.title} className="flow-root">
                              <div className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100">
                                <MyLink
                                  href={
                                    navigation.knop.internalLink
                                      ? createSlug(
                                          navigation.knop.internalLink.slug,
                                          navigation.knop.internalLink.pageType
                                        )
                                      : navigation.knop.externalLink
                                  }
                                >
                                  <div className="flex cursor-pointer w-auto">
                                    <PhoneIcon
                                      className="flex-shrink-0 h-6 w-6 text-gray-800"
                                      aria-hidden="true"
                                    />
                                    <div className="text-base font-medium text-gray-800 hover:text-teal-500 ml-4 transition-colors duration-200 whitespace-nowrap">
                                      {navigation.knop.title && navigation.knop.title}
                                    </div>
                                  </div>
                                </MyLink>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Popover>
                  </Transition>
                </>
              )}
            </Popover>

            <Popover
              className="relative"
              onMouseEnter={() => document.getElementById('over-ons-button')?.click()}
              onMouseLeave={(e) => {
                e.persist();
                // Only close if we're not moving to the dropdown
                const relatedTarget = e.relatedTarget;
                if (!relatedTarget || !relatedTarget.closest('.over-ons-dropdown')) {
                  document.getElementById('over-ons-button')?.click();
                }
              }}
            >
              {({ open }) => (
                <>
                  <Popover.Button
                    id="over-ons-button"
                    className={classNames(
                      open ? 'text-gray-900' : 'text-gray-500',
                      'group bg-transparent rounded-md inline-flex items-center text-base font-medium hover:text-teal-500 focus:outline-none transition-colors duration-300'
                    )}
                  >
                    <span>Over ons</span>
                    <ChevronDownIcon
                      className={classNames(
                        open ? 'text-gray-600 rotate-180' : 'text-gray-400',
                        'ml-2 h-5 w-5 group-hover:text-gray-500 transition-transform duration-300'
                      )}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-300"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover className="absolute z-20 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0 over-ons-dropdown">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white bg-opacity-95 backdrop-blur-md px-5 py-6 sm:gap-8 sm:p-8">
                          {navigation &&
                            navigation.navigatieSubmenu[1].menuItems.map((menuItem) =>
                              menuItem.internalLink || menuItem.externalLink ? (
                                <MyLink
                                  key={menuItem.sys.id}
                                  href={
                                    menuItem.internalLink
                                      ? createSlug(
                                          menuItem.internalLink.slug,
                                          menuItem.internalLink.pageType
                                        )
                                      : menuItem.externalLink
                                  }
                                >
                                  <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="ml-4">
                                      <div className="text-base font-medium text-gray-900 group-hover:text-teal-500">
                                        {menuItem.title && menuItem.title}
                                      </div>
                                      <p className="mt-1 text-sm text-gray-700">
                                        {menuItem.description && menuItem.description}
                                      </p>
                                    </div>
                                  </div>
                                </MyLink>
                              ) : (
                                <div key={menuItem.sys.id} className="cursor-not-allowed">
                                  {menuItem.title && menuItem.title}
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    </Popover>
                  </Transition>
                </>
              )}
            </Popover>

            {navigation.menuItems &&
              navigation.menuItems.map((item) => (
                <div key={item.title} className="flow-root">
                  <div className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-500 hover:text-teal-500 transition-colors duration-200">
                    <MyLink
                      href={
                        item.internalLink
                          ? createSlug(item.internalLink.slug, item.internalLink.typeName)
                          : item.externalLink
                      }
                    >
                      <div className="text-base font-medium text-gray-500 hover:text-teal-500 transition-colors duration-200">
                        {item.title && item.title}
                      </div>
                    </MyLink>
                  </div>
                </div>
              ))}
          </Popover.Group>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0 space-x-4">
            {navigation.knop && (
              <div key={navigation.knop.title} className="flow-root">
                <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-400 transition-colors duration-300">
                  <MyLink
                    href={
                      navigation.knop.internalLink
                        ? createSlug(
                            navigation.knop.internalLink.slug,
                            navigation.knop.internalLink.pageType
                          )
                        : navigation.knop.externalLink
                    }
                  >
                    <div className="text-base font-medium ">
                      {navigation.knop.title && navigation.knop.title}
                    </div>
                  </MyLink>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="flow-root">
              <MyLink href="https://login.spotonmedics.nl/" target="_blank">
                <div className="flex items-center space-x-2 text-base font-medium text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md transition-colors duration-300">
                  <UserCircleIcon className="h-5 w-5" aria-hidden="true" />
                  <span>Login</span>
                </div>
              </MyLink>
            </div>
          </div>
        </div>
      </div>

      <Transition
        as={Fragment}
        enter="duration-300 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-200 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Group className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white bg-opacity-90 backdrop-blur-md divide-y-2 divide-gray-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="sr-only">Diamond fysio</span>
                  <Link href="/">
                    <div className="z-10 h-11 w-11 relative">
                      {navigation.logo && (
                        <Image
                          src={navigation.logo && navigation.logo.url}
                          alt={navigation.logo.description && navigation.logo.description}
                          layout="fill"
                          objectFit="cover"
                          quality="100"
                          priority="true"
                        />
                      )}
                    </div>
                  </Link>
                </div>
                <div className="-mr-2">
                  <Popover.Button className="bg-transparent rounded-md p-6 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-300">
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {navigation &&
                    navigation.navigatieSubmenu[0].menuItems.map((menuItem) =>
                      menuItem.internalLink || menuItem.externalLink ? (
                        <MyLink
                          key={menuItem.sys.id}
                          href={
                            menuItem.internalLink
                              ? createSlug(
                                  menuItem.internalLink.slug,
                                  menuItem.internalLink.pageType
                                )
                              : menuItem.externalLink
                          }
                        >
                          <div className="-m-4 p-2 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer">
                            <div className="ml-4">
                              <p className="text-base font-medium text-gray-900 hover:bg-gray-50">
                                {menuItem.title && menuItem.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {menuItem.description && menuItem.description}
                              </p>
                            </div>
                          </div>
                        </MyLink>
                      ) : (
                        <div key={menuItem.sys.id} className="cursor-not-allowed">
                          {menuItem.title && menuItem.title}
                        </div>
                      )
                    )}
                </nav>
              </div>
            </div>
            <div className="py-4 px-5 space-y-6">
              <div className="grid grid-cols-2 gap-y-2 gap-x-8">
                {navigation.menuItems &&
                  navigation.menuItems.map((item) => (
                    <div key={item.title} className="flow-root">
                      <div className="-m-3 p-4 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100">
                        <MyLink
                          href={
                            item.internalLink
                              ? createSlug(item.internalLink.slug, item.internalLink.pageType)
                              : item.externalLink
                          }
                        >
                          <div className="text-base font-medium text-gray-500 hover:text-gray-700">
                            {item.title && item.title}
                          </div>
                        </MyLink>
                      </div>
                    </div>
                  ))}

                {navigation &&
                  navigation.navigatieSubmenu[1].menuItems.map((menuItem) =>
                    menuItem.internalLink || menuItem.externalLink ? (
                      <MyLink
                        key={menuItem.sys.id}
                        href={
                          menuItem.internalLink
                            ? createSlug(menuItem.internalLink.slug, menuItem.internalLink.pageType)
                            : menuItem.externalLink
                        }
                      >
                        <div className="text-base font-medium text-gray-900 hover:text-gray-700">
                          {menuItem.title && menuItem.title}
                        </div>
                      </MyLink>
                    ) : (
                      <div key={menuItem.sys.id} className="cursor-not-allowed">
                        {menuItem.title && menuItem.title}
                      </div>
                    )
                  )}
              </div>
              <div className="space-y-4">
                {navigation.knop && (
                  <div key={navigation.knop.title} className="flow-root">
                    <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-400 transition-colors duration-300">
                      <MyLink
                        href={
                          navigation.knop.internalLink
                            ? createSlug(
                                navigation.knop.internalLink.slug,
                                navigation.knop.internalLink.pageType
                              )
                            : navigation.knop.externalLink
                        }
                      >
                        <div className="text-base font-medium text-white hover:text-gray-50">
                          {navigation.knop.title && navigation.knop.title}
                        </div>
                      </MyLink>
                    </div>
                  </div>
                )}

                {/* Login Button for Mobile Menu */}
                <div className="flow-root">
                  <MyLink href="https://login.sportonmedics.nl" target="_blank">
                    <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-700 transition-colors duration-300">
                      <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      <span>Login</span>
                    </div>
                  </MyLink>
                </div>
              </div>
            </div>
          </div>
        </Popover.Group>
      </Transition>
    </Popover>
  );
}
