import getClient, { errorHandling } from '../contentful.js';
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
      return await getTypeName(slug, preview, query);
    }
    // Return null if error handling failed, so 404 is shown
    return null;
  }
};

const getPage = async (modelId, slug, preview, locale = 'nl') => {
  try {
    // Get all data of page with correct slug
    const pageVars = {};
    if (locale) pageVars['locale'] = locale;
    const { data } = await getClient(preview).query({
      query: getQuery(modelId),
      variables: pageVars,
      errorPolicy: 'all' // Continue even if some fields fail (like missing teamMember field)
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
    } else if (modelId === 'Teammemberpage') {
      // Teammemberpage is een Aboutpage met pageType 'Teammemberpage'
      // We gebruiken aboutpageCollection maar filteren op pageType
      const page = await data[`aboutpageCollection`].items;

      let target = null;
      if (locale) {
        // Resolve entry id using default locale (no locale param) so slug matching is stable
        const { data: baseData } = await getClient(preview).query({
          query: getQuery(modelId)
        });
        const baseItems = baseData[`aboutpageCollection`].items || [];
        // Filter op pageType om alleen Teammemberpage entries te krijgen
        const baseMatch = baseItems.find(
          (it) => it.slug === slug && it.pageType === 'Teammemberpage'
        );
        const targetId = baseMatch?.sys?.id;
        if (targetId) {
          target =
            page.find((it) => it?.sys?.id === targetId && it.pageType === 'Teammemberpage') || null;
        }
      }
      // Fallback: localized slug match when id was not resolved
      if (!target) {
        target =
          page.find((item) => item.slug === slug && item.pageType === 'Teammemberpage') || null;
      }

      if (!target || !target.teamMember || target.pageType !== 'Teammemberpage') {
        return {
          notFound: true
        };
      }

      // For team member pages, we render the team member component directly
      // Extract team member data and render as a component
      const components = [];
      if (target.teamMember) {
        // Add team member as a TeamMember component
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

      return {
        navigation,
        ...target,
        components,
        footer,
        __typename: 'Teammemberpage'
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
    const { data, errors } = await getClient(preview).query({
      query: query,
      variables: baseVars,
      errorPolicy: 'all' // Continue even if some fields fail (like missing assets)
    });

    // Check for specific asset resolution errors
    if (errors && errors.length > 0) {
      const assetErrors = errors.filter(
        (err) =>
          err.message?.includes('cannot be resolved') || err.message?.includes('Link from entry')
      );
      if (assetErrors.length > 0) {
        console.warn(
          `⚠️  Asset resolution errors for ${modelId} ${id}:`,
          assetErrors.map((e) => e.message)
        );
      }
    }
    let result = data[Object.keys(data)[0]];

    // If image field failed to resolve due to asset error, create new object with null image
    if (
      result &&
      errors &&
      errors.some(
        (err) =>
          err.path?.some((p) => p === 'image') ||
          (err.message?.includes('cannot be resolved') && err.message?.includes('image')) ||
          (err.message?.includes('Link from entry') && err.message?.includes('image'))
      )
    ) {
      // Create a new object instead of modifying the sealed/frozen object from Apollo
      // Deep clone to avoid modifying sealed objects
      try {
        result = JSON.parse(JSON.stringify(result));
        result.image = null;
        console.warn(`⚠️  Image asset cannot be resolved for ${modelId} ${id}, setting to null`);
      } catch {
        // Fallback: create new object with spread (shallow copy)
        const { image, ...rest } = result;
        result = { ...rest, image: null };
        console.warn(
          `⚠️  Image asset cannot be resolved for ${modelId} ${id}, setting to null (shallow copy)`
        );
      }
    }

    return result;
  } catch (error) {
    // Check if error is about unresolved asset links
    const errorMessage = error?.message || error?.networkError?.result?.errors?.[0]?.message || '';
    if (errorMessage.includes('cannot be resolved') || errorMessage.includes('Link from entry')) {
      console.warn(`⚠️  Asset link cannot be resolved for ${modelId} ${id}: ${errorMessage}`);
      // Return the component with null image instead of failing
      const baseVars = { id: id, ...(extraVariables || {}) };
      Object.keys(baseVars).forEach((k) => {
        if (baseVars[k] == null) delete baseVars[k];
      });
      try {
        // Try to fetch without the image field
        const { data } = await getClient(preview).query({
          query: query,
          variables: baseVars,
          errorPolicy: 'ignore'
        });
        const result = data[Object.keys(data)[0]];
        if (result) {
          result.image = null; // Explicitly set image to null
          return result;
        }
      } catch (retryError) {
        // If even that fails, return null to skip this component
        console.error(`❌ Failed to fetch ${modelId} ${id} after asset error:`, retryError);
        return null;
      }
    }

    const errorResult = await errorHandling(error);

    if (!errorResult) {
      await getComponent(query, modelId, id, preview);
    }
  }
};

export { getPage, getComponent, getPageSlugs, getTypeName };
export { default as getNavigation } from './components/navigation';
export { default as getFooter } from './components/footer';
