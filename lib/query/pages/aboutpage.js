import gql from 'graphql-tag';
import fragmentComponentList from '../components/componentsList';
import { fragmentTeamMember } from '../fragments/teamMember';

const queryAboutPage = gql`
  query aboutpageCollectionQuery($slug: String, $locale: String) {
    aboutpageCollection(where: { slug: $slug }, limit: 1, locale: $locale) {
      items {
        sys {
          id
        }
        slug
        title
        pageType
        teamMember {
          ...teamMember
        }
        components: componentsCollection(locale: $locale, limit: 15) {
          ...componentListAboutpage
        }
      }
    }
  }
  ${fragmentComponentList('Aboutpage')}
  ${fragmentTeamMember}
`;

export default queryAboutPage;
