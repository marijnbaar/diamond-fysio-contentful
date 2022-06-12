import getClient, { errorHandling } from '../contentful';
import getComponentsData from './getters/getComponents';
import getQuery from './getQuery';

const mapResult = (data) =>
  Object.entries(data)
    .flat()
    .filter((item) => typeof item === 'object')
    .filter((item) => item?.items)
    .map((item) => item.items)
    .flat();

const getPageSlugs = async (query, startSlug = '', preview) => {
  try {
    const { data } = await getClient(preview).query({ query: query });
    let slugs = mapResult(data)
      .filter((item) => item.slug && item.slug !== '/')
      .map((item) => `${startSlug}${item.slug}`);
    return slugs;
  } catch (error) {
    throw new Error(error.networkError.result.errors[0].message);
  }
};

const getTypeName = async (slug, preview, query) => {
  try {
    // Get the slug and modelname of all pages
    const { data } = await getClient(preview).query({
      query: query
    });
    // Get fieldname of the item with correct slug
    const { __typename } = mapResult(data).find((item) => item.slug === slug);
    return __typename;
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getTypeName(slug, preview);
    }
  }
};

const getPage = async (modelId, slug, preview) => {
  try {
    // Get all data of page with correct slug
    const { data } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: {
        slug: slug
      }
    });
    const page = data[`${modelId.toLowerCase()}Collection`].items;
    const pageData = page.find((item) => item.slug === slug);

    // const navigation = await getNavigation(preview);
    // const footer = await getFooter(preview);
    const components = await getComponentsData(pageData.components.items, preview);
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
    return data[Object.keys(data)[0]];
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getComponent(query, modelId, id, preview);
    }
  }
};

export { getPage, getComponent, getPageSlugs, getTypeName };
