import getClient, { errorHandling } from '../contentful.js';
import getComponentsData from './getters/getComponents';
import getNavigation from './components/navigation';
import getQuery from './getQuery';
import getFooter from './components/footer';
import queryPageTypeBySlug from './pages/pageTypeBySlug';
import { queryHomePageFallback } from './pages/homepage';

const getCollectionItems = ({ data, errors, modelId, slug }) => {
  const collectionKey = `${modelId.toLowerCase()}Collection`;
  const collection = data?.[collectionKey];
  const items = collection?.items;

  if (Array.isArray(items)) return items;

  // With errorPolicy: 'all', Contentful GraphQL can return partial data where
  // the collection (or its items) is missing. Guard so we don't do `.items[0]` on undefined.
  console.warn(
    `[getPage] Missing/invalid collection items for ${modelId} (${collectionKey})` +
      (slug ? ` slug="${slug}"` : '') +
      (errors?.length
        ? `; GraphQL errors: ${errors
            .map((e) => e?.message)
            .filter(Boolean)
            .join(' | ')}`
        : '')
  );

  return [];
};

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
    const { data, errors } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: pageVars,
      errorPolicy: 'all'
    });

    const navigation = await getNavigation(preview, locale);
    const footer = await getFooter(preview, locale);

    if (modelId === 'Homepage') {
      let pageData = getCollectionItems({ data, errors, modelId, slug });
      let target = pageData[0]; // Er is er maar 1 want we filteren op slug

      // If slug-filtered homepage isn't found (common if homepage slug isn't '/'), fall back.
      if (!target) {
        const { data: fallbackData } = await getClient(preview).query({
          query: queryHomePageFallback,
          variables: locale ? { locale } : {},
          errorPolicy: 'all'
        });
        pageData = fallbackData?.homepageCollection?.items || [];
        target = pageData[0];
      }

      if (!target) return { notFound: true };

      const components = target.components?.items
        ? await getComponentsData(target.components.items, preview, locale)
        : [];
      const result = {
        navigation,
        ...target,
        components,
        footer
      };
      return result;
    } else if (modelId === 'Teammemberpage') {
      // Teammemberpage is technisch een Aboutpage
      const pageData = getCollectionItems({ data, errors, modelId: 'Aboutpage', slug });
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
      const pageData = getCollectionItems({ data, errors, modelId, slug });
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

const getComponent = async (query, modelId, id, preview, extraVariables, retryCount = 0) => {
  try {
    const variables = { id, ...(extraVariables || {}) };
    Object.keys(variables).forEach((k) => {
      if (variables[k] == null) delete variables[k];
    });

    const { data, errors } = await getClient(preview).query({
      query,
      variables,
      errorPolicy: 'all'
    });

    if (errors?.length) {
      console.warn(
        `[getComponent] GraphQL returned errors for ${modelId} (${id}): ${errors
          .map((e) => e?.message)
          .filter(Boolean)
          .join(' | ')}`
      );
    }

    const rootKey = data ? Object.keys(data)[0] : null;
    return rootKey ? data[rootKey] : null;
  } catch (error) {
    const errorResult = await errorHandling(error);
    const MAX_RETRIES = 3;

    if (!errorResult) {
      if (retryCount < MAX_RETRIES) {
        console.warn(
          `[getComponent] Retrying ${modelId} (${id}) attempt ${retryCount + 1}/${MAX_RETRIES}`
        );
        return await getComponent(query, modelId, id, preview, extraVariables, retryCount + 1);
      }

      console.warn(
        `[getComponent] Reached max retries (${MAX_RETRIES}) for ${modelId} (${id}). Returning null.`
      );
    }

    return null;
  }
};

export { getPage, getComponent, getPageSlugs, getTypeName };
export { default as getNavigation } from './components/navigation';
export { default as getFooter } from './components/footer';
