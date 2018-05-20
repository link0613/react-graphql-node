/* @flow */

import React from 'react';
import { default as ReactLoading } from 'react-loading';

export default function Loading() {
  return (
    <div>
      Loading...
      <ReactLoading
        type='cylon'
        color='#3385b5'
      />
    </div>
  );
}
