import gql from 'graphql-tag';
import getClient from '../../contentful';
import fragmentButton from '../fragments/button';
import fragmentMenuItem from '../fragments/menuItem';
import getNavigationSubmenu from './navigatieSubmenu';
import { getMenuItems } from './menuItem';

const queryNavigation = gql`
  query navigation {
    navigatieCollection(limit: 1) {
      items {
        sys {
          id
        }
        logo {
          url
          description
        }
        menuTitel
        menuItemsCollection {
          items {
            ...menuItem
          }
        }
        navigatieSubmenusCollection {
          items {
            sys {
              id
            }
            __typename
          }
        }
        knop {
          ...button
        }
      }
    }
  }
  ${fragmentMenuItem}
  ${fragmentButton}
`;

const getNavigation = async (preview) => {
  const {
    data: {
      navigatieCollection: { items: navigation }
    }
  } = await getClient(preview).query({
    query: queryNavigation
  });

  return {
    ...navigation[0],
    menuItems: await getMenuItems(navigation[0].menuItemsCollection.items, preview),
    navigatieSubmenu: await Promise.all(
      navigation[0].navigatieSubmenusCollection.items.map((menuItem) =>
        getNavigationSubmenu(menuItem, preview)
      )
    )
  };
};

export default getNavigation;
