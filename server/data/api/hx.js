// @flow
const DataLoader = require('dataloader');
const fetch = require('node-fetch');
const Base64 = require('js-base64').Base64;
const { GraphQLError } = require('graphql');

const BASE_URL = 'http://ec2-34-218-190-86.us-west-2.compute.amazonaws.com:3003/hx/api/v3';

const API_CREDENTIALS = {
  username: 'admin',
  password: 'admin'
};

const BASE64_AUTH = Base64.encode(`${API_CREDENTIALS.username}:${API_CREDENTIALS.password}`);

function fetchResponseByURL(relativeURL, method = 'GET') {
  return fetch(`${BASE_URL}${relativeURL}`, {
    method: method,
    headers: {
      'Authorization': `Basic ${BASE64_AUTH}`
    }
  }).then(res => {
    if (!res.ok) {
      return res.json().then((json) => {
        let errorMessage = json.message || '';

        return Promise.reject(new GraphQLError(errorMessage, null, null, null, json.route, null, json.details));
      });
    }

    return res.json();
  });
}


function fetchResponseBlob(relativeURL, method = 'GET') {
  return fetch(`${BASE_URL}${relativeURL}`, {
    method: method,
    headers: {
      'Authorization': `Basic ${BASE64_AUTH}`
    }
  }).then(res => {
    return res.buffer().then((buffer) => buffer ? buffer.toString() : null);
  });
}


class HXBase {
  constructor(data) {
    if (data) {
      Object.keys(data).forEach((key) => {
        this[key] = data[key];
      });
    }
  }

  __keyField() {
    return '_id';
  }
}

class HXAlert extends HXBase {
}

class HXHost extends HXBase {
}

class HXIndicator extends HXBase {
}

class HXCondition extends HXBase {
}

class HXScript extends HXBase {
}

class HXVersion extends HXBase {
}

class HXSearch extends HXBase {
}

class HXSearchHost extends HXBase {
}

class HXIndicatorCategory extends HXBase {
  __keyField() {
    return 'uri_name';
  }
}


function hxGetHostSummary(id) {
  return fetchResponseByURL(`/hosts/${id}`).then(
    json => new HXHost(json.data)
  );
}

function hxGetHostSystemInformation(id) {
  return fetchResponseByURL(`/hosts/${id}/sysinfo?full_sysinfo=true`).then(
    json => json.data
  );
}

function hxGetAllHosts(args) {
  let query = '';

  if (args) {
    query = '?' + Object.keys(args).map(key => `${key.replace('__', '.')}=${args[key]}`).join('&');
  }

  return fetchResponseByURL(`/hosts/${query}`).then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXHost(entry));
      }

      return [];
    }
  );
}

function hxGetAlert(id) {
  return fetchResponseByURL(`/alerts/${id}`).then(
    json => {
      return new HXAlert(json.data);
    }
  );
}

function hxGetAlertsAllHosts(args) {
  let query = '';

  if (args) {
    query = '?' + Object.keys(args).map(key => `${key.replace('__', '.')}=${args[key]}`).join('&') + '&sort=_id+desc';
  }

  return fetchResponseByURL(`/alerts/${query}`).then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXAlert(entry));
      }

      return [];
    }
  );
}

function hxGetFilteredAlertsAllHosts(args) {
  let query = '';

  if (args) {
    query = '?' + Object.keys(args).map(key => `${key.replace('__', '.')}=${args[key]}`).join('&') + '&sort=_id+desc';
  }

  return fetchResponseByURL(`/alerts/filter/${query}`).then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXAlert(entry));
      }

      return [];
    }
  );
}

function hxGetIndicatorByName(category, indicator) {
  return fetchResponseByURL(`/indicators/${category}/${indicator}`).then(
    json => {
      return new HXIndicator(json.data);
    }
  );
}

function hxGetIndicatorCategoryByName(category) {
  return fetchResponseByURL(`/indicator_categories/${category}`).then(
    json => {
      return new HXIndicatorCategory(json.data);
    }
  );
}

function hxGetIndicatorCategories() {
  return fetchResponseByURL('/indicator_categories').then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXIndicatorCategory(entry));
      }

      return [];

    }
  );
}

function hxGetSearchById(id) {
  return fetchResponseByURL(`/searches/${id}`).then(
    json => new HXSearch(json.data)
  );
}

function hxGetSearches() {
  return fetchResponseByURL('/searches').then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXSearch(entry));
      }

      return [];

    }
  );
}

function hxGetSearchHosts(id) {
  return fetchResponseByURL(`/searches/${id}/hosts`).then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXSearchHost(entry));
      }

      return [];

    }
  );
}

function hxGetConditionById(id) {
  return fetchResponseByURL(`/conditions/${id}`).then(
    json => new HXCondition(json.data)
  );
}


function hxGetScriptById(id) {
  return fetchResponseByURL(`/scripts/${id}`).then(
    json => new HXScript(json.data)
  );
}

function hxGetScriptContent(id) {
  return fetchResponseBlob(`/scripts/${id}.xml`);
}

function hxGetScripts(args) {
  let query = '';

  if (args) {
    query = '?' + Object.keys(args).map(key => `${key.replace('__', '.')}=${args[key]}`).join('&') + '&sort=_id+asc';
  }

  return fetchResponseByURL(`/scripts/${query}`).then(
    json => {
      if (Array.isArray(json.data.entries)) {
        return json.data.entries.map(entry => new HXScript(entry));
      }

      return [];
    }
  );
}

function hxGetVersion() {
  return fetchResponseByURL('/version').then(
    json => new HXVersion(json.data)
  );
}

const HXAlertLoader = new DataLoader(
  ids => Promise.all(ids.map(hxGetAlert))
);

const HXHostLoader = new DataLoader(
  ids => Promise.all(ids.map(hxGetHostSummary))
);

module.exports = {
  HXAlert,
  HXHost,
  HXVersion,
  HXIndicator,
  HXIndicatorCategory,
  HXScript,
  HXCondition,
  HXSearch,

  HXAlertLoader,
  HXHostLoader,
  hxGetAlert,
  hxGetAlertsAllHosts,
  hxGetHostSummary,
  hxGetHostSystemInformation,
  hxGetAllHosts,
  hxGetIndicatorByName,
  hxGetIndicatorCategoryByName,
  hxGetIndicatorCategories,
  hxGetConditionById,
  hxGetScriptById,
  hxGetScriptContent,
  hxGetScripts,
  hxGetVersion,
  hxGetSearchById,
  hxGetSearchHosts,
  hxGetSearches,
};
