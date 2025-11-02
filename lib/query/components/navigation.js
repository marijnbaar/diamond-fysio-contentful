import gql from 'graphql-tag';
import getClient from '../../contentful';
import fragmentButton from '../fragments/button';
import fragmentMenuItem from '../fragments/menuItem';
import getNavigationSubmenu from './navigatieSubmenu';
import { getMenuItems } from './menuItem';

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
        menuItemsCollection(locale: $locale) {
          items {
            ...menuItem
          }
        }
        navigatieSubmenusCollection(locale: $locale) {
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

const getNavigation = async (preview, locale) => {
  const {
    data: {
      navigatieCollection: { items: navigation }
    }
  } = await getClient(preview).query({
    query: queryNavigation,
    variables: locale ? { locale } : {}
  });

  return {
    ...navigation[0],
    menuItems: await getMenuItems(navigation[0].menuItemsCollection.items, preview, locale),
    navigatieSubmenu: await Promise.all(
      navigation[0].navigatieSubmenusCollection.items.map((menuItem) =>
        getNavigationSubmenu(menuItem, preview, locale)
      )
    )
  };
};

export default getNavigation;
