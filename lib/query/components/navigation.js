import gql from 'graphql-tag';
import getClient from '../../contentful.js';
import fragmentButton from '../fragments/button';
import fragmentMenuItem from '../fragments/menuItem';
// import getNavigationSubmenu from './navigatieSubmenu'; // Niet meer nodig
// import { getMenuItems } from './menuItem'; // Niet meer nodig

const queryNavigation = gql`
  query navigation($locale: String) {
    navigatieCollection(limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        logo {
          url
          description
        }
        menuTitel
        menuItemsCollection(locale: $locale, limit: 10) {
          items {
            ...menuItem
          }
        }
        navigatieSubmenusCollection(locale: $locale, limit: 5) {
          items {
            sys {
              id
            }
            __typename
            ... on NavigatieSubmenu {
              title
              menuItemsCollection(locale: $locale, limit: 10) {
                items {
                  ...menuItem
                }
              }
            }
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

const getNavigation = async (preview, locale) => {
  const {
    data: {
      navigatieCollection: { items: navigation }
    }
  } = await getClient(preview).query({
    query: queryNavigation,
    variables: locale ? { locale } : {}
  });

  const navItem = navigation[0];
  if (!navItem) return null;

  // We mappen de data naar de structuur die de frontend verwacht
  const result = {
    ...navItem,
    // menuItems bevat nu al de volledige data dankzij de fragment
    menuItems: navItem.menuItemsCollection?.items || [],

    // navigatieSubmenu bevat nu ook al de volledige data
    navigatieSubmenu: (navItem.navigatieSubmenusCollection?.items || []).map((submenu) => ({
      ...submenu,
      menuItems: submenu.menuItemsCollection?.items || []
    }))
  };

  return result;
};

export default getNavigation;
