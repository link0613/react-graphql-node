// @flow
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

import AlertDetails from './AlertDetails.component';

export default createFragmentContainer(
  AlertDetails,
  graphql`
    fragment AlertDetails_entity on Alert {
      _id
      __typename
      event_at
      event_id
      event_type
      event_values
      resolution
      source
      agent
      condition
      reported_at
      matched_at
      matched_source_alerts
      url
      host
      _actions
    }`
);
