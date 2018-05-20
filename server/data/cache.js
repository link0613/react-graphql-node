const _ = require('lodash');

function cache(proxyMethod, entityKey, params) {
  const { cacheLayer, cacheIndex } = global;

  if (!entityKey) {
    return null;
  }

  if (typeof proxyMethod !== 'function') {
    return null;
  }

  if (cacheLayer && cacheIndex) {
    const { source, args, context, info, projection} = params;
    const indexName = `${cacheIndex}_${String(info.returnType).toLowerCase()}`;

    return cacheLayer.get(
      {
        index: indexName,
        type: String(info.returnType),
        id: String(entityKey)
      })
      .then((cachedEntity) => {
        return {
          _id: entityKey,
          ...cachedEntity._source
        };
      })
      .catch((error) => {
        return proxyMethod
          .apply(null, Object.values(params.args || {}))
          .then((entity) => {
            if (entity) {
              const keyField = (typeof entity.__keyField === 'function') ? entity.__keyField() : '_id';

              const cacheDocument = {
                index: indexName,
                type: String(info.returnType),
                id: String(entity[keyField]),
                body: _.omit(entity, '_id')
              };

              return cacheLayer.index(cacheDocument).then(_ => entity);
            }

            return null;
          });
      });
  }

  return proxyMethod.apply(null, Object.values(params.args || {}));
}

function cacheSet(proxyMethod, params) {
  const { cacheLayer, cacheIndex } = global;

  if (typeof proxyMethod !== 'function') {
    return null;
  }

  const promise = proxyMethod.call(null, params.args);

  promise.then((data) => {
    if (data && Array.isArray(data) && data.length) {
      if (cacheLayer && cacheIndex) {
        const {source, args, context, info, projection} = params;
        const typename = String(info.returnType).replace(/[\[\]]/g, '');
        const indexName = `${cacheIndex}_${typename.toLowerCase()}`;

        let bulkBody = [];

        data.forEach((entity) => {
          const operation = {
            index:  {
              _index: indexName,
              _type: typename,
              _id: String(entity._id)
            }
          };

          bulkBody.push(operation);

          const doc = _.omit(entity, '_id');
          bulkBody.push(doc);
        });

        cacheLayer.bulk({
          body: bulkBody
        });
      }
    }

    return Promise.resolve(data);
  });

  return promise;
}

module.exports = {
  cache,
  cacheSet
};
