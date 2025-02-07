import Button from './Button';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import createSlug from '../lib/helpers/createSlug';

export default function Appointment({
  title,
  description,
  longDescription,
  appointmentCardsCollection,
  alert,
  alertDescription
}) {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto mt-20 py-12 px-4 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="space-y-12">
          <div className="space-y-5 sm:mx-auto sm:max-w-xl sm:space-y-4 lg:max-w-5xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title && title}</h2>
            <p className="text-xl text-gray-500">{description && description}</p>
            {alert && (
              <div className="relative py-11 px-8 bg-white rounded-xl shadow-2xl overflow-hidden lg:px-16 lg:grid lg:grid-cols-1 lg:gap-x-8">
                <blockquote className="mt-2 text-gray-400">
                  <p className="text-xl font-medium sm:text-2xl">
                    {alertDescription && alertDescription}
                  </p>
                </blockquote>
                {/* <div className="mt-4  w-44 mx-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-grey-lightGreen hover:bg-gray-400">
                  <Link href="/contact">Neem contact op</Link>
                </div> */}
              </div>
            )}
            <ul className="mx-auto space-y-16 pt-11 sm:grid sm:grid-cols-2 sm:gap-16 sm:space-y-0 lg:grid-cols-3 lg:max-w-5xl">
              {appointmentCardsCollection &&
                appointmentCardsCollection.items.map((appointmentCard) => (
                  <li key={appointmentCard.title}>
                    <div className="space-y-6 rounded-lg shadow-lg overflow-hidden p-6">
                      <div className="space-y-2">
                        <div className="text-lg leading-6 font-medium space-y-1">
                          <h2>{appointmentCard.title && appointmentCard.title}</h2>
                          <p className="p-2 text-base text-gray-500">
                            {appointmentCard.description}
                          </p>
                          {appointmentCard.button && (
                            <div className="my-2">
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
    </div>
  );
}
