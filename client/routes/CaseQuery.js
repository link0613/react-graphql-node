import { graphql } from 'react-relay';

export default graphql`
  query CaseQuery_case_Query($caseID: String!) {
    entity: Case(id: $caseID) {
      ...CaseDetails_entity
    }

    _metadata: __type(name: "Case") {
      name
      kind

      fields {
        name
        description
        type {
          name
          kind
        }
        isDeprecated
      }
    }
  }
`;
