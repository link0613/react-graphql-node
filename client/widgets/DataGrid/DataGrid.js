// @flow
import React from 'react';

import { AgGridReact } from 'ag-grid-react';
import _ from 'lodash';
import { titleize, humanize } from 'underscore.string';
import LayoutBox from 'components/LayoutBox';

import Rxmq from 'rxmq';

import './DataGrid.scss';

import { Link } from 'found';

class LinkCellRenderer extends React.Component {
  render() {
    return (
      <Link to={`/${this.props.entityRoute}/${this.props.data._id}`}>
        {this.props.value}
      </Link>
    );
  }
}

const EXCLUDE_FIELDS = [
  '__dataID__',
  'id',
  '_id',
  '_actions'
];

const DEFAULT_ROW_HEIGHT = 35;
const DEFAULT_HEADER_HEIGHT = 0;

export default class DataGrid extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedLength: 0,
      selectedRows: []
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;

    this.gridApi.sizeColumnsToFit();

    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.gridApi) {
          this.gridApi.sizeColumnsToFit();
        }
      });
    });
  }

  flatten = (obj) => {
    if (_.isObject(obj)) {
      const keys = _.keys(obj);
      const result = {};

      _.each(keys, (key) => {
        const val = obj[key];

        if (_.isObject(val)) {
          if (this.props.includeFields && Array.isArray(this.props.includeFields) && this.props.includeFields.indexOf(key) >= 0) {
            result[key] = val;
          }
          // result = _.extend(result, this.flatten(val));
        } else {
          result[key] = val;
        }
      });

      return result;
    }
    return obj;
  }

  getColumnDefs = () => {
    const { metadata, router, cellRender, detailedFields } = this.props;
    const excludeFields = Array.isArray(this.props.excludeFields) ? this.props.excludeFields : EXCLUDE_FIELDS;

    if (this.props.data && this.props.data.length) {
      const node = this.flatten(this.props.data[0]);

      const keys = Object.keys(node).filter(key => excludeFields.indexOf(key) < 0).filter(key => !(detailedFields && detailedFields.indexOf(key) >= 0)).map((key) => {
        const fieldDef = {
          field: key,
          headerName: titleize(humanize(key))
        };

        if (
          (typeof cellRender !== 'undefined') &&
          (typeof cellRender[key] === 'function')
        ) {
          fieldDef.cellRenderer = cellRender[key];
        }

        return fieldDef;
      });

      if (keys.length) {
        // keys[0].cellRendererFramework = LinkCellRenderer;

        keys.unshift({
          headerName: '',
          width: 30,
          checkboxSelection: true,
          suppressSorting: true,
          suppressMenu: true,
          pinned: true
        });
      }

      return keys;
    }

    if (metadata) {
    }

    return [];
  }

  getRowData = () => {
    return this.props.data;
    //return [];
  }

  onSelectionChanged = () => {
    const selectedRows = this.gridApi.getSelectedRows();
    this.setState({
      selectedLength: selectedRows.length,
      selectedRows
    });

    Rxmq.channel('data.grid').subject('selection').next({
      length: selectedRows.length,
      selection: selectedRows.map(item => item._id)
    });
  }

  onRowDoubleClicked = (row) => {
    if (row.data && row.data._id) {
      const { router, metadata } = this.props;

      if (metadata.name === 'Host') {
        router.push(`/hosts/${row.data._id}`);
      }

      if (metadata.name === 'Alert') {
        router.push(`/alerts/${row.data._id}`);
      }

      if (metadata.name === 'Case') {
        router.push(`/cases/${row.data._id}`);
      }

      if (metadata.name === 'Search') {
        router.push(`/search/${row.data._id}`);
      }
    }
  }

  changeAction = (ev) => {
    this.setState({
      currentAction: ev.currentTarget.value
    });
  }

  handleActionClick = (ev) => {
    const { selectedLength, selectedRows } = this.state;

    ev.preventDefault();

    if (this.state && this.state.currentAction && selectedLength) {
      const row = selectedRows[0];

      if (row && row._actions) {
        const filteredActions = row._actions.filter(r => r.key === this.state.currentAction)[0];

        if (filteredActions.params) {
          Rxmq.channel('invoke.action').subject('configure').next({
            action: filteredActions,
            context: row._id
          });
        } else {
          Rxmq.channel('invoke.action').subject('start').next({
            action: filteredActions,
            context: row._id
          });
        }
      }
    }
  }

  isRowHeightOverriden() {
    const { rowHeight } = this.props;
    return (typeof rowHeight !== 'undefined') && rowHeight;
  }

  isHeaderHeightOverriden() {
    const { headerHeight } = this.props;
    return (typeof headerHeight !== 'undefined') && headerHeight;
  }

  render() {
    const { selectedLength, selectedRows } = this.state;

    const rowHeight = this.isRowHeightOverriden() ? this.props.rowHeight : DEFAULT_ROW_HEIGHT;
    const headerHeight = this.isHeaderHeightOverriden() ? this.props.headerHeight : DEFAULT_HEADER_HEIGHT;

    let actions = [];
    let groups = [];

    if (selectedRows && selectedRows.length) {
      actions = selectedRows[0]._actions;
      groups = _.uniqBy(actions, 'groupName');
    }

    const rowData = this.getRowData();

    return (
      <LayoutBox
        fit='true'
        column='true'
      >
        <div className='controls-above-table'>
          <div className='control-header'>
            <div className='row'>
              <div className='col-sm-9'>
                <form className='form-inline'>
                  {(actions.length > 0) && (
                    <div className='form-group mr-4'>
                      <label className='mr-2'>Action</label>
                      <select
                        className='form-control form-control-sm'
                        onChange={this.changeAction}
                        disabled={selectedRows.length < 1}
                      >
                        <option> Actions</option>
                        {groups.map((group, index) => (
                          <optgroup label={group.groupName} key={index}>
                            {actions.filter(action => action.groupName === group.groupName).map((action, actionIndex) => (
                              <option value={action.key} disabled={!!action.disabled} key={actionIndex}> {action.title}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>

                      <button
                        className='btn btn-sm btn-secondary'
                        type='button'
                        disabled={selectedRows.length < 1}
                        onClick={this.handleActionClick}
                      >
                        Go
                      </button>
                    </div>
                  )}

                  <div className='form-group mr-4'>
                    <span className='form-static form-control-sm'>
                      {selectedLength} items selected
                    </span>

                    {(rowData.length > 0) && (
                      <span>
                        <a className='btn btn-sm btn-link' href=''>Select All</a>
                        {(selectedLength > 0) && (
                          <a className='btn btn-sm btn-link' href=''>Inverse Selection</a>
                        )}
                      </span>
                    )}
                  </div>
                </form>
              </div>

              <div className='col-sm-3'>
                  <div className='justify-content-sm-end' style={{ textAlign: 'right' }}>
                    <a className='btn btn-sm btn-link' href=''>Refresh Data</a>
                    <a className='btn btn-sm btn-link' href=''>Download CSV</a>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <LayoutBox flex={1} className='ag-theme-bootstrap'>
          <div className={`datagrid-container ${this.isRowHeightOverriden() ? 'datagrid-no-fixed-lineheight' : ''}`}>
            <AgGridReact
              columnDefs={this.getColumnDefs()}

              rowData={rowData}

              onGridReady={this.onGridReady}

              onSelectionChanged={this.onSelectionChanged}
              onRowDoubleClicked={this.onRowDoubleClicked}

              deltaRowDataMode

              animateRows
              pagination
              rowSelection='multiple'
              rowHeight={rowHeight}
              headerHeight={headerHeight}
              floatingFiltersHeight={50}
              paginationPageSize={50}

              suppressCellSelection

              enableColResize
              enableSorting
              enableFilter
            />
          </div>
        </LayoutBox>
      </LayoutBox>
    );
  }
}
