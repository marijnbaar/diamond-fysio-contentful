/* This example requires Tailwind CSS v2.0+ */
import ReCAPTCHA from 'react-google-recaptcha';
import react, { useState } from 'react';
import Thanks from './Thanks';

export default function Contactform() {
  const [success, setSuccess] = useState(false);

  const reRef = react.createRef();

  async function handleOnSubmit(e) {
    e.preventDefault();

    const formData = {};

    Array.from(e.currentTarget.elements).forEach((field) => {
      if (!field.name) return;
      formData[field.name] = field.value;
    });
    const token = await reRef.current.executeAsync();
    reRef.current.reset();

    const res = await fetch('/api/mail', {
      method: 'POST',
      body: JSON.stringify(formData),
      token: JSON.stringify(token)
    });
    if (res.status === 200) {
      console.log('Great job!', "You've passed the challenge!", 'success');
      setSuccess(true);
    }
  }

  if (success) {
    return <Thanks />;
  }

  return (
    <>
      {/* Contact form */}
      <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
        <h3 className="text-lg font-medium text-warm-gray-900">Neem contact met ons op</h3>
        <form
          action="#"
          method="POST"
          className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
          onSubmit={handleOnSubmit}
        >
          <div>
            <label htmlFor="firstname" className="block text-sm font-medium text-warm-gray-900">
              Voornaam
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="firstname"
                id="firstname"
                autoComplete="given-name"
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border-warm-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label htmlFor="lastname" className="block text-sm font-medium text-warm-gray-900">
              Achternaam
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="lastname"
                id="lastname"
                autoComplete="family-name"
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border-warm-gray-300 rounded-md"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-warm-gray-900">
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border-warm-gray-300 rounded-md"
                required
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <label htmlFor="phone" className="block text-sm font-medium text-warm-gray-900">
                Telefoonnummer
              </label>
              <span id="phone-optional" className="text-sm text-warm-gray-500">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="text"
                name="phone"
                id="phone"
                autoComplete="tel"
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border-warm-gray-300 rounded-md"
                aria-describedby="phone-optional"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="subject" className="block text-sm font-medium text-warm-gray-900">
              Onderwerp
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="subject"
                id="subject"
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border-warm-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <div className="flex justify-between">
              <label htmlFor="message" className="block text-sm font-medium text-warm-gray-900">
                Bericht
              </label>
              <span id="message-max" className="text-sm text-warm-gray-500">
                Max. 500 karakters
              </span>
            </div>
            <div className="mt-1">
              <textarea
                id="message"
                name="message"
                rows={4}
                className="py-3 px-4 block w-full shadow-sm text-warm-gray-900 focus:ring-teal-500 focus:border-teal-500 border border-warm-gray-300 rounded-md"
                aria-describedby="message-max"
                defaultValue={''}
              />
            </div>
          </div>
          <div className="justify-end">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
              size="invisible"
              ref={reRef}
            />
          </div>
          <div className="sm:col-span-2 sm:flex sm:justify-end">
            <button
              type="submit"
              className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto"
            >
              Verzend
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
