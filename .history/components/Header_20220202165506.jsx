/* This example requires Tailwind CSS v2.0+ */

export default function Header() {
  return (

          


          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block text-white xl:inline">Welkom bij</span>{' '}
                <span className="block text-teal-200 xl:inline">Diamond fysio</span>
              </h1>
              <p className="mt-3 text-base text-gray-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Fysiopraktijk in Amsterdam.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-beige hover:bg-gray-400 md:py-4 md:text-lg md:px-10"
                  >
                    Over ons
                  </a>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <a
                    href="#"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-teal-100 bg-teal-500 hover:bg-teal-400 md:py-4 md:text-lg md:px-10"
                  >
                    Afspraak maken
                  </a>
                </div>
              </div>
            </div>
          </main>
     
  )
}
