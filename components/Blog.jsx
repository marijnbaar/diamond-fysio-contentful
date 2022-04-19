// /* Blog section */
// const blogspecialisations = [
//   {
//     id: 1,
//     title: 'Shockwave',
//     href: '#',
//     date: 'Mar 16, 2020',
//     datetime: '2020-03-16',
//     category: { name: 'Article', href: '#' },
//     imageUrl:
//       'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80',
//     preview:
//       'Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto accusantium praesentium eius, ut atque fuga culpa, similique sequi cum eos quis dolorum.',
//     author: {
//       name: 'Regi Severins',
//       imageUrl:
//         'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//       href: '#'
//     },
//     readingLength: '6 min'
//   },
//   {
//     id: 2,
//     title: 'Dry Needling',
//     href: '#',
//     date: 'Mar 10, 2020',
//     datetime: '2020-03-10',
//     category: { name: 'Video', href: '#' },
//     imageUrl:
//       'https://images.unsplash.com/photo-1547586696-ea22b4d4235d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80',
//     preview:
//       'Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit facilis asperiores porro quaerat doloribus, eveniet dolore. Adipisci tempora aut inventore optio animi., tempore temporibus quo laudantium.',
//     author: {
//       name: 'Brenna Goyette',
//       imageUrl:
//         'https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//       href: '#'
//     },
//     readingLength: '4 min'
//   },
//   {
//     id: 3,
//     title: 'Improve your customer experience',
//     href: '#',
//     date: 'Feb 12, 2020',
//     datetime: '2020-02-12',
//     category: { name: 'Case Study', href: '#' },
//     imageUrl:
//       'https://images.unsplash.com/photo-1492724441997-5dc865305da7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1679&q=80',
//     preview:
//       'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint harum rerum voluptatem quo recusandae magni placeat saepe molestiae, sed excepturi cumque corporis perferendis hic.',
//     author: {
//       name: 'Daniela Metz',
//       imageUrl:
//         'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
//       href: '#'
//     },
//     readingLength: '11 min'
//   }
// ];

export default function Specialisations({
  title,
  subtitle,
  description,
  specialisationCollection
}) {
  return (
    <div className="relative bg-gray-50 py-16 sm:py-24 lg:py-32">
      <div className="relative">
        <div className="text-center mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:px-8 lg:max-w-7xl">
          <h2 className="text-base font-semibold tracking-wider text-cyan-600 uppercase">
            {subtitle}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            {title}
          </p>
          <p className="mt-5 mx-auto max-w-prose text-xl text-gray-500">{description}</p>
        </div>
        <div className="mt-12 mx-auto max-w-md px-4 grid gap-8 sm:max-w-lg sm:px-6 lg:px-8 lg:grid-cols-3 lg:max-w-7xl">
          {specialisationCollection.items.map((specialisation) => (
            <div
              key={specialisation.id}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden"
            >
              <div className="flex-shrink-0">
                <img className="h-48 w-full object-cover" src={specialisation.image} alt="" />
              </div>
              <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-600">
                    <a href={specialisation.subtitle} className="hover:underline">
                      {specialisation.title}
                    </a>
                  </p>
                  <a href={specialisation} className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900">{specialisation.title}</p>
                    <p className="mt-3 text-base text-gray-500">{specialisation.preview}</p>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
