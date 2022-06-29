import Button from './Button';
import createSlug from '../lib/helpers/createSlug';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
export default function Appointment({
  title,
  description,
  longDescription,
  appointmentCardsCollection
}) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto mt-20 py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
            <p className="text-xl text-gray-500">{description}</p>
          </div>
          <ul
            role="list"
            className="mx-auto space-y-16 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl"
          >
            {appointmentCardsCollection &&
              appointmentCardsCollection.items.map((appointmentCard) => (
                <li key={appointmentCard.title}>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-lg leading-6 font-medium space-y-1">
                        <h2>{appointmentCard.title && appointmentCard.title}</h2>
                        <p className="p-2 text-base text-gray-500">{appointmentCard.description}</p>
                        {appointmentCard.button && (
                          <div className="my-2">
                            <Button
                              title={appointmentCard.button.title}
                              type={appointmentCard.button.type}
                              internal_link={
                                appointmentCard.button.internalLink &&
                                createSlug(
                                  appointmentCard.button.internalLink.slug,
                                  appointmentCard.button.internalLink.__typename
                                )
                              }
                              external_link={appointmentCard.button.externalLink}
                              extra_classes="sm:w-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            <div className="mt-10">
              <dl className="space-y-10 mx-auto md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10"></dl>
              <div className="flex flex-col rounded-lg shadow-lg overflow-hidden">
                <div className="flex-1 bg-grey-lightGreen p-4 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="prose block mt-2 text-sm font-small leading-5">
                      {longDescription && documentToReactComponents(longDescription.json)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}
