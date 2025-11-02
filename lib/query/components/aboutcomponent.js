import gql from 'graphql-tag';
import fragmentAboutFeature from '../fragments/aboutfeature';

const queryAboutcomponent = gql`
  query aboutComponent($id: String!, $locale: String) {
    aboutComponent(id: $id, locale: $locale) {
      sys {
        id
      }
      title
      description {
        json
      }
      subtitle
      aboutFeatureCollection(locale: $locale) {
        items {
          ...aboutFeature
        }
      }
    }
  }
  ${fragmentAboutFeature}
`;

export default queryAboutcomponent;
