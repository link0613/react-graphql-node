import { graphql } from 'react-relay';

export default graphql`
  query VersionQuery_version_Query {
    entity: Version {
      ...Version_entity
    }

    _metadata: __type(name: "Version") {
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
