import { useEffect } from 'react';
import Button from './Button';
import createSlug from '../lib/helpers/createSlug';
import { useRouter } from 'next/router';
import { ExternalLinkIcon } from '@heroicons/react/solid';

// Premium AppointmentCard component
const AppointmentCard = ({ appointmentCard, index, locale }) => {
  if (!appointmentCard) return null;

  const isEn = (locale || 'nl').toLowerCase() === 'en';
  const badge =
    index === 0
      ? isEn
        ? 'NEW APPOINTMENT'
        : 'NIEUWE AFSPRAAK'
      : isEn
        ? 'FOLLOW-UP APPOINTMENT'
        : 'VERVOLGAFSPRAAK';

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl hover:shadow-2xl dark:hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden group">
      {/* Decoratieve elementen */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500 dark:bg-teal-600 opacity-5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-600 dark:bg-teal-500 opacity-5 rounded-full -ml-4 -mb-4 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="p-8 flex-grow relative z-10">
        <span className="inline-block mb-4 text-teal-500 dark:text-teal-400 text-sm font-semibold tracking-widest">
          {badge}
        </span>
        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
          {appointmentCard.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {appointmentCard.description}
        </p>
      </div>

      {appointmentCard.button && (
        <div className="p-8 pt-0 mt-auto relative z-10">
          <Button
            title={appointmentCard.button.title}
            type={appointmentCard.button.type}
            internal_link={
              appointmentCard.button.internalLink &&
              createSlug(
                appointmentCard.button.internalLink.slug,
                appointmentCard.button.internalLink.pageType
              )
            }
            external_link={appointmentCard.button.externalLink}
            extra_classes="w-full py-4 px-6 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

// Luxe TherapistCard component
const TherapistCard = ({ name, link, isEmail }) => {
  // Dark mode compatible styling - use teal colors instead of light gradients
  const CardContent = () => (
    <div className="px-6 py-4 rounded-lg border border-teal-500/30 dark:border-teal-400/30 bg-teal-50 dark:bg-gray-800/50 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-teal-500 dark:hover:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 cursor-pointer flex items-center justify-between group relative overflow-hidden h-full">
      {/* Subtiele animatie-element */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-teal-200 dark:bg-teal-800 opacity-0 rounded-full group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity duration-700"></div>

      <span className="absolute left-0 top-0 w-1 h-full bg-teal-500 dark:bg-teal-400 transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300"></span>
      <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
        {name}
      </p>
      {link && !isEmail && (
        <ExternalLinkIcon className="w-5 h-5 text-teal-500 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );

  if (link && !isEmail) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full mb-4 last:mb-0"
      >
        <CardContent />
      </a>
    );
  }

  if (isEmail) {
    return (
      <a href={`mailto:${link || ''}`} className="block w-full mb-4 last:mb-0">
        <CardContent />
      </a>
    );
  }

  return (
    <div className="w-full mb-4 last:mb-0">
      <CardContent />
    </div>
  );
};

export default function Appointment({
  title,
  description,
  appointmentCardsCollection,
  alert,
  alertDescription
}) {
  const { locale } = useRouter();
  const isEn = (locale || 'nl').toLowerCase() === 'en';

  // Scroll animatie effect
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  // Veilig de collection verwerken
  const cards = appointmentCardsCollection?.items || [];

  const defaultLink = 'https://api.spotonmedics.nl/praktijk/EditAppointment?step=1';

  // Data structure matching the requested column layout
  // Column 1: Iva, Laszlo, Menno
  // Column 2: Regi, Robin, Rutger
  // Column 3: Benjamin
  const smartfileColumns = [
    [
      { name: 'Iva Lešić', link: defaultLink },
      { name: 'Laszlo Gèleng', link: defaultLink },
      { name: 'Menno de Vries', link: defaultLink }
    ],
    [
      { name: 'Regi Severins', link: defaultLink },
      { name: 'Robin Rosa Pennings', link: defaultLink },
      { name: 'Rutger Klauwers', link: defaultLink }
    ],
    [
      {
        name: 'Benjamin Soerel',
        link: 'https://web.smartfile.nl/booking/practise/c0e5560a-eae4-4856-a8a1-fa4b30593a66/public_therapists/b22865ed-730e-4d50-8510-7554cd8adb21'
      }
    ]
  ];

  const emailTherapists = [
    { name: 'Ton Willemsen', email: 'tonwillemsen@me.com' },
    { name: 'Lidia Bernabei', email: 'info@mymedidiet.com' },
    { name: 'Niels', email: 'info@osteopathie-tuijl.nl' },
    { name: 'Leila', email: 'leilaspilates@gmail.com' }
  ];

  const therapistHeading = isEn
    ? 'Choose your therapist below to make an appointment:'
    : 'Kies hieronder uw therapeut om vervolgens een afspraak te kunnen maken:';

  const emailHeading = isEn
    ? 'Mail the following therapists or trainers to make an appointment:'
    : 'Mail onderstaande therapeuten of trainers om een afspraak te maken:';

  return (
    <section className="max-w-7xl mx-auto pt-28 sm:pt-32 lg:pt-40 pb-12 lg:pb-16 px-4 sm:px-6 relative scroll-mt-24">
      {/* Decoratieve elementen */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-teal-100 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-100 rounded-full opacity-10 blur-3xl"></div>

      {/* Header Section met premium styling */}
      <div className="text-center mb-16 animate-on-scroll opacity-0 transition-all duration-1000">
        {title && (
          <h2 className="text-4xl font-bold mb-6 relative inline-block text-gray-900 dark:text-gray-100">
            {title}
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-teal-500 dark:bg-teal-400 rounded-full"></span>
          </h2>
        )}
        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        )}

        {alert && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-xl p-6 mt-6 transition-all hover:shadow-lg duration-300 border border-gray-100 dark:border-gray-700">
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
              {alertDescription}
            </p>
          </div>
        )}
      </div>

      {/* Therapeuten Sectie - Smartfile */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-10 shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 animate-on-scroll opacity-0 transition-all duration-700 relative overflow-hidden mb-12">
        {/* Decoratieve elementen */}
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-50 dark:bg-teal-900/20 opacity-30 rounded-full"></div>

        <h3 className="text-2xl font-semibold mb-8 text-center relative inline-block text-gray-900 dark:text-gray-100">
          {therapistHeading}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {smartfileColumns.map((column, colIndex) => (
            <div key={`col-${colIndex}`} className="flex flex-col gap-4">
              {column.map((therapist, index) => (
                <div
                  key={`therapist-${colIndex}-${index}`}
                  className="animate-on-scroll opacity-0 transition-all duration-500"
                  style={{ transitionDelay: `${(colIndex * 3 + index) * 100}ms` }}
                >
                  <TherapistCard name={therapist.name} link={therapist.link} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Therapeuten Sectie - Email */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-10 shadow-lg dark:shadow-xl border border-gray-100 dark:border-gray-700 animate-on-scroll opacity-0 transition-all duration-700 relative overflow-hidden">
        {/* Decoratieve elementen */}
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500"></div>

        <h3 className="text-2xl font-semibold mb-8 text-center relative inline-block text-gray-900 dark:text-gray-100">
          {emailHeading}
        </h3>

        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {emailTherapists.map((therapist, index) => (
            <div
              key={`email-therapist-${index}`}
              className="animate-on-scroll opacity-0 transition-all duration-500 w-full md:w-auto md:min-w-[200px]"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <TherapistCard name={therapist.name} link={therapist.email} isEmail={true} />
            </div>
          ))}
        </div>
      </div>

      {/* CSS voor geavanceerde animaties */}
      <style jsx>{`
        @keyframes fadeScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-on-scroll.animate-in {
          animation: fadeScale 0.7s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
