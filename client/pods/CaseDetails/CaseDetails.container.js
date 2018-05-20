// @flow
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';

import CaseDetails from './CaseDetails.component';

export default createFragmentContainer(
  CaseDetails,
  graphql`
    fragment CaseDetails_entity on Case {
      _id
      creator
      reporter
      assignee
      summary
      description
      priority
      status
      resolution
      created_date
      updated_date
      due_date
      resolution_date
      edges
      nodes
      _actions
    }`
);
