import gql from 'graphql-tag';
import fragmentMenuItem from '../fragments/menuItem';
import { getComponent } from '../getData';
import { getMenuItems } from './menuItem';

const queryNavigationSubmenu = gql`
  query navigationSubmenu($id: String!) {
    navigatieSubmenu(id: $id) {
      sys {
        id
      }
      title
      menuItemsCollection {
        items {
          ...menuItem
        }
      }
    }
  }

  ${fragmentMenuItem}
`;

const getNavigationSubmenu = async (submenuItem, preview) => {
  const subMenuData = await getComponent(
    queryNavigationSubmenu,
    submenuItem.__typename,
    submenuItem.sys.id,
    preview
  );

  return {
    ...subMenuData,
    menuItems: await getMenuItems(subMenuData.menuItemsCollection.items, preview)
  };
};

export default getNavigationSubmenu;
