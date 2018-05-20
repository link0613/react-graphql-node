// @flow
const DataLoader = require('dataloader');

class User {
  constructor(id, name, username, website, features) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.website = website;
    this.features = features;
  }
}

class Feature {
  constructor(id, name, description, url) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.url = url;
  }
}

const features = [
];

const users = new User('1', 'FireEye Inc.', 'FireEye Inc.', 'https://www.fireeye.com', features.map(feature => feature.id));

/*
* Add feature in memory
*/

let curFeatures = 9;
function addFeature(name: string, description: string, url: string) {
  const newFeature = new Feature(curFeatures.toString(), name, description, url);
  features.push(newFeature);
  users.features.push(newFeature.id);
  featureLoader.clear(newFeature.id);
  userLoader.clear(users.id);
  curFeatures += 1;
  return newFeature;
}

module.exports = {
  userLoader,
  featureLoader,
  User,
  Feature,
  getFeatures,
  addFeature
};
