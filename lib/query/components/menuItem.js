import gql from 'graphql-tag';
import { getComponent } from '../getData';

const queryMenuItem = gql`
  query menuItem($id: String!, $locale: String) {
    menuItem(id: $id, locale: $locale) {
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
`;

export const getMenuItems = async (menuItems, preview, locale) =>
  await Promise.all(
    menuItems.map((menuItem) =>
      getComponent(queryMenuItem, menuItem.__typename, menuItem.sys.id, preview, { locale })
    )
  );

export default queryMenuItem;
