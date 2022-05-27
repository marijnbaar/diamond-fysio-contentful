import React from 'react';
import Teampage from '../components/Teampage';
import { getPage } from '../lib/query/getData';
import ComponentList from '../components/ComponentList';

const TeamPage = ({ title = '', description = '', components = [] }) => {
  return (
    <>
      <Teampage title={title} description={description} />
      <ComponentList components={components} />
    </>
  );
};

export const getStaticProps = async ({ preview = false }) => {
  const pageData = (await getPage('Teampage', undefined, preview)) ?? [];
  return {
    props: {
      ...pageData,
      preview
    }
  };
};

export default TeamPage;
