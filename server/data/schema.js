// @flow
/* eslint-disable no-underscore-dangle */
const composeWithRelay = require('graphql-compose-relay').default;
const { SchemaComposer } = require('graphql-compose');

require('../../shared/core/types/json');
require('../../shared/core/types/date');

const hostEntity = require('./entities/host');
const alertEntity = require('./entities/alert');
const indicatorEntity = require('./entities/indicator');
const indicatorCategoryEntity = require('./entities/indicator_category');
const scriptEntity = require('./entities/script');
const caseEntity = require('./entities/case');
const searchEntity = require('./entities/search');
const versionEntity = require('./entities/version');

const GQC = new SchemaComposer();

const RootQuery = GQC.rootQuery();
//const RootSubscription = GQC.rootSubscription();
//const RootMutation = GQC.rootMutation();

composeWithRelay(RootQuery);

RootQuery.addFields({
  alert: alertEntity.get('$findById'),
  alertsAllHosts: alertEntity.get('$findMany'),
  host: hostEntity.get('$findById'),
  allHosts: hostEntity.get('$findMany'),
  indicatorByName: indicatorEntity.get('$findById'),
  IndicatorCategories: indicatorCategoryEntity.get('$findMany'),
  IndicatorCategoryByName: indicatorCategoryEntity.get('$findById'),
  script: scriptEntity.get('$findById'),
  scriptsAllHosts: scriptEntity.get('$findMany'),
  Search: searchEntity.get('$findById'),
  SearchList: searchEntity.get('$findMany'),
  Case: caseEntity.get('$findById'),
  CasesList: caseEntity.get('$findMany'),
  Version: versionEntity.get('$findById'),
});

module.exports = GQC;
