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
      ... on Aboutpage {
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
