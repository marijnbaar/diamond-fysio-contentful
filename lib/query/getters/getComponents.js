const getComponentsData = async (components, preview, locale) => {
  // Omdat we GraphQL Fragments gebruiken in de main query,
  // bevat 'components' nu al de volledige data voor elk component.
  // We hoeven dus geen extra API calls meer te doen per component.

  if (!components) return [];

  const result = components
    .filter((component) => {
      // Filter null/undefined components
      if (!component) return false;
      // Filter components zonder ID
      if (!component.sys || !component.sys.id) return false;

      // Log waarschuwing voor unresolved images (behouden van oude logica)
      if (component.image === null && component.__typename === 'Specialisation') {
        console.warn(`⚠️  Specialisation ${component.sys?.id} has unresolved image asset`);
      }
      return true;
    })
    .map((component) => {
      // Hier kunnen we eventueel nog transformaties doen als dat nodig is,
      // maar voor nu geven we het object gewoon door.
      return component;
    });

  return result;
};

export default getComponentsData;
