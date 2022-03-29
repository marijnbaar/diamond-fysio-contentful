import { ExternalLinkIcon } from '@heroicons/react/solid';

export default function CTA() {
  return (
    <div className="relative bg-gray-900">
      <div className="relative h-56 bg-indigo-600 sm:h-72 md:absolute md:left-0 md:h-full md:w-1/2">
        <img
          className="w-full h-full object-cover"
          src="https://leilaspilates.nl/wp-content/uploads/2022/03/0441082c70da3cad94a060b55f44b014.jpg"
          alt=""
        />
        <div aria-hidden="true" className="absolute inset-0 mix-blend-multiply" />
      </div>
      <div className="relative mx-auto max-w-md px-4 py-12 sm:max-w-7xl sm:px-6 sm:py-20 md:py-28 lg:px-8 lg:py-32">
        <div className="md:ml-auto md:w-1/2 md:pl-10">
          <h2 className="text-base font-semibold uppercase tracking-wider text-gray-300">
            Van Red-Cord tot Pilates
          </h2>
          <p className="mt-2 text-white text-3xl font-extrabold tracking-tight sm:text-4xl">
            Een nieuwe manier van bewegen
          </p>
          <p className="mt-3 text-lg text-gray-300">
            Veel van onze therapeuten hebben een dans-achtergrond, en helpen je graag bij het
            aanleren van nieuwe bewegingspatronen. Klachten kunnen verminderen als je andere
            spiergroepen traint sterker te worden.
          </p>
          <div className="mt-8">
            <div className="inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-50"
              >
                Lees meer
                <ExternalLinkIcon className="-mr-1 ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
