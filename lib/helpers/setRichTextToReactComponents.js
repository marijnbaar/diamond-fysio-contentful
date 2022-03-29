import { MARKS } from '@contentful/rich-text-types';
import parse from 'html-react-parser';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const options = {
  renderMark: {
    [MARKS.CODE]: (code) => {
      return !code.includes('<script>') ? parse(code) : '';
    }
  }
};

const setRichtTextToReactComponents = (json) => documentToReactComponents(json, options);
export default setRichtTextToReactComponents;
