import Header from './Header';

const ComponentList = ({ components }) =>
  components.map((component) => {
    if (component.sys.id) {
      switch (component.__typename) {
        case 'HeaderHomepage': {
          return <Header key={component.sys.id} id={component.sys.id} {...component} />;
        }
      }
    }
  });

export default ComponentList;
