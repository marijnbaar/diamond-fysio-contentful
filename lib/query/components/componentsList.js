import gql from 'graphql-tag';
import fragmentButton from '../fragments/button';
import fragmentSpecialisation from '../fragments/specialisation';
import { fragmentTeamMember } from '../fragments/teamMember';
import fragmentTestimonial from '../fragments/testimonial';
import fragmentAboutFeature from '../fragments/aboutfeature';
import fragmentAppointmentCard from '../fragments/appointmentcard';
import fragmentTeammemberTag from '../fragments/teamtag';

const fragmentComponentList = (model) => gql`
  fragment componentList${model} on ${model}ComponentsCollection {
    items {
      ... on HeaderPricingpage {
        __typename
        sys {
          id
        }
        headerType
        showPopup
        popupText
        # title {
        #   json
        # }
        # info {
        #   json
        # }
        descriptionRichText {
          json
        }
        image {
          url
        }
        buttonCollection(locale: $locale, limit: 3) {
          items {
            ...button
          }
        }
      }
      ... on Highlight {
        __typename
        sys {
          id
        }
        info
      }
      ... on SpecialisationHomeOverview {
        __typename
        sys {
          id
        }
        overviewType
        title
        subtitle
        descriptionText: description
        specialisationCollection(locale: $locale, limit: 4) {
          items {
            ...specialisation
          }
        }
        teamMemberCollection(locale: $locale, limit: 20) {
          items {
            ...teamMember
          }
        }
        testimonialFeatureCollection(locale: $locale, limit: 4) {
          items {
            ...testimonial
          }
        }
      }
      ... on Info {
        __typename
        sys {
          id
        }
        title
        subtitle
        description {
          json
        }
        image {
          url
        }
      }
      ... on Testimonial {
        __typename
        sys {
          id
        }
        image {
          url
        }
        quote
        name
        profession
      }
      ... on Cta {
        __typename
        sys {
          id
        }
        title
        subtitle
        descriptionText: description
        button {
          ...button
        }
        image {
          url
        }
      }
      ... on TeamMember {
        __typename
        sys {
          id
        }
        name
        role
        descriptionTeampage {
          json
        }
        descriptionHomepage {
          json
        }
        contact {
          json
        }
        linkedInUrl
        emailAddress
        phoneNumber
        website
        location
        quote
        image {
          url
        }
        specialisationTagsCollection(locale: $locale, limit: 3) {
          items {
            ...teammemberTag
          }
        }
      }
      ... on Collaborations {
        __typename
        sys {
          id
        }
        title
        logoCollection(locale: $locale, limit: 6) {
          items {
            url
          }
        }
      }
      ... on AboutComponent {
        __typename
        sys {
          id
        }
        title
        description {
          json
        }
        subtitle
        aboutFeatureCollection(locale: $locale, limit: 4) {
          items {
            ...aboutFeature
          }
        }
      }
      ... on ContactComponent {
        __typename
        sys {
          id
        }
        title
        descriptionText: description
        subtitle
        contactDescription {
          json
        }
        phonenumber
        email
        facebookLink
        instagramLink
        linkedInLink
      }
      ... on Specialisation {
        __typename
        sys {
          id
        }
        image {
          url
        }
        title
        subtitle
        description {
          json
        }
      }
      ... on Text {
        __typename
        sys {
          id
        }
        title
        description {
          json
        }
        subtitle
      }
      ... on AppointmentCardOverview {
        __typename
        sys {
          id
        }
        title
        descriptionText: description
        longDescription {
          json
        }
        alert
        alertDescription
        appointmentCardsCollection(locale: $locale, limit: 4) {
          items {
            ...appointmentCard
          }
        }
      }
      ... on ThankyouComponent {
        __typename
        sys {
          id
        }
        bedanktekst
      }
      # MenuItem zit hier niet in omdat dat meestal via navigatie gaat, maar voor volledigheid:
      ... on MenuItem {
         __typename
         sys {
           id
         }
         title
         externalLink
         internalLink {
           ... on Aboutpage {
             slug
             pageType
             __typename
             sys {
               id
             }
           }
         }
      }
    }
  }
  ${fragmentButton}
  ${fragmentSpecialisation}
  ${fragmentTeamMember}
  ${fragmentTestimonial}
  ${fragmentAboutFeature}
  ${fragmentAppointmentCard}
  ${fragmentTeammemberTag}
`;

export default fragmentComponentList;
