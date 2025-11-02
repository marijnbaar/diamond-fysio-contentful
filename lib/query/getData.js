import getClient, { errorHandling } from '../contentful';
import getComponentsData from './getters/getComponents';
import getNavigation from './components/navigation';
import getQuery from './getQuery';
import getFooter from './components/footer';

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
    const all = mapResult(data);
    const match = all.find((item) => item.slug === slug);
    if (!match) return null;
    const { __typename } = match;
    return __typename || null;
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getTypeName(slug, preview);
    }
  }
};

const getPage = async (modelId, slug, preview, locale = 'nl') => {
  try {
    // Get all data of page with correct slug
    const pageVars = {};
    if (locale) pageVars['locale'] = locale;
    const { data } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: pageVars
    });
    const navigation = await getNavigation(preview, locale);
    const footer = await getFooter(preview, locale);

    if (modelId === 'Homepage') {
      const pageData = await data[`${modelId.toLowerCase()}Collection`].items;
      const components = await getComponentsData(pageData[0].components.items, preview, locale);
      return {
        navigation,
        ...pageData[0],
        components,
        footer
      };
    } else {
      const page = await data[`${modelId.toLowerCase()}Collection`].items;

      let target = null;
      if (locale) {
        // Resolve entry id using default locale (no locale param) so slug matching is stable
        const { data: baseData } = await getClient(preview).query({
          query: getQuery(modelId)
        });
        const baseItems = baseData[`${modelId.toLowerCase()}Collection`].items || [];
        const baseMatch = baseItems.find((it) => it.slug === slug);
        const targetId = baseMatch?.sys?.id;
        if (targetId) {
          target = page.find((it) => it?.sys?.id === targetId) || null;
        }
      }
      // Fallback: localized slug match when id was not resolved
      if (!target) {
        target = page.find((item) => item.slug === slug) || page[0];
      }

      const components = await getComponentsData(target.components.items, preview, locale);
      return {
        navigation,
        ...target,
        components,
        footer
      };
    }

    // const footer = await getFooter(preview);
    // return {
    //   // navigation,
    //   ...pageData[0]
    //   // components
    //   // footer,
    // };
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getPage(modelId, slug, preview);
    }
  }
};

const getComponent = async (query, modelId, id, preview, extraVariables) => {
  try {
    const baseVars = { id: id, ...(extraVariables || {}) };
    Object.keys(baseVars).forEach((k) => {
      // drop undefined/null variables to avoid passing invalid locales
      if (baseVars[k] == null) delete baseVars[k];
    });
    const { data } = await getClient(preview).query({
      query: query,
      variables: baseVars
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
