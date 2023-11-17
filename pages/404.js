import Link from 'next/link';

/* This example requires Tailwind CSS v2.0+ */
export default function FourOhFour() {
  return (
    <>
      <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8 lg:mt-11">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-teal-500 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link href="/">
                  <p className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-500 hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                    Go back home
                  </p>
                </Link>
                <Link href="/contact">
                  <p className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-beige hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                    Contact
                  </p>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
