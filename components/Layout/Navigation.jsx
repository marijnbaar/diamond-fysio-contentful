import { Fragment, useEffect, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import createSlug from '../../lib/helpers/createSlug';
import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MenuIcon,
  PhoneIcon,
  XIcon,
  UserCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/outline';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

const MyLink = forwardRef(({ href, children, ...rest }, ref) => {
  return (
    <Link href={href} passHref>
      <div ref={ref} role="link" tabIndex={0} {...rest}>
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
  if (!navigation) {
    return null;
  }
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const router = useRouter();
  const currentLocale = router?.locale || 'nl';
  const nextLocale = currentLocale === 'en' ? 'nl' : 'en';

  const t = {
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    login: 'Login',
    darkMode: currentLocale === 'en' ? 'Dark mode' : 'Donkere modus',
    lightMode: currentLocale === 'en' ? 'Light mode' : 'Lichte modus'
  };

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      if (hasDarkClass) {
        setIsDark(true);
        return;
      }
      const stored = localStorage.getItem('theme');
      const dark = stored
        ? stored === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(dark);
    } catch {}
  }, []);

  const toggleTheme = () => {
    try {
      const nextDark = !isDark;
      setIsDark(nextDark);
      const root = document.documentElement;
      root.classList.toggle('dark', nextDark);
      try {
        document.body.classList.toggle('dark', nextDark);
      } catch {}
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    } catch {}
  };

  return (
    <Popover
      className={`z-30 fixed top-0 w-screen transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 shadow-lg border-b border-gray-200/50 dark:border-gray-700/50'
          : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg backdrop-saturate-150'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1 cursor-pointer">
            <span className="sr-only">Diamond fysio</span>
            <Link href="/">
              <div className="h-10 w-10 sm:h-12 sm:w-12 relative transition-transform duration-300 hover:scale-110">
                {navigation.logo && (
                  <Image
                    src={navigation.logo && navigation.logo.url}
                    alt={navigation.logo?.description || 'Diamond Fysio Amsterdam logo'}
                    fill
                    className="object-cover rounded-md"
                    quality="100"
                    priority={true}
                  />
                )}
              </div>
            </Link>
          </div>
          <div className="-mr-2 -my-2 md:hidden">
            <Popover.Button className="bg-transparent rounded-md p-2 inline-flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-300">
              <span className="sr-only">{t.openMenu}</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </Popover.Button>
          </div>
          <Popover.Group as="nav" className="hidden md:flex space-x-10">
            <Popover
              className="relative"
              onMouseEnter={() => document.getElementById('specialicaties-button')?.click()}
              onMouseLeave={(e) => {
                e.persist();
                const relatedTarget = e.relatedTarget;
                const isElement = relatedTarget && typeof relatedTarget.closest === 'function';
                if (!isElement || !relatedTarget.closest('.specialicaties-dropdown')) {
                  document.getElementById('specialicaties-button')?.click();
                }
              }}
            >
              {({ open }) => (
                <>
                  <Popover.Button
                    id="specialicaties-button"
                    className={classNames(
                      open
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-300',
                      'group bg-transparent rounded-lg px-3 py-2 inline-flex items-center text-base font-medium hover:text-teal-500 dark:hover:text-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-300 pb-1 border-b-2 border-transparent hover:border-teal-500 dark:hover:border-teal-400 hover:bg-white/10 dark:hover:bg-gray-800/30'
                    )}
                  >
                    <span>{navigation?.navigatieSubmenu?.[0]?.title || 'Specialisaties'}</span>
                    <ChevronDownIcon
                      className={classNames(
                        open
                          ? 'text-gray-600 dark:text-gray-200 rotate-180'
                          : 'text-gray-400 dark:text-gray-300',
                        'ml-2 h-5 w-5 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-transform duration-300'
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
                      <div className="rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-600/50 overflow-hidden backdrop-blur-xl bg-white/80 dark:bg-gray-800/80">
                        <div className="relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8">
                          {navigation &&
                            navigation.navigatieSubmenu &&
                            navigation.navigatieSubmenu[0] &&
                            navigation.navigatieSubmenu[0].menuItems &&
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
                                  <div className="-m-3 p-3 w-full flex items-start rounded-xl hover:bg-teal-50/50 dark:hover:bg-teal-900/20 cursor-pointer transition-all duration-300 group/item">
                                    <div className="ml-4">
                                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 transition-colors duration-300">
                                        {menuItem.title && menuItem.title}
                                      </div>
                                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
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
                        <div className="px-5 py-5 bg-gray-50 dark:bg-gray-700/50 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8 w-full">
                          {navigation.knop && (
                            <div key={navigation.knop.title} className="flow-root">
                              <div className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
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
                                      className="flex-shrink-0 h-6 w-6 text-gray-800 dark:text-gray-200"
                                      aria-hidden="true"
                                    />
                                    <div className="text-base font-medium text-gray-800 dark:text-gray-200 hover:text-teal-500 dark:hover:text-teal-400 ml-4 transition-colors duration-200 whitespace-nowrap">
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
                const relatedTarget = e.relatedTarget;
                const isElement = relatedTarget && typeof relatedTarget.closest === 'function';
                if (!isElement || !relatedTarget.closest('.over-ons-dropdown')) {
                  document.getElementById('over-ons-button')?.click();
                }
              }}
            >
              {({ open }) => (
                <>
                  <Popover.Button
                    id="over-ons-button"
                    className={classNames(
                      open
                        ? 'text-gray-900 dark:text-gray-100'
                        : 'text-gray-500 dark:text-gray-300',
                      'group bg-transparent rounded-lg px-3 py-2 inline-flex items-center text-base font-medium hover:text-teal-500 dark:hover:text-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-300 pb-1 border-b-2 border-transparent hover:border-teal-500 dark:hover:border-teal-400 hover:bg-white/10 dark:hover:bg-gray-800/30'
                    )}
                  >
                    <span>{navigation?.navigatieSubmenu?.[1]?.title || 'Over ons'}</span>
                    <ChevronDownIcon
                      className={classNames(
                        open
                          ? 'text-gray-600 dark:text-gray-200 rotate-180'
                          : 'text-gray-400 dark:text-gray-300',
                        'ml-2 h-5 w-5 group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-transform duration-300'
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
                      <div className="rounded-xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-md">
                        <div className="relative grid gap-6 bg-white dark:bg-gray-700 bg-opacity-95 dark:bg-opacity-95 px-5 py-6 sm:gap-8 sm:p-8 border border-gray-100 dark:border-gray-600 rounded-lg shadow-lg">
                          {navigation &&
                            navigation.navigatieSubmenu &&
                            navigation.navigatieSubmenu[1] &&
                            navigation.navigatieSubmenu[1].menuItems &&
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
                                  <div className="-m-3 p-3 w-full flex items-start rounded-lg hover:bg-white/5 cursor-pointer">
                                    <div className="ml-4">
                                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 transition-colors duration-300">
                                        {menuItem.title && menuItem.title}
                                      </div>
                                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                        {menuItem.description && menuItem.description}
                                      </p>
                                    </div>
                                  </div>
                                </MyLink>
                              ) : (
                                <div
                                  key={menuItem.sys.id}
                                  className="cursor-not-allowed -m-3 p-3 w-full rounded-lg text-gray-400 dark:text-gray-500"
                                >
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
                <Popover.Button key={item.title} as="div" className="flow-root">
                  <div className="group bg-transparent rounded-lg px-3 py-2 inline-flex items-center text-base font-medium text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-300 pb-1 border-b-2 border-transparent hover:border-teal-500 dark:hover:border-teal-400 hover:bg-white/10 dark:hover:bg-gray-800/30">
                    <MyLink
                      href={
                        item.internalLink
                          ? createSlug(item.internalLink.slug, item.internalLink.typeName)
                          : item.externalLink
                      }
                    >
                      <span>{item.title && item.title}</span>
                    </MyLink>
                  </div>
                </Popover.Button>
              ))}
          </Popover.Group>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:flex-none space-x-3 min-w-0">
            {/* "Afspraak maken" / "Make an appointment" Button - First, gets wider in EN */}
            {navigation.knop && (
              <div key={navigation.knop.title} className="flow-root flex-shrink-0">
                <div
                  className={`flex items-center justify-center ${currentLocale === 'en' ? 'px-5' : 'px-4'} h-9 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 hover:from-teal-400 hover:to-cyan-500 dark:hover:from-teal-500 dark:hover:to-cyan-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95`}
                >
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
                    <div className="text-sm font-medium whitespace-nowrap">
                      {navigation.knop.title && navigation.knop.title}
                    </div>
                  </MyLink>
                </div>
              </div>
            )}

            {/* Login Button */}
            <div className="flow-root flex-shrink-0">
              <MyLink
                href="https://login.spotonmedics.nl/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center justify-center space-x-2 h-9 text-sm font-medium text-white bg-gray-800/90 dark:bg-gray-700/90 backdrop-blur-sm hover:bg-gray-700 dark:hover:bg-gray-600 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap hover:scale-105 active:scale-95">
                  <UserCircleIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{t.login}</span>
                </div>
              </MyLink>
            </div>

            {/* Language & Theme group - on the right */}
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200/60 dark:border-gray-600/60 flex-shrink-0">
              {/* Locale toggle */}
              <button
                onClick={() => {
                  const path = router.asPath || '/';
                  const toEn = nextLocale === 'en';
                  const target = toEn
                    ? path.startsWith('/en')
                      ? path
                      : `/en${path === '/' ? '' : path}`
                    : path.replace(/^\/en(\/|$)/, '/');
                  window.location.href = target || '/';
                }}
                className="px-2.5 py-2 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200 whitespace-nowrap"
                type="button"
                aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
              >
                {nextLocale.toUpperCase()}
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                role="switch"
                aria-pressed={isDark}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-gray-600 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-200 flex-shrink-0"
                aria-label={isDark ? t.lightMode : t.darkMode}
                title={isDark ? t.lightMode : t.darkMode}
                type="button"
              >
                {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </button>
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
          <div className="rounded-lg shadow-lg ring-1 ring-black dark:ring-gray-600 ring-opacity-5 dark:ring-opacity-20 bg-white dark:bg-gray-700 bg-opacity-90 dark:bg-opacity-95 backdrop-blur-md divide-y-2 divide-gray-50 dark:divide-gray-600">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="sr-only">Diamond fysio</span>
                  <Link href="/">
                    <div className="z-10 h-11 w-11 relative">
                      {navigation.logo && (
                        <Image
                          src={navigation.logo && navigation.logo.url}
                          alt={navigation.logo?.description || 'Diamond Fysio Amsterdam logo'}
                          fill
                          className="object-cover"
                          quality="100"
                          priority={true}
                        />
                      )}
                    </div>
                  </Link>
                </div>
                <div className="-mr-2">
                  <Popover.Button className="bg-transparent rounded-md p-6 inline-flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors duration-300">
                    <span className="sr-only">{t.closeMenu}</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {navigation &&
                    navigation.navigatieSubmenu &&
                    navigation.navigatieSubmenu[0] &&
                    navigation.navigatieSubmenu[0].menuItems &&
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
                          <div className="-m-4 p-2 w-full flex items-start rounded-lg hover:bg-white/5 dark:hover:bg-gray-700/50 cursor-pointer">
                            <div className="ml-4">
                              <p className="text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700">
                                {menuItem.title && menuItem.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
              {/* Language & Theme toggle buttons for mobile */}
              <div className="flex items-center justify-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                {/* Locale toggle */}
                <button
                  onClick={() => {
                    const path = router.asPath || '/';
                    const toEn = nextLocale === 'en';
                    const target = toEn
                      ? path.startsWith('/en')
                        ? path
                        : `/en${path === '/' ? '' : path}`
                      : path.replace(/^\/en(\/|$)/, '/');
                    window.location.href = target || '/';
                  }}
                  className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-all duration-200"
                  type="button"
                  aria-label={`Switch language to ${nextLocale.toUpperCase()}`}
                >
                  {nextLocale.toUpperCase()}
                </button>

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  role="switch"
                  aria-pressed={isDark}
                  className="flex-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-all duration-200 flex items-center justify-center space-x-2"
                  aria-label={isDark ? t.lightMode : t.darkMode}
                  title={isDark ? t.lightMode : t.darkMode}
                  type="button"
                >
                  {isDark ? (
                    <>
                      <SunIcon className="h-5 w-5" />
                      <span>{t.lightMode}</span>
                    </>
                  ) : (
                    <>
                      <MoonIcon className="h-5 w-5" />
                      <span>{t.darkMode}</span>
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-1 gap-y-2">
                {navigation.menuItems &&
                  navigation.menuItems.map((item) => (
                    <div key={item.title} className="flow-root">
                      <div className="-m-3 p-4 w-full flex items-center justify-center rounded-lg text-base font-medium text-gray-900 dark:text-gray-100 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-300 hover:text-teal-600 dark:hover:text-teal-400">
                        <MyLink
                          href={
                            item.internalLink
                              ? createSlug(item.internalLink.slug, item.internalLink.pageType)
                              : item.externalLink
                          }
                        >
                          <div className="text-base font-medium text-gray-500 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors duration-200">
                            {item.title && item.title}
                          </div>
                        </MyLink>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="space-y-4">
                {navigation.knop && (
                  <div key={navigation.knop.title} className="flow-root">
                    <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 hover:from-teal-400 hover:to-cyan-500 dark:hover:from-teal-500 dark:hover:to-cyan-600 transition-colors duration-300">
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
                  <MyLink
                    href="https://login.spotonmedics.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300">
                      <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                      <span>{t.login}</span>
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
