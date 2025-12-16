export default function Highlight({ info }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12 lg:py-16">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 lg:-mt-44 mb-0">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-teal-500/10 ring-1 ring-black/5 relative theme-card flex transition-transform hover:-translate-y-1 duration-700 ease-out">
          {/* Left accent bar with soft gradient */}
          <div className="w-1.5 bg-gradient-to-b from-teal-400 via-cyan-400 to-teal-400 opacity-80" />

          <div className="flex-1 py-10 px-8 lg:px-16 relative">
            {/* Soft background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />

            <div className="relative">
              <blockquote className="text-gray-600 dark:text-gray-300">
                <p className="text-lg md:text-xl font-medium leading-loose tracking-wide animate-fade-in-up">
                  {info}
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
