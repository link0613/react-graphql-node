// @flow
import React from 'react';

import { Table } from 'reactstrap';

import { intersection, without } from 'lodash';
import { titleize, humanize } from 'underscore.string';

import './ObjectProperties.scss';

const PREDEFINED_OBJECT_KEYS = [
  '__dataID__',
  '_id',
  '_actions'
];

export default class ObjectProperties extends React.Component {
  render() {
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

    let rows = [];

    rows = keys.map((key) => {
      if (entity[key] === null) return null;
      if (typeof entity[key] === 'undefined') return null;

      if (Array.isArray(entity[key])) {
        return (
          <tr key={key} className='inner'>
            <td colSpan={2}>
              <ObjectProperties
                data={entity[key]}
              />
            </td>
          </tr>
        );
      }

      if (typeof entity[key] === 'object') {
        return (
          <tr key={key} className='inner'>
            <td colSpan={2}>
              <div className='table-properties-section'>{titleize(humanize(key))}</div>

              <ObjectProperties
                data={entity[key]}
              />
            </td>
          </tr>
        );
      }

      return (
        <tr key={key}>
          <th>{titleize(humanize(key))}</th>
          <td>{String(entity[key])}</td>
        </tr>
      );
    });

    return (
      <Table size='sm' hover className='table-properties'>
        {title && (
          <thead>
            <tr>
              <th colSpan='2'>{title}</th>
            </tr>
          </thead>
        )}
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  }
}
