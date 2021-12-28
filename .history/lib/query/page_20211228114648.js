import getClient from '../contentful';
import gql from 'graphql-tag';
// import { getComponents } from './components';
// import { fragmentComponents, fragmentButton, fragmentPageHeader } from './fragments';
// import queryHomePage from './homepage';

const querySlugs = gql`
  {
    pageCollection {
      items {
        slug
      }
    }
  }
`;

const queryPage = gql`
  query ($slug: String) {
    pageCollection(where: { slug: $slug }, limit: 1) {
      items {
        slug
        metaTitle
        metaDescription
        header {
          ...pageHeader
        }
        componentsCollection {
          ...components
        }
      }
    }
  }
`;

// const getPageSlugs = async (preview) => {
//   try {
//     const {
//       data: {
//         pageCollection: { items },
//       },
//     } = await getClient(preview).query({ query: querySlugs });

//     return items.map((item) => `/${item.slug}`);
//   } catch (error) {
//     throw new Error(error.networkError.result.errors[0].message);
//   }
// };

// const getPage = async (slug, preview) => {
//   try {
//     const {
//       data: {
//         pageCollection: { items: pages },
//       },
//     } = await getClient(preview).query({
//       query: slug === 'homepage' ? queryHomePage : queryPage,
//       variables: {
//         slug: slug,
//       },
//     });

//     const {
//       metaTitle,
//       metaDescription,
//       header,
//       componentsCollection: { items: componentItems },
//     } = pages[0];

//     const linkedComponents = await componentItems.filter((componentItem) => componentItem.sys);
//     const components = await getComponents(linkedComponents, preview);

//     return {
//       slug: slug ?? '',
//       metaTitle: metaTitle ?? '',
//       metaDescription: metaDescription ?? '',
//       header: header ?? {},
//       components: components ?? [{}],
//     };
//   } catch (error) {
//     throw error;
//     throw new Error(error.networkError.result.errors[0].message);
//   }
// };

// export { getPageSlugs, getPage };
