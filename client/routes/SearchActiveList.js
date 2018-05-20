import { graphql } from 'react-relay';

export default graphql`
  query SearchActiveList_searchActiveList_Query {
    entitiesList: SearchList {
      ...SearchActive_entitiesList
    }

    _metadata: __type(name: "Search") {
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
