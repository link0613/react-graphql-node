import { graphql } from 'react-relay';

export default graphql`
  query SearchList_searchList_Query {
    entitiesList: SearchList {
      ...Search_entitiesList
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
