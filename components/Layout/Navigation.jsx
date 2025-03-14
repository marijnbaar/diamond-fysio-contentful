/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import createSlug from '../../lib/helpers/createSlug';
import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/legacy/image';
import { MenuIcon, PhoneIcon, XIcon } from '@heroicons/react/outline';
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
  return (
    <Popover className="z-30 fixed top-0 bg-white w-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
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
            <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500">
              <span className="sr-only">Open menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <Popover.Group as="nav" className="hidden md:flex space-x-10">
            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={classNames(
                      open ? 'text-gray-900' : 'text-gray-500',
                      'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige'
                    )}
                  >
                    <span>Specialicaties</span>
                    <ChevronDownIcon
                      className={classNames(
                        open ? 'text-gray-600' : 'text-gray-400',
                        'ml-2 h-5 w-5 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover className="absolute z-20 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
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
                                  <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="ml-4">
                                      <div className="text-base font-medium text-gray-900 hover:bg-gray-50">
                                        {menuItem.title && menuItem.title}
                                      </div>
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
                        </div>
                        <div className="px-5 py-5 bg-gray-50 space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
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
                                      className="flex-shrink-0 h-6 w-6 text-gray-400"
                                      aria-hidden="true"
                                    />
                                    <div className="text-base font-medium text-gray-400 hover:text-gray-500 ml-4">
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

            <Popover className="relative">
              {({ open }) => (
                <>
                  <Popover.Button
                    className={classNames(
                      open ? 'text-gray-900' : 'text-gray-500',
                      'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-beige'
                    )}
                  >
                    <span>Over ons</span>
                    <ChevronDownIcon
                      className={classNames(
                        open ? 'text-gray-600' : 'text-gray-400',
                        'ml-2 h-5 w-5 group-hover:text-gray-500'
                      )}
                      aria-hidden="true"
                    />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover className="absolute z-20 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
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
                                      <div className="text-base font-medium text-gray-900 hover:bg-gray-50">
                                        {menuItem.title && menuItem.title}
                                      </div>
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
                  <div className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100">
                    <MyLink
                      href={
                        item.internalLink
                          ? createSlug(item.internalLink.slug, item.internalLink.typeName)
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
          </Popover.Group>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {navigation.knop && (
              <div key={navigation.knop.title} className="flow-root">
                <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-400">
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
          </div>
        </div>
      </div>

      <Transition
        as={Fragment}
        enter="duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="duration-100 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Popover.Group className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
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
                  <Popover.Button className="bg-white rounded-md p-6 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500">
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
              <div>
                {navigation.knop && (
                  <div key={navigation.knop.title} className="flow-root">
                    <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-400">
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
                        <div className="text-base font-medium text-white hover:text-gray-500 ml-4">
                          {navigation.knop.title && navigation.knop.title}
                        </div>
                      </MyLink>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Popover.Group>
      </Transition>
    </Popover>
  );
}
