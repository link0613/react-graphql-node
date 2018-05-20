// @flow
import React from 'react';

import { Table } from 'reactstrap';

import { intersection, without } from 'lodash';
import { titleize, humanize } from 'underscore.string';

const PREDEFINED_OBJECT_KEYS = [
  '__dataID__'
];

export default class Tablo extends React.Component {
  render() {
    const {
      data, parent, tabloCols, maxCount, includeProperties, excludeProperties
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

    const rows = keys.map((key, index) => {
      if (entity[key] === null) return null;

      if (typeof entity[key] === 'undefined') return null;
      if (maxCount && (index >= maxCount)) return null;

      const col = Math.round(12 / tabloCols, 0);

      return (
        <div className={`col-sm-${col}`} key={key}>
          <a className='element-box el-tablo centered trend-in-corner padded bold-label'>
            <div className='value'>
              {String(entity[key])}
            </div>

            <div className='label'>
              {titleize(humanize(key))}
            </div>
          </a>
        </div>
      );
    });

    return (
      <div className='tablos'>
        <div className='row mb-xl-2 mb-xxl-3'>
          {rows}
        </div>
      </div>
    );
  }
}
