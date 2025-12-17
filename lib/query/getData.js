import getClient, { errorHandling } from '../contentful.js';
import getComponentsData from './getters/getComponents';
import getNavigation from './components/navigation';
import getQuery from './getQuery';
import getFooter from './components/footer';
import queryPageTypeBySlug from './pages/pageTypeBySlug';

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

const getTypeName = async (slug, preview, query_deprecated) => {
  try {
    // We gebruiken nu een specifieke query die filtert op slug
    const { data } = await getClient(preview).query({
      query: queryPageTypeBySlug,
      variables: { slug }
    });

    // We krijgen homepageCollection en aboutpageCollection terug.
    // Omdat we filteren op slug, verwachten we max 1 resultaat in totaal (of 0).
    // Echter, 'aboutpageCollection' kan zowel 'Aboutpage' als 'Teammemberpage' zijn.

    const homeItems = data.homepageCollection?.items || [];
    const aboutItems = data.aboutpageCollection?.items || [];
    const all = [...homeItems, ...aboutItems];

    const match = all[0];
    if (!match) return null;

    // Als het een Aboutpage is, check pageType om onderscheid te maken
    if (match.__typename === 'Aboutpage' && match.pageType) {
      // Als pageType is 'Teammemberpage', return 'Teammemberpage'
      if (match.pageType === 'Teammemberpage') {
        return 'Teammemberpage';
      }
      // Anders blijft het gewoon 'Aboutpage'
      return 'Aboutpage';
    }

    const { __typename } = match;
    return __typename || null;
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      return await getTypeName(slug, preview);
    }
    return null;
  }
};

const getPage = async (modelId, slug, preview, locale = 'nl') => {
  try {
    // Get all data of page with correct slug
    const pageVars = { slug };
    if (locale) pageVars['locale'] = locale;

    // We geven nu slug mee aan de query, dus we krijgen direct het juiste item (of niks)
    const { data } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: pageVars,
      errorPolicy: 'all'
    });

    const navigation = await getNavigation(preview, locale);
    const footer = await getFooter(preview, locale);

    if (modelId === 'Homepage') {
      const pageData = await data[`${modelId.toLowerCase()}Collection`].items;
      const target = pageData[0]; // Er is er maar 1 want we filteren op slug

      if (!target) return { notFound: true };

      const components = await getComponentsData(target.components.items, preview, locale);
      const result = {
        navigation,
        ...target,
        components,
        footer
      };
      return result;
    } else if (modelId === 'Teammemberpage') {
      // Teammemberpage is technisch een Aboutpage
      const pageData = await data[`aboutpageCollection`].items;
      // We filteren in de query op slug, dus pageData bevat hopelijk het juiste item.
      // Echter, omdat we ook op pageType moeten checken (voor de zekerheid), doen we dat hier.

      const target = pageData.find((item) => item.pageType === 'Teammemberpage') || pageData[0];

      if (!target || target.pageType !== 'Teammemberpage') {
        return { notFound: true };
      }

      // Extract team member data and render as a component
      const components = [];
      if (target.teamMember) {
        components.push({
          sys: { id: target.teamMember.sys.id },
          __typename: 'TeamMember',
          ...target.teamMember
        });
      }

      // Also include any other components if they exist
      if (target.components && target.components.items) {
        const otherComponents = await getComponentsData(target.components.items, preview, locale);
        components.push(...otherComponents);
      }

      const result = {
        navigation,
        ...target,
        components,
        footer,
        __typename: 'Teammemberpage'
      };
      return result;
    } else {
      // AboutPage
      const pageData = await data[`${modelId.toLowerCase()}Collection`].items;
      const target = pageData[0];

      if (!target) return { notFound: true };

      const components = await getComponentsData(target.components.items, preview, locale);
      const result = {
        navigation,
        ...target,
        components,
        footer
      };
      return result;
    }
  } catch (error) {
    const errorResult = await errorHandling(error);

    if (!errorResult) {
      return await getPage(modelId, slug, preview, locale);
    }
  }
};

// Legacy function, might be removed if unused
const getComponent = async (query, modelId, id, preview, extraVariables) => {
  // Behoud oude logica voor eventuele legacy aanroepen
  try {
    const baseVars = { id: id, ...(extraVariables || {}) };
    Object.keys(baseVars).forEach((k) => {
      if (baseVars[k] == null) delete baseVars[k];
    });
    const { data, errors } = await getClient(preview).query({
      query: query,
      variables: baseVars,
      errorPolicy: 'all'
    });
    // ... rest van legacy logica ...
    return data[Object.keys(data)[0]];
  } catch (error) {
    const errorResult = await errorHandling(error);
    if (!errorResult) return await getComponent(query, modelId, id, preview, extraVariables);
  }
};

export { getPage, getComponent, getPageSlugs, getTypeName };
export { default as getNavigation } from './components/navigation';
export { default as getFooter } from './components/footer';
