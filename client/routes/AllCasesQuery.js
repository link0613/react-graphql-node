import { graphql } from 'react-relay';

export default graphql`
  query AllCasesQuery_allCases_Query {
    entitiesList: CasesList {
      ...Cases_entitiesList
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
