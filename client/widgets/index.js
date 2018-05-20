// @flow

import WidgetsRegistry from 'services/WidgetsRegistry';

import DataGrid from 'widgets/DataGrid';
import ObjectProperties from 'widgets/ObjectProperties';
import AlertDetails from 'widgets/AlertDetails';
import ObjectPropertiesNative from 'widgets/ObjectPropertiesNative';
import Tablo from 'widgets/Tablo';

import InvestigationGraphWidget from 'widgets/InvestigationGraph';
import InvestigationTimelineWidget from 'widgets/InvestigationTimeline';
import InvestigationLogWidget from 'widgets/InvestigationLog';

export default function initWidgets() {
  WidgetsRegistry.add('internal', 'data-grid', DataGrid);
  WidgetsRegistry.add('internal', 'object-properties', ObjectProperties);
  WidgetsRegistry.add('internal', 'tablo', Tablo);

  WidgetsRegistry.add('internal', 'alert-details', AlertDetails);

  WidgetsRegistry.add('internal', 'investigation-graph', InvestigationGraphWidget);
  WidgetsRegistry.add('internal', 'investigation-timeline', InvestigationTimelineWidget);
  WidgetsRegistry.add('internal', 'investigation-log', InvestigationLogWidget);

  WidgetsRegistry.add('external', 'object-properties', ObjectPropertiesNative);
}
