// import { getPage } from '../lib/query/page';
import { getPage } from '../../lib/query/getData';
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
