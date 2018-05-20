// @flow
import React from 'react';

import { Table } from 'reactstrap';

import { intersection, without } from 'lodash';
import { titleize, humanize } from 'underscore.string';

export default class InvestigationLogWidget extends React.Component {
  render() {
    const {
      data, parent, title, includeProperties, excludeProperties
    } = this.props;

    if (!data) {
      return null;
    }

    return (
      <div className='timed-activities padded'>
        <div className='timed-activity'>
          <div className='ta-date'>
            <span>11 Apr, 2018</span>
          </div>
          <div className='ta-record-w'>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>11:55</strong> am
              </div>
              <div className='ta-activity'>
                Created an entry in Rogue
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>2:34</strong> pm
              </div>
              <div className='ta-activity'>
                Commented
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>7:12</strong> pm
              </div>
              <div className='ta-activity'>
                Added attachment <a href=''>Screehshot2.jpg</a>
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>9:39</strong> pm
              </div>
              <div className='ta-activity'>
                Started discussion
              </div>
            </div>
          </div>
        </div>
        <div className='timed-activity'>
          <div className='ta-date'>
            <span>10 Apr, 2018</span>
          </div>
          <div className='ta-record-w'>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>9:32</strong> pm
              </div>
              <div className='ta-activity'>
                Added attachment <a href=''>Screehshot1.jpg</a>
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>5:14</strong> pm
              </div>
              <div className='ta-activity'>
                Commented on comment
              </div>
            </div>
          </div>
        </div>
        <div className='timed-activity'>
          <div className='ta-date'>
            <span>9 Apr, 2018</span>
          </div>
          <div className='ta-record-w'>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>11:55</strong> am
              </div>
              <div className='ta-activity'>
                Created a post
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>2:34</strong> pm
              </div>
              <div className='ta-activity'>
                Commented on story
              </div>
            </div>
            <div className='ta-record'>
              <div className='ta-timestamp'>
                <strong>9:39</strong> pm
              </div>
              <div className='ta-activity'>
                Started following updates
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
