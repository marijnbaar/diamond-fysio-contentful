import React, { useEffect } from 'react';
import Button from './Button';
import createSlug from '../lib/helpers/createSlug';

// Premium AppointmentCard component
const AppointmentCard = ({ appointmentCard, index }) => {
  if (!appointmentCard) return null;

  return (
    <div className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border border-gray-100 overflow-hidden group">
      {/* Decoratieve elementen */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500 opacity-5 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-teal-600 opacity-5 rounded-full -ml-4 -mb-4 group-hover:scale-150 transition-transform duration-700"></div>

      <div className="p-8 flex-grow relative z-10">
        <span className="inline-block mb-4 text-teal-500 text-sm font-semibold tracking-widest">
          {index === 0 ? 'NIEUWE AFSPRAAK' : 'VERVOLGAFSPRAAK'}
        </span>
        <h3 className="text-2xl font-bold mb-4 group-hover:text-teal-600 transition-colors duration-300">
          {appointmentCard.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{appointmentCard.description}</p>
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
const TherapistCard = ({ name, index }) => {
  // Genereer stijlvolle achtergrond gradient per therapeut
  const gradients = [
    'from-teal-50 to-cyan-50 border-teal-200',
    'from-cyan-50 to-blue-50 border-cyan-200',
    'from-blue-50 to-teal-50 border-blue-200',
    'from-emerald-50 to-teal-50 border-emerald-200',
    'from-green-50 to-emerald-50 border-green-200',
    'from-teal-50 to-green-50 border-teal-200'
  ];

  const gradientIndex = index % gradients.length;
  const gradientClass = gradients[gradientIndex];

  return (
    <div
      className={`px-6 py-4 rounded-lg border bg-gradient-to-br ${gradientClass} transform transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer flex items-center group relative overflow-hidden`}
    >
      {/* Subtiele animatie-element */}
      <div className="absolute -right-12 -top-12 w-24 h-24 bg-white opacity-0 rounded-full group-hover:opacity-10 transition-opacity duration-700"></div>

      <span className="absolute left-0 top-0 w-1 h-full bg-teal-400 transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300"></span>
      <p className="font-medium text-gray-800">{name}</p>
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

  // Therapeuten lijst
  const therapists = [
    'Iva Lešić',
    'Laszlo Gèleng',
    'Menno de Vries',
    'Regi Severins',
    'Rutger Klauwers',
    'Robin Rosa Pennings'
  ];

  return (
    <section className="max-w-7xl mx-auto pt-32 pb-16 px-4 sm:px-6 relative">
      {/* Decoratieve elementen */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-teal-100 rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-100 rounded-full opacity-10 blur-3xl"></div>

      {/* Header Section met premium styling */}
      <div className="text-center mb-16 animate-on-scroll opacity-0 transition-all duration-1000">
        {title && (
          <h2 className="text-4xl font-bold mb-6 relative inline-block">
            {title}
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-teal-500 rounded-full"></span>
          </h2>
        )}
        {description && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">{description}</p>
        )}

        {alert && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6 transition-all hover:shadow-lg duration-300 border border-gray-100">
            <p className="text-xl text-gray-500 font-medium">{alertDescription}</p>
          </div>
        )}
      </div>

      {/* Appointment Cards - premium design */}
      {cards.length > 0 && (
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-5xl mx-auto">
          {cards.map((card, index) => (
            <div
              key={`appointment-card-${index}`}
              className="animate-on-scroll opacity-0 transition-all duration-700"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <AppointmentCard appointmentCard={card} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Therapeuten Sectie met premium styling */}
      <div className="bg-white rounded-xl p-10 shadow-lg border border-gray-100 animate-on-scroll opacity-0 transition-all duration-700 relative overflow-hidden">
        {/* Decoratieve elementen */}
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-teal-400 to-cyan-400"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-50 opacity-30 rounded-full"></div>

        <h3 className="text-2xl font-semibold mb-8 text-center relative inline-block">
          Voor de volgende therapeuten kun je gemakkelijk een online afspraak maken:
        </h3>

        <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
          {therapists.map((therapist, index) => (
            <div
              key={`therapist-${index}`}
              className="animate-on-scroll opacity-0 transition-all duration-500"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <TherapistCard name={therapist} index={index} />
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
