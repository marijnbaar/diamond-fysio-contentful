const createSlug = (slug, type) => {
  //   let slugString = slug ? slug : '';
  //   const slugEnd =
  //     slugString.length > 0 ? `${slugString.charAt(0) == '/' ? '' : '/'}${slugString}` : slugString;
  switch (type) {
    case 'Homepage':
      return `/`;
    case 'Teampage':
      return '/team';
    default:
      return slug;
  }
};

export default createSlug;
