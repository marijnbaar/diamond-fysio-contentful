import gql from 'graphql-tag';
import { getComponent } from '../getData';

const fragmentMenuItem = gql`
  fragment menuItem on MenuItem {
    sys {
      id
    }
    title
    externalLink
    internalLink {
      ... on Specialisationpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Teampage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Contactpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Pricingpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Aboutpage {
        slug
        __typename
        sys {
          id
        }
      }
      ... on Houserulespage {
        slug
        __typename
        sys {
          id
        }
      }
    }
  }
`;

export const getMenuItems = async (menuItems, preview) =>
  await Promise.all(
    menuItems.map((menuItem) =>
      getComponent(fragmentMenuItem, menuItem.__typename, menuItem.sys.id, preview)
    )
  );

export default fragmentMenuItem;
