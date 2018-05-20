import { graphql } from 'react-relay';

export default graphql`
  query SearchDetailsQuery_searchDetails_Query($searchID: String!) {
    entity: Search(id: $searchID) {
      ...SearchDetails_entity
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
