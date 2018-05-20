// @flow
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

import HostDetails from './HostDetails.component';

export default createFragmentContainer(
  HostDetails,
  graphql`
    fragment HostDetails_entity on Host {
      _id
      __typename
      hostname
      domain
      timezone
      primary_ip_address
      primary_mac
      agent_version
      excluded_from_containment
      containment_missing_software
      containment_queued
      containment_state
      last_audit_timestamp
      last_poll_timestamp
      last_poll_ip
      os
      stats
      sysinfo
      _actions
    }`
);
