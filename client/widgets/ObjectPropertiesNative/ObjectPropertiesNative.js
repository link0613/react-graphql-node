import { intersection, without } from 'lodash';
import { titleize, humanize } from 'underscore.string';

const PREDEFINED_OBJECT_KEYS = [
  '__dataID__'
];

function ObjectPropertiesNative() {
  this.widgetCreate = (props) => {
    this.element = null;
    this.props = props;
  };

  this.widgetWillMount = () => {
  };

  this.widgetWillUnmount = () => {
  };

  this.widgetDidMount = (element) => {
  };

  this.widgetWillUpdate = (nextProps) => {
  };

  this.widgetDidUpdate = (prevProps) => {
  };

  this.widgetWillUnmount = () => {
  };

  this.render = () => {
    const {
      data, parent, title, includeProperties, excludeProperties
    } = this.props;

    if (!data) {
      return null;
    }

    let entity = data;
    if (parent && data[parent]) {
      entity = data[parent];
    }

    let keys = [];
    if (data) {
      keys = Object.keys(entity).filter(key => (PREDEFINED_OBJECT_KEYS.indexOf(key) < 0));
    }

    if (includeProperties && Array.isArray(includeProperties) && (includeProperties.length > 0)) {
      keys = intersection(keys, includeProperties);
    }

    if (excludeProperties && Array.isArray(excludeProperties) && (excludeProperties.length > 0)) {
      keys = without(keys, ...excludeProperties);
    }

    const rows = keys.map((key) => {
      if (entity[key] === null) return '';
      if (typeof entity[key] === 'undefined') return '';

      if (typeof entity[key] === 'object') {
        return `
          <tr>
            <td colspan="2">
              ${titleize(humanize(key))}
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <th width='35%'>${titleize(humanize(key))}</th>
          <td>${String(entity[key])}</td>
        </tr>
      `;
    });

    this.element.innerHTML = `
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th colspan="2">${title}</th>
          </tr>
        </thead>

        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
    `;
  };
}

export default ObjectPropertiesNative;
