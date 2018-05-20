import { graphql } from 'react-relay';

export default graphql`
  query HostQuery_host_Query($hostID: String!) {
    entity: host(id: $hostID) {
      ...HostDetails_entity
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
