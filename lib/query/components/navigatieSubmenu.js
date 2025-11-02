import gql from 'graphql-tag';
import fragmentMenuItem from '../fragments/menuItem';
import { getComponent } from '../getData';
import { getMenuItems } from './menuItem';

const queryNavigationSubmenu = gql`
  query navigationSubmenu($id: String!, $locale: String) {
    navigatieSubmenu(id: $id, locale: $locale) {
      sys {
        id
      }
      title
      menuItemsCollection(locale: $locale) {
        items {
          ...menuItem
        }
      }
    }
  }

  ${fragmentMenuItem}
`;

const getNavigationSubmenu = async (submenuItem, preview, locale) => {
  const subMenuData = await getComponent(
    queryNavigationSubmenu,
    submenuItem.__typename,
    submenuItem.sys.id,
    preview,
    { locale }
  );

  return {
    ...subMenuData,
    menuItems: await getMenuItems(subMenuData.menuItemsCollection.items, preview, locale)
  };
};

export default getNavigationSubmenu;
