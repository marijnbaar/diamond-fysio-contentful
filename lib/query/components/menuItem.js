import gql from 'graphql-tag';
import { getComponent } from '../getData';

const queryMenuItem = gql`
  query menuItem($id: String!) {
    menuItem(id: $id) {
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

export const getMenuItems = async (menuItems, preview) =>
  await Promise.all(
    menuItems.map((menuItem) =>
      getComponent(queryMenuItem, menuItem.__typename, menuItem.sys.id, preview)
    )
  );

export default queryMenuItem;
