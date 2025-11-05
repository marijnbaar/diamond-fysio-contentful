import gql from 'graphql-tag';
import getClient from '../../contentful.js';
import getNavigationSubmenu from './navigatieSubmenu';

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
        navigationSubmenuCollection(locale: $locale) {
          items {
            sys {
              id
            }
            __typename
          }
        }
      }
    }
  }
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

  return {
    ...footer[0],
    footerSubmenu: await Promise.all(
      footer[0].navigationSubmenuCollection.items.map((menuItem) =>
        getNavigationSubmenu(menuItem, preview, locale)
      )
    )
  };
};

export default getFooter;
