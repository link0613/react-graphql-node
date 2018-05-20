import { graphql } from 'react-relay';

export default graphql`
  query AlertQuery_alert_Query($alertID: String!) {
    entity: alert(id: $alertID) {
      ...AlertDetails_entity
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
