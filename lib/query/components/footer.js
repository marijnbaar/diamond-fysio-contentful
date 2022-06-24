import gql from 'graphql-tag';
import getClient from '../../contentful';
import getNavigationSubmenu from './navigatieSubmenu';

const queryFooter = gql`
  query footer {
    footerCollection(limit: 1) {
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
        navigationSubmenuCollection {
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

const getFooter = async (preview) => {
  const {
    data: {
      footerCollection: { items: footer }
    }
  } = await getClient(preview).query({
    query: queryFooter
  });

  return {
    ...footer[0],
    footerSubmenu: await Promise.all(
      footer[0].navigationSubmenuCollection.items.map((menuItem) =>
        getNavigationSubmenu(menuItem, preview)
      )
    )
  };
};

export default getFooter;
