// @flow
import React from 'react';

import LayoutBox from 'components/LayoutBox';
import LayoutBoxVertical from 'components/LayoutBoxVertical';

export default class LayoutGrid extends React.Component {
  render() {
    const {
      children, lastExpand, isLoading, className
    } = this.props;

    const rows = this.props.rows || 1;
    const cols = this.props.cols || 1;
    const layoutBoxRows = [];

    for (let y = 0; y < rows; y++) {
      const layoutRow = [];

      for (let x = 0; x < cols; x++) {
        const colFlex = 1 / cols;
        let child = null;

        if (Array.isArray(children) && (children.length > 0)) {
          child = children.filter(item => item && item.props && (item.props.x === x) && (item.props.y === y));
          if (child.length === 1) {
            child = child[0];
          }
        } else if (children) {
          child = ((children.props.x === x) && (children.props.y === y)) ? children : null;
        }

        if (child) {
          layoutRow.push((
            <LayoutBox flex={colFlex} key={`x${x}`}>
              {child}
            </LayoutBox>
          ));
        }
      }

      let rowFlex = (1 / rows);

      if (lastExpand && (y === rows - 1)) {
        rowFlex = 1;
      }

      layoutBoxRows.push((
        <LayoutBox flex={rowFlex} key={`y${y}`}>
          {layoutRow}
        </LayoutBox>
      ));
    }

    return (
      <LayoutBoxVertical flex='1' className={className}>
        {layoutBoxRows}
      </LayoutBoxVertical>
    );
  }
}
