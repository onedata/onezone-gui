/**
 * Converts token to object consumable by token-editor component in view mode.
 *
 * @module utils/token-editor-utils/token-to-editor-default-data
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  getProperties,
  get,
  set,
} from '@ember/object';
import { resolve, all as allFulfilled } from 'rsvp';

/**
 * Set of converters for each token caveat. Used to convert array of caveats from a token
 * to a form consumable by the token editor. Its is a mapping:
 * token caveat type (from raw token) ->
 *  (rawCaveat: Object, getRecord: Function) => Promise<Object>
 * where returned promise resolves to a caveat object ready to use by token editor.
 */
const caveatConverters = {
  'time': caveat => resolve(new Date((get(caveat, 'validUntil') || 0) * 1000)),
  'geo.region': regionCountryConverter,
  'geo.country': regionCountryConverter,
  'asn': caveat => resolve(get(caveat, 'whitelist')),
  'ip': caveat => resolve(get(caveat, 'whitelist')),
  'consumer': consumerConverter,
  'service': serviceConverter,
  'interface': caveat => resolve(get(caveat, 'interface')),
  'data.readonly': () => resolve(true),
  'data.path': pathConverter,
  'data.objectid': objectIdConverter,
};

const caveatNamesInEditor = {
  'time': 'expire',
  'geo.region': 'region',
  'geo.country': 'country',
  'data.readonly': 'readonly',
  'data.path': 'path',
  'data.objectid': 'objectId',
};

const prefixToConsumerModel = {
  usr: 'user',
  grp: 'group',
  prv: 'provider',
};

const decodedPathRegexp = /^\/([^/]+)(.*)$/;

export default function tokenToEditorDefaultData(token, getRecord) {
  if (!token) {
    return resolve(EmberObject.create());
  }

  const {
    name,
    revoked,
    token: tokenString,
    typeName,
    inviteType,
    targetModelName,
    targetRecordId,
    tokenTargetProxy,
    privileges,
    usageLimit,
    usageCount,
    caveats,
  } = getProperties(
    token,
    'name',
    'revoked',
    'token',
    'typeName',
    'inviteType',
    'targetModelName',
    'targetRecordId',
    'tokenTargetProxy',
    'privileges',
    'usageLimit',
    'usageCount',
    'caveats'
  );

  const defaultData = EmberObject.create({
    name,
    revoked,
    tokenString,
    type: typeName,
    inviteType,
    privileges,
    usageLimit,
    usageCount,
    caveats: EmberObject.create(),
  });

  const inviteTargetPromise = (tokenTargetProxy || resolve(null))
    .catch(() => null)
    .then(record => {
      set(defaultData, 'inviteTarget', record ? record : {
        constructor: {
          modelName: targetModelName,
        },
        entityId: targetRecordId,
        name: `ID: ${targetRecordId ? targetRecordId : 'unknown'}`,
      });
    });

  const caveatsPromise = allFulfilled(
    (caveats || []).map(caveat => convertCaveat(caveat, defaultData, getRecord))
  ).then(() =>
    set(defaultData, 'hasCaveats', Object.keys(get(defaultData, 'caveats')).length > 0)
  );

  return allFulfilled([
    inviteTargetPromise,
    caveatsPromise,
  ]).then(() => defaultData);
}

function convertCaveat(caveat, defaultDataObject, getRecord) {
  const caveatType = get(caveat, 'type');
  const caveatConverter = caveatConverters[caveatType];
  if (caveatConverter) {
    const editorCaveatName = caveatNamesInEditor[caveatType] || caveatType;
    return caveatConverter(caveat, getRecord).then(convertedCaveat =>
      set(defaultDataObject, `caveats.${editorCaveatName}`, convertedCaveat)
    );
  } else {
    return resolve();
  }
}

function regionCountryConverter(caveat) {
  return resolve(EmberObject.create({
    type: get(caveat, 'filter'),
    list: get(caveat, 'list'),
  }));
}

function consumerConverter(caveat, getRecord) {
  const whitelist = get(caveat, 'whitelist') || [];
  return allFulfilled(whitelist.map(recordIdentifier => {
    const [modelAbbrev, entityId] = recordIdentifier.split('-');
    const modelName = prefixToConsumerModel[modelAbbrev];
    if (!modelName) {
      return undefined;
    }
    if (entityId === '*') {
      return resolve({
        record: { representsAll: modelName },
        model: modelName,
      });
    } else {
      return getRecord(modelName, entityId)
        .then(record => ({
          record,
          model: modelName,
        }))
        .catch(() => ({
          id: entityId,
          model: modelName,
        }));
    }
  })).then(consumers => consumers.compact());
}

function serviceConverter(caveat, getRecord) {
  const whitelist = get(caveat, 'whitelist') || [];
  return allFulfilled(whitelist.map(recordIdentifier => {
    const [modelAbbrev, entityId] = recordIdentifier.split('-');
    const editorModelName = ['opp', 'ozp'].includes(modelAbbrev) ?
      'serviceOnepanel' : 'service';
    const recordModelName = editorModelName === 'serviceOnepanel' ?
      'cluster' : (modelAbbrev === 'opw' ? 'provider' : 'onezone');
    if (entityId === '*') {
      return resolve({
        record: { representsAll: editorModelName },
        model: editorModelName,
      });
    } else {
      return getRecord(recordModelName, entityId)
        .then(record => ({
          record,
          model: editorModelName,
        }))
        .catch(() => ({
          id: entityId,
          model: editorModelName,
        }));
    }
  }));
}

function pathConverter(caveat, getRecord) {
  const whitelist = get(caveat, 'whitelist');
  const caveatDefaultData = {
    __fieldsValueNames: [],
  };
  const spacesFetchPromises = [];
  whitelist.forEach((encodedPath, index) => {
    const valueName = `pathEntry${index}`;
    const decodedPath = atob(encodedPath);
    let [, spaceEntityId, pathString] = decodedPath.match(decodedPathRegexp);
    pathString = pathString || '/';
    const spaceFetchPromise = getRecord('space', spaceEntityId)
      .then(pathSpace => {
        caveatDefaultData[valueName] = {
          pathSpace,
          pathString,
        };
      })
      .catch(() => {
        caveatDefaultData[valueName] = {
          pathSpace: {
            constructor: {
              modelName: 'space',
            },
            entityId: spaceEntityId,
          },
          pathString,
        };
      });
    spacesFetchPromises.push(spaceFetchPromise);
    caveatDefaultData.__fieldsValueNames.push(valueName);
  });
  return allFulfilled(spacesFetchPromises).then(() => caveatDefaultData);
}

function objectIdConverter(caveat) {
  const whitelist = get(caveat, 'whitelist');
  const caveatDefaultData = {
    __fieldsValueNames: [],
  };
  whitelist.forEach((objectId, index) => {
    const valueName = `objectIdEntry${index}`;
    caveatDefaultData[valueName] = objectId;
    caveatDefaultData.__fieldsValueNames.push(valueName);
  });
  return resolve(caveatDefaultData);
}
