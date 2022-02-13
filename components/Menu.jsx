/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import {
  BookmarkAltIcon,
  CalendarIcon,
  MenuIcon,
  PhoneIcon,
  ClipboardList,
  SupportIcon,
  XIcon,
  SparklesIcon,
  EmojiHappyIcon,
  MicrophoneIcon,
  HeartIcon,
  CurrencyEuroIcon,
  LibraryIcon,
} from '@heroicons/react/outline'
import { ChevronDownIcon, HandIcon, StatusOnlineIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/solid'

const specialisaties = [
  {
    name: 'Oefentherapie',
    description: 'Leer een gezonde houding aan',
    href: '#',
    icon: EmojiHappyIcon,
  },
  {
    name: 'Manuele therapie',
    description: 'Mobilisatie en manipulatie',
    href: '#',
    icon: HandIcon,
  },
  { name: 'Dry needling', description: "Behandeling myofasciale pijn met een accupunctuurnaald", href: '#', icon: SparklesIcon },
  {
    name: 'Shockwave',
    description: "Natuurlijk herstel met drukgolven",
    href: '#',
    icon: StatusOnlineIcon,
  },
  {
    name: 'Pilates',
    description: 'Verbeter je bewegingspatronen',
    href: '#',
    icon: UsersIcon,
  },
  {
    name: 'Podologie',
    description: 'Optimaliseer de conditie van je voeten',
    href: '#',
    icon: HeartIcon,
  },
  {
    name: 'Vocal massage',
    description: 'Verminder stijve spieren',
    href: '#',
    icon: MicrophoneIcon,
  },
]
const callsToAction = [
  // { name: 'Watch Demo', href: '#', icon: PlayIcon },
  { name: 'Afspraak maken', href: '#', icon: PhoneIcon },
]
const resources = [
  {
    name: 'De praktijk',
    // description: 'Get all of your questions answered in our forums or contact support.',
    href: '#',
    icon: LibraryIcon,
  },
  {
    name: 'Ons team',
    // description: 'Learn how to maximize our platform to get the most out of it.',
    href: '#',
    icon: UserGroupIcon,
  },
  {
    name: 'Contact',
    // description: 'See what meet-ups and other events we might be planning near you.',
    href: '#',
    icon: CalendarIcon,
  },
  { name: 'Tarieven', href: '#', icon: CurrencyEuroIcon },
  // { name: 'Huisregels', href: '#', icon: ClipboardList },
]
const recentPosts = [
  { id: 1, name: 'Boost your conversion rate', href: '#' },
  { id: 2, name: 'How to use search engine optimization to drive traffic to your site', href: '#' },
  { id: 3, name: 'Improve your customer experience', href: '#' },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Menu() {
  return (
    <Popover className="z-30 fixed top-0 bg-white w-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <a href="#">
              <span className="sr-only">Workflow</span>
              <img
                className="h-14 w-auto sm:h-10"
                src="https://ucea83a2e499bd4d30a85e11f6c2.previews.dropboxusercontent.com/p/thumb/ABaC5HISAYbeBFrtJHnQsWVCVpBYTQCh-Ftc7supgFoC2xA20omqk21X5zbPI2CYhIwmCsrFqoo85LPrj85XzqbgVi7Njmlb5cH97gMSBVf9mPcbT-9QGNQ3HKSNNQCEsbp7TVTAvOvIXQU96UfsCUOe7H17Kqd82O9QgXy2D56qO7pkM8Bb-ci2ZSu30WRfWCjrMXtbNzfG_MmADW2qXKTQX7DqU1DPFYeHe6NoBTon4lh1MwrMIxkAbfeuD7N4e-zZt1vQvbtANwc_bh7bbmrDYfGNsHw58Y788G8mdT5tE4ARUrik28RBeNrYb4sUkJFdpKmuw6x3fmKLCH-UFN3nDQ8XCC8-uxcQDGiESiaB_eyfIZmtnNBo-d1aR_uN6wM/p.png"
                alt=""
              />
            </a>
          </div>
          <div className="-mr-2 -my-2 md:hidden">
            <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
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
                    <Popover.Panel className="absolute z-20 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                          {specialisaties.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <item.icon className="flex-shrink-0 h-6 w-6 text-beige" aria-hidden="true" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                        <div className="px-5 py-5 bg-gray-50 space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                          {callsToAction.map((item) => (
                            <div key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100"
                              >
                                <item.icon className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                                <span className="ml-3">{item.name}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>

            <a href="#" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Ons team
            </a>
            

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
                    <Popover.Panel className="absolute z-20 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0">
                      <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                          {resources.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                            >
                              <item.icon className="flex-shrink-0 h-6 w-6 text-beige" aria-hidden="true" />
                              <div className="ml-4">
                                <p className="text-base font-medium text-gray-900">{item.name}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </Popover.Panel>
                  </Transition>
                </>
              )}
            </Popover>
          </Popover.Group>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            <a
              href="#"
              className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-400"
            >
              Afspraak maken
            </a>
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
        <Popover.Panel focus className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <img
                    className="h-8 w-auto"
                    src="https://ucea83a2e499bd4d30a85e11f6c2.previews.dropboxusercontent.com/p/thumb/ABaC5HISAYbeBFrtJHnQsWVCVpBYTQCh-Ftc7supgFoC2xA20omqk21X5zbPI2CYhIwmCsrFqoo85LPrj85XzqbgVi7Njmlb5cH97gMSBVf9mPcbT-9QGNQ3HKSNNQCEsbp7TVTAvOvIXQU96UfsCUOe7H17Kqd82O9QgXy2D56qO7pkM8Bb-ci2ZSu30WRfWCjrMXtbNzfG_MmADW2qXKTQX7DqU1DPFYeHe6NoBTon4lh1MwrMIxkAbfeuD7N4e-zZt1vQvbtANwc_bh7bbmrDYfGNsHw58Y788G8mdT5tE4ARUrik28RBeNrYb4sUkJFdpKmuw6x3fmKLCH-UFN3nDQ8XCC8-uxcQDGiESiaB_eyfIZmtnNBo-d1aR_uN6wM/p.png"
                    alt="Workflow"
                  />
                </div>
                <div className="-mr-2">
                  <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
              </div>
              <div className="mt-6">
                <nav className="grid gap-y-8">
                  {specialisaties.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-m-3 p-1 flex items-center rounded-md hover:bg-gray-50"
                    >
                      <item.icon className="flex-shrink-0 h-6 w-6 text-beige" aria-hidden="true" />
                      <span className="ml-3 text-base font-medium text-gray-900">{item.name}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </div>
            <div className="py-6 px-5 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Ons team
                </a>

                <a href="#" className="text-base font-medium text-gray-900 hover:text-gray-700">
                  Docs
                </a>
                {resources.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-base font-medium text-gray-900 hover:text-gray-700"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div>
                <a
                  href="#"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign up
                </a>
                <p className="mt-6 text-center text-base font-medium text-gray-500">
                  Existing customer?{' '}
                  <a href="#" className="text-beige hover:text-indigo-500">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}