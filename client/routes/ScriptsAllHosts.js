import { graphql } from 'react-relay';

export default graphql`
  query ScriptsAllHosts_scriptsAllHosts_Query {
    entitiesList: scriptsAllHosts {
      ...Scripts_entitiesList
    }

    _metadata: __type(name: "Script") {
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
