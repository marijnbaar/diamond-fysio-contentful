export default function Thankyou({ bedanktekst }) {
  return (
    <div className="bg-gray-50 py-6 lg:py-24 w-full col-span-2">
      <div className="relative mx-auto px-4 sm:px-6 lg:px-8 mb-0">
        <div className="relative py-11 px-8 mt-32 bg-white rounded-xl shadow-2xl overflow-hidden lg:px-16 lg:grid lg:grid-cols-2 w-full lg:gap-x-8">
          <div className="relative lg:col-span-12">
            <blockquote className="mt-2 text-gray-400">
              <p className="text-xl font-medium sm:text-2xl">{bedanktekst && bedanktekst}</p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
