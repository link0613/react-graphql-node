import React from 'react';

import Route from 'found/lib/Route';
import Redirect from 'found/lib/Redirect';
import makeRouteConfig from 'found/lib/makeRouteConfig';

import AllHostsQuery from './AllHostsQuery';
import AllCasesQuery from './AllCasesQuery';
import AlertsAllHostsQuery from './AlertsAllHostsQuery';
import ScriptsAllHostsQuery from './ScriptsAllHosts';
import HostQuery from './HostQuery';
import CaseQuery from './CaseQuery';
import AlertQuery from './AlertQuery';
import VersionQuery from './VersionQuery';
import SearchDetailsQuery from './SearchDetailsQuery';
import SearchList from './SearchList';
import SearchActiveList from './SearchActiveList';

import AppComponent from 'pods/App/App.component';
import AlertsPod from 'pods/Alerts/Alerts.pod';
import SearchPod from 'pods/Search';
import SearchDetailsPod from 'pods/SearchDetails';
import SearchActivePod from 'pods/SearchActive';
import HostsPod from 'pods/Hosts';
import ScriptsPod from 'pods/Scripts';
import IndicatorsPod from 'pods/Indicators';
import AcquisitionsPod from 'pods/Acquisitions';
import AcquisitionsFilePod from 'pods/AcquisitionsFile';
import HostDetailsContainer from 'pods/HostDetails/HostDetails.container';
import AlertDetailsContainer from 'pods/AlertDetails/AlertDetails.container';
import CasesPod from 'pods/Cases';
import CaseDetailsPod from 'pods/CaseDetails/CaseDetails.container';
import WrapperPodComponent from 'pods/Wrapper';
import DashboardPodComponent from 'pods/Dashboard';
import VersionPodComponent from 'pods/Version';
import NotImplementedPodComponent from 'pods/NotImplemented';
import AsyncRoute from 'components/AsyncRoute/AsyncRoute';

export default makeRouteConfig((
  <Route
    title='Home'
    path='/'
    Component={AppComponent}
  >
    <Route
      title='Hosts'
      path='hosts'
    >
      <AsyncRoute
        Component={HostsPod}
        query={AllHostsQuery}
        prepareVariables={(params) => {
        }}
      />

      <AsyncRoute
        path=':hostID'
        Component={HostDetailsContainer}
        query={HostQuery}
        prepareVariables={params => ({
            hostID: params.hostID
          })}
      />
    </Route>

    <Route
      title='Cases'
      path='cases'
    >
      <AsyncRoute
        Component={CasesPod}
        query={AllCasesQuery}
        prepareVariables={(params) => {
        }}
      />

      <AsyncRoute
        path=':caseID'
        Component={CaseDetailsPod}
        query={CaseQuery}
        prepareVariables={params => ({
          caseID: params.caseID
        })}
      />
    </Route>

    <Route
      title='Alerts'
      path='alerts'
    >
      <AsyncRoute
        Component={AlertsPod}
        query={AlertsAllHostsQuery}
        prepareVariables={(params) => {
        }}
      />

      <AsyncRoute
        path=':alertID'
        Component={AlertDetailsContainer}
        query={AlertQuery}
        prepareVariables={params => ({
          alertID: params.alertID
        })}
      />
    </Route>

    <Route
      title='Enterprise Search'
      path='search'
    >
      <AsyncRoute
        Component={SearchPod}
        query={SearchList}
      />

      <AsyncRoute
        path='active'
        Component={SearchActivePod}
        query={SearchActiveList}
        prepareVariables={params => ({
        })}
      />

      <AsyncRoute
        path=':searchID'
        Component={SearchDetailsPod}
        query={SearchDetailsQuery}
        prepareVariables={params => ({
          searchID: params.searchID
        })}
      />
    </Route>

    <Route
      title='Acquisitions'
      path='acquisitions'
    >
      <AsyncRoute
        Component={AcquisitionsPod}
        query={ScriptsAllHostsQuery}
      />

      <AsyncRoute
        path='file'
        Component={AcquisitionsFilePod}
        query={ScriptsAllHostsQuery}
        prepareVariables={params => ({
          })}
      />
    </Route>

    <Route
      title='Indicators'
      path='indicators'
    >
      <AsyncRoute
        Component={IndicatorsPod}
        query={ScriptsAllHostsQuery}
      />

      <AsyncRoute
        path='fp'
        Component={IndicatorsPod}
        query={ScriptsAllHostsQuery}
      />
    </Route>

    <Route
      title='Version'
      path='version'
    >
      <AsyncRoute
        Component={VersionPodComponent}
        query={VersionQuery}
      />
    </Route>

    <AsyncRoute
      path='scripts'
      Component={ScriptsPod}
      query={ScriptsAllHostsQuery}
    />

    <AsyncRoute
      Component={DashboardPodComponent}
    />

    <Redirect
      from='*'
      to='/'
    />
  </Route>
));
