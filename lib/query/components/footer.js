import gql from 'graphql-tag';
import getClient from '../../contentful.js';
import fragmentMenuItem from '../fragments/menuItem';

const queryFooter = gql`
  query footer($locale: String) {
    footerCollection(limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        logo {
          url
          description
        }
        title
        description
        socialTitle
        facebookLink
        instagramLink
        linkedInLink
        navigationSubmenuCollection(locale: $locale, limit: 5) {
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
      }
    }
  }
  ${fragmentMenuItem}
`;

const getFooter = async (preview, locale) => {
  const {
    data: {
      footerCollection: { items: footer }
    }
  } = await getClient(preview).query({
    query: queryFooter,
    variables: locale ? { locale } : {}
  });

  const footerItem = footer[0];
  if (!footerItem) return null;

  return {
    ...footerItem,
    footerSubmenu: (footerItem.navigationSubmenuCollection?.items || []).map((submenu) => ({
      ...submenu,
      menuItems: submenu.menuItemsCollection?.items || []
    }))
  };
};

export default getFooter;
