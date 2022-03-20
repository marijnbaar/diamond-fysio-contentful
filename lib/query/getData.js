import getClient, { errorHandling } from '../contentful';
import getQuery from './getQuery';

const getPage = async (modelId, slug, preview) => {
  try {
    // Get all data of page with correct slug
    const { data } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: {
        slug: slug
      }
    });
    const pageData = data[`${modelId.toLowerCase()}Collection`].items;

    // const navigation = await getNavigation(preview);
    // const footer = await getFooter(preview);
    // const components = await getComponentsData(
    //   pageData[0].components ?? pageData[0].componenten,
    //   preview
    // );
    // data.componentsStart && components.unshift(data.componentsStart);
    // data.componentsEnd && components.push(data.componentsEnd);

    return {
      // navigation,
      ...pageData[0]
      // components,
      // footer,
    };
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getPage(modelId, slug, preview);
    }
  }
};

export { getPage };
