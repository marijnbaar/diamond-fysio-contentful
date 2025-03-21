import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import Thanks from './Thanks';

export default function Contactform() {
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Voornaam is verplicht';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Achternaam is verplicht';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is verplicht';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail is ongeldig';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Onderwerp is verplicht';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bericht is verplicht';
    } else if (formData.message.length > 500) {
      newErrors.message = 'Bericht mag maximaal 500 karakters bevatten';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleOnSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.status === 200) {
        setSuccess(true);
        // Reset form after successful submission
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        // Handle server error
        setErrors({
          submit:
            data.error || 'Er is een fout opgetreden bij het verzenden. Probeer het later opnieuw.'
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: 'Er is een fout opgetreden bij het verzenden. Probeer het later opnieuw.'
      });
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return <Thanks />;
  }

  return (
    <div className="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
      <h4 className="text-xl font-bold text-gray-900">Neem contact met ons op</h4>
      <p className="mt-2 text-gray-600">
        Vul het onderstaande formulier in en we nemen zo snel mogelijk contact met u op.
      </p>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <form
        method="POST"
        className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
        onSubmit={handleOnSubmit}
        noValidate
      >
        <div>
          <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
            Voornaam <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={formData.firstname}
              onChange={handleChange}
              autoComplete="given-name"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.firstname ? 'border-red-300' : 'border-gray-300'
              } rounded-md`}
            />
            {errors.firstname && (
              <p className="mt-1 text-sm text-red-600" id="firstname-error">
                {errors.firstname}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
            Achternaam <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={formData.lastname}
              onChange={handleChange}
              autoComplete="family-name"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.lastname ? 'border-red-300' : 'border-gray-300'
              } rounded-md`}
            />
            {errors.lastname && (
              <p className="mt-1 text-sm text-red-600" id="lastname-error">
                {errors.lastname}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              } rounded-md`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" id="email-error">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Telefoonnummer
            </label>
            <span id="phone-optional" className="text-sm text-gray-500">
              Optioneel
            </span>
          </div>
          <div className="mt-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              className="py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border-gray-300 rounded-md"
              aria-describedby="phone-optional"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Onderwerp <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.subject ? 'border-red-300' : 'border-gray-300'
              } rounded-md`}
            />
            {errors.subject && (
              <p className="mt-1 text-sm text-red-600" id="subject-error">
                {errors.subject}
              </p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="flex justify-between">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Bericht <span className="text-red-500">*</span>
            </label>
            <span id="message-max" className="text-sm text-gray-500">
              <span className={formData.message.length > 500 ? 'text-red-500 font-medium' : ''}>
                {formData.message.length}
              </span>{' '}
              / 500 karakters
            </span>
          </div>
          <div className="mt-1">
            <textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.message ? 'border-red-300' : 'border-gray-300'
              } rounded-md`}
              aria-describedby="message-max"
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600" id="message-error">
                {errors.message}
              </p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2 sm:flex sm:justify-end">
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto transition-colors duration-200 ease-in-out disabled:bg-teal-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verzenden...
              </>
            ) : (
              <>
                Verzenden
                <CheckCircleIcon className="ml-2 -mr-0.5 h-5 w-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
