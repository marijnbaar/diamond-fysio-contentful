import { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/solid';
import Thanks from './Thanks';
import { useRouter } from 'next/router';

export default function Contactform({ i18n }) {
  const router = useRouter();
  const locale = router?.locale || 'nl';
  const isEn = locale === 'en';
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

  // Default translations based on locale
  const defaults = {
    nl: {
      title: 'Neem contact met ons op',
      description:
        'Vul het onderstaande formulier in en we nemen zo snel mogelijk contact met u op.',
      labels: {
        firstname: 'Voornaam',
        lastname: 'Achternaam',
        email: 'E-mail',
        phone: 'Telefoonnummer',
        optional: 'Optioneel',
        subject: 'Onderwerp',
        message: 'Bericht'
      },
      submit: 'Verzenden',
      submitting: 'Verzenden...',
      success: 'Bedankt! Uw bericht is verzonden.',
      errors: {
        firstname: 'Voornaam is verplicht',
        lastname: 'Achternaam is verplicht',
        emailRequired: 'E-mail is verplicht',
        emailInvalid: 'E-mail is ongeldig',
        subject: 'Onderwerp is verplicht',
        messageRequired: 'Bericht is verplicht',
        messageTooLong: 'Bericht mag maximaal 500 karakters bevatten',
        submit: 'Er is een fout opgetreden bij het verzenden. Probeer het later opnieuw.'
      }
    },
    en: {
      title: 'Get in touch with us',
      description: 'Fill out the form below and we will get back to you as soon as possible.',
      labels: {
        firstname: 'First name',
        lastname: 'Last name',
        email: 'Email',
        phone: 'Phone number',
        optional: 'Optional',
        subject: 'Subject',
        message: 'Message'
      },
      submit: 'Send',
      submitting: 'Sending...',
      success: 'Thank you! Your message has been sent.',
      errors: {
        firstname: 'First name is required',
        lastname: 'Last name is required',
        emailRequired: 'Email is required',
        emailInvalid: 'Email is invalid',
        subject: 'Subject is required',
        messageRequired: 'Message is required',
        messageTooLong: 'Message must not exceed 500 characters',
        submit: 'An error occurred while sending. Please try again later.'
      }
    }
  };

  const defaultT = defaults[isEn ? 'en' : 'nl'];

  const t = {
    title: i18n?.title || defaultT.title,
    description: i18n?.description || defaultT.description,
    labels: {
      firstname: i18n?.labels?.firstname || defaultT.labels.firstname,
      lastname: i18n?.labels?.lastname || defaultT.labels.lastname,
      email: i18n?.labels?.email || defaultT.labels.email,
      phone: i18n?.labels?.phone || defaultT.labels.phone,
      optional: i18n?.labels?.optional || defaultT.labels.optional,
      subject: i18n?.labels?.subject || defaultT.labels.subject,
      message: i18n?.labels?.message || defaultT.labels.message
    },
    submit: i18n?.submit || defaultT.submit,
    submitting: i18n?.submitting || defaultT.submitting,
    success: i18n?.success || defaultT.success,
    errors: {
      firstname: i18n?.errors?.firstname || defaultT.errors.firstname,
      lastname: i18n?.errors?.lastname || defaultT.errors.lastname,
      emailRequired: i18n?.errors?.emailRequired || defaultT.errors.emailRequired,
      emailInvalid: i18n?.errors?.emailInvalid || defaultT.errors.emailInvalid,
      subject: i18n?.errors?.subject || defaultT.errors.subject,
      messageRequired: i18n?.errors?.messageRequired || defaultT.errors.messageRequired,
      messageTooLong: i18n?.errors?.messageTooLong || defaultT.errors.messageTooLong,
      submit: i18n?.errors?.submit || defaultT.errors.submit
    }
  };

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
      newErrors.firstname = t.errors.firstname;
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = t.errors.lastname;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t.errors.subject;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.errors.messageRequired;
    } else if (formData.message.length > 500) {
      newErrors.message = t.errors.messageTooLong;
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
      const res = await fetch('https://formspree.io/f/xdkpdyrl', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
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
          submit: data.error || data.message || t.errors.submit
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        submit: t.errors.submit
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
      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.title}</h4>
      <p className="mt-2 text-gray-600 dark:text-gray-300">{t.description}</p>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      <form
        method="POST"
        className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
        onSubmit={handleOnSubmit}
        noValidate
      >
        <div>
          <label
            htmlFor="firstname"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t.labels.firstname} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              name="firstname"
              id="firstname"
              value={formData.firstname}
              onChange={handleChange}
              autoComplete="given-name"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.firstname
                  ? 'border-red-300 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
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
          <label
            htmlFor="lastname"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t.labels.lastname} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="lastname"
              id="lastname"
              value={formData.lastname}
              onChange={handleChange}
              autoComplete="family-name"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.lastname
                  ? 'border-red-300 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
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
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t.labels.email} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.email
                  ? 'border-red-300 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
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
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t.labels.phone}
            </label>
            <span id="phone-optional" className="text-sm text-gray-500 dark:text-gray-400">
              {t.labels.optional}
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
              className="py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border-gray-300 dark:border-gray-600 rounded-md"
              aria-describedby="phone-optional"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t.labels.subject} <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.subject
                  ? 'border-red-300 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
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
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t.labels.message} <span className="text-red-500">*</span>
            </label>
            <span id="message-max" className="text-sm text-gray-500 dark:text-gray-400">
              <span className={formData.message.length > 500 ? 'text-red-500 font-medium' : ''}>
                {formData.message.length}
              </span>{' '}
              / 500 {isEn ? 'characters' : 'karakters'}
            </span>
          </div>
          <div className="mt-1">
            <textarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              className={`py-3 px-4 block w-full shadow-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-teal-500 focus:border-teal-500 border ${
                errors.message
                  ? 'border-red-300 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
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
            className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:w-auto transition-colors duration-200 ease-in-out disabled:bg-teal-400 disabled:cursor-not-allowed cursor-pointer"
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
                {t.submitting}
              </>
            ) : (
              <>
                {t.submit}
                <CheckCircleIcon className="ml-2 -mr-0.5 h-5 w-5" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
