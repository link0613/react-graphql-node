// @flow
import React from 'react';

import { Table, Button, Collapse, Card, CardBody, Badge } from 'reactstrap';

import { intersection, without } from 'lodash';
import { titleize, humanize } from 'underscore.string';
import ObjectProperties from 'widgets/ObjectProperties';

import './AlertDetails.scss';

const PREDEFINED_OBJECT_KEYS = [
  '__dataID__',
  '_id',
  '_actions'
];

export default class AlertDetails extends React.Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

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
      <div className='alert-properties'>
        {entity && entity.host && (
          <Card>
            <CardBody>
              <ObjectProperties
                data={entity.host}
                includeProperties={['hostname', 'domain']}
              />
            </CardBody>
            <Collapse isOpen={this.state.collapse}>
              <CardBody>
                <ObjectProperties
                  data={entity.host}
                />
              </CardBody>
            </Collapse>
          </Card>
        )}

        {entity && entity.host && (
          <div className='text-center'>
            <Button color='primary' className='hostinfo-button' onClick={this.toggle}>Host Details</Button>
          </div>
        )}

        {entity && (
          <p>
            {entity.resolution === 'BLOCK' && (
              <Badge color='danger'>BLK</Badge>
            )}

            {entity.resolution === 'PARTIAL_BLOCK' && (
              <Badge color='warning'>PRT</Badge>
            )}

            {entity.source && (
              <Badge color='info'>{entity.source}</Badge>
            )}
          </p>
        )}

        <Table size='sm' hover className='table-properties'>
          {title && (
            <thead>
              <tr>
                <th colSpan='2'>{title} {entity.source}</th>
              </tr>
            </thead>
          )}
          <tbody>
            {rows}
          </tbody>
        </Table>
      </div>
    );
  }
}
