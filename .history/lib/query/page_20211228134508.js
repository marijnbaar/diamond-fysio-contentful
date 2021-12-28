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
