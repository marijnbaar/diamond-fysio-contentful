const createSlug = (slug, pageType) => {
  //   let slugString = slug ? slug : '';
  //   const slugEnd =
  //     slugString.length > 0 ? `${slugString.charAt(0) == '/' ? '' : '/'}${slugString}` : slugString;
  switch (pageType) {
    case 'Homepage':
      return `/`;
    case 'Teampage':
      return '/team';
    case 'Contactpage':
      return '/contact';
    // case 'Aboutpageheader':
    //   return '/about';
    case 'Pricingpage':
      return '/pricing';
    case 'Houserulespage':
      return '/houserules';
    case 'Teammemberpage':
      return slug;
    default:
      return slug;
  }
};

export default createSlug;
