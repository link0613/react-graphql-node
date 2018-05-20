// @flow
import {
  createFragmentContainer,
  graphql,
} from 'react-relay';
import Alerts from './Alerts.component';

export default createFragmentContainer(Alerts, {
  alerts: graphql`
    fragment Alerts_alerts on Alert {
      id
    }`
});
