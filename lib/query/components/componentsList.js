import gql from 'graphql-tag';

const fragmentComponentList = (model) => gql`
  fragment componentList${model} on ${model}ComponentsCollection {
    items {
      ... on HeaderPricingpage {
        sys {
          id
        }
        __typename
      }
      ... on Highlight {
        sys {
          id
        }
        __typename
      }
      ... on SpecialisationHomeOverview {
        sys {
          id
        }
        __typename
      }
      ... on Info {
        sys {
          id
        }
        __typename
      }
      ... on Testimonial {
        sys {
          id
        }
        __typename
      }
      ... on Cta {
        sys {
          id
        }
        __typename
      }
      ... on TeamMember {
        sys {
          id
        }
        __typename
      }
      ... on Collaborations {
        sys {
          id
        }
        __typename
      }
      ... on AboutComponent {
        sys {
          id
        }
        __typename
      }
      ... on ContactComponent {
        sys {
          id
        }
        __typename
      }
      ... on Specialisation {
        sys { 
          id
        }
        __typename
      }
      ... on Text {
        sys { 
          id
        }
        __typename
      }
      ... on AppointmentCardOverview {
        sys { 
          id
        }
        __typename
      }
      ... on ThankyouComponent {
        sys { 
          id
        }
        __typename
      }
    }
  }
`;

export default fragmentComponentList;
