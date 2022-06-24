import gql from 'graphql-tag';
import fragmentAboutFeature from '../fragments/aboutfeature';

const queryAboutcomponent = gql`
  query aboutComponent($id: String!) {
    aboutComponent(id: $id) {
      sys {
        id
      }
      title
      description {
        json
      }
      subtitle
      aboutFeatureCollection {
        items {
          ...aboutFeature
        }
      }
    }
  }
  ${fragmentAboutFeature}
`;

export default queryAboutcomponent;
