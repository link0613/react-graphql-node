import Relay, { graphql } from 'react-relay';

export default graphql`
  query AlertsAllHostsQuery_allAlerts_Query {
    entitiesList: alertsAllHosts(source:"EXD") {
      ...Alerts_entitiesList
    }

    _metadata: __type(name: "Alert") {
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
