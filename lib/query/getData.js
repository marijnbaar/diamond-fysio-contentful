import getClient, { errorHandling } from '../contentful';
import getComponentsData from './getters/getComponents';
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
    const components = await getComponentsData(pageData[0].components.items, preview);
    // data.componentsStart && components.unshift(data.componentsStart);
    // data.componentsEnd && components.push(data.componentsEnd);
    console.log(pageData[0].components.items);
    return {
      // navigation,
      ...pageData[0],
      components
      // footer,
    };
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getPage(modelId, slug, preview);
    }
  }
};

const getComponent = async (query, modelId, id, preview) => {
  try {
    const { data } = await getClient(preview).query({
      query: query,
      variables: {
        id: id
      }
    });
    console.log('test data', data);
    // console.log(modelId);
    return data[Object.keys(data)[0]];
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getComponent(query, modelId, id, preview);
    }
  }
};

export { getPage, getComponent };
