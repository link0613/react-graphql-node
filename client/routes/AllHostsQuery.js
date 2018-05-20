import { graphql } from 'react-relay';

export default graphql`
  query AllHostsQuery_allHosts_Query {
    entitiesList: allHosts {
      ...Hosts_entitiesList
    }

    _metadata: __type(name: "Host") {
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
