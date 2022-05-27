/* This example requires Tailwind CSS v2.0+ */
export default function Highlight({ info }) {
  return (
    <div className=" bg-gray-50 py-6 lg:py-24">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:-mt-36 mb-0">
        <div className="relative py-11 px-8 bg-white rounded-xl shadow-2xl overflow-hidden lg:px-16 lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div className="relative lg:col-span-2">
            <blockquote className="mt-2 text-gray-400">
              <p className="text-xl font-medium sm:text-2xl">{info}</p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
}
