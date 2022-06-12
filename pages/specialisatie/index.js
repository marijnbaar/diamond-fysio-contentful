import { getPage } from '../lib/query/page';
import ComponentList from '../../components/ComponentList';

const Specialisation = ({ components }) => {
  return (
    <>
      <ComponentList components={components} />
    </>
  );
};

export const getStaticProps = async ({ preview = false }) => {
  const pageData = (await getPage('specialisationpageCollection', undefined, preview)) ?? [];

  return {
    props: {
      ...pageData,
      preview
    }
  };
};

export default Specialisation;
