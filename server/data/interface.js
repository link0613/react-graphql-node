const graphQLRelay = require('graphql-relay');

const {
  fromGlobalId,
  nodeDefinitions
} = graphQLRelay;

/**
 * We get the node interface and field from the Relay library.
 *
 * The first method defines the way we resolve an ID to its object.
 * The second defines the way we resolve an object to its GraphQL type.
 */
module.exports = nodeDefinitions(
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);

    switch (type) {
      case 'Alert':
        return HXAlertLoader.load(id);

      case 'Host':
        return HXHostLoader.load(id);

      case 'HostList':
        return fetchAllHosts();

      case 'AlertList':
        return null;// fetchAlertsAllHosts();

      default:
        return null;
    }
  },

  (obj) => {
    if (obj instanceof User) {
      return userType;
    } else if (obj instanceof Feature) {
      return featureType;
    } else if (obj instanceof HXAlert) {
      return alertType;
    } else if (obj instanceof HXHost) {
      return hostType;
    }

    return null;
  }
);
