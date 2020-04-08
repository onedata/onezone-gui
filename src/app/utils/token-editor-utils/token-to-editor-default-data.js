/**
 * Converts token to object consumable by token-editor component in view mode.
 *
 * @module utils/token-editor-utils/token-to-editor-default-data
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { getProperties, get, set } from '@ember/object';
import { Promise, resolve, all as allFulfilled } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const caveatConverters = {
  'time': caveat => new Date((get(caveat, 'validUntil') || 0) * 1000),
  'geo.region': regionCountryConverter,
  'geo.country': regionCountryConverter,
  'asn': caveat => get(caveat, 'whitelist'),
  'ip': caveat => get(caveat, 'whitelist'),
  'consumer': consumerConverter,
  'service': serviceConverter,
  'interface': caveat => get(caveat, 'interface'),
  'data.readonly': () => true,
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
    return EmberObject.create();
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

  const inviteTargetProxy = PromiseObject.create({
    promise: (tokenTargetProxy || resolve(null))
      .catch(() => null)
      .then(record => {
        if (record) {
          return record;
        } else {
          return {
            entityId: targetRecordId,
            entityType: targetModelName,
            name: `ID: ${targetRecordId ? targetRecordId : 'unknown'}`,
          };
        }
      }),
  });

  const defaultData = EmberObject.create({
    name,
    revoked,
    tokenString,
    type: typeName,
    inviteType,
    inviteTargetProxy,
    privileges,
    usageLimit,
    usageCount,
    caveats: EmberObject.create(),
  });

  (caveats || []).forEach(caveat => {
    convertCaveat(caveat, defaultData, getRecord);
  });

  set(defaultData, 'hasCaveats', Object.keys(get(defaultData, 'caveats')).length > 0);

  return defaultData;
}

function convertCaveat(caveat, defaultDataObject, getRecord) {
  const caveatType = get(caveat, 'type');
  const caveatConverter = caveatConverters[caveatType];
  if (caveatConverter) {
    const convertedCaveat = caveatConverter(caveat, getRecord);
    const editorCaveatName = caveatNamesInEditor[caveatType] || caveatType;
    set(defaultDataObject, `caveats.${editorCaveatName}`, convertedCaveat);
  }
}

function regionCountryConverter(caveat) {
  return EmberObject.create({
    type: get(caveat, 'filter'),
    list: get(caveat, 'list'),
  });
}

function consumerConverter(caveat, getRecord) {
  const whitelist = get(caveat, 'whitelist') || [];
  return PromiseArray.create({
    promise: Promise.all(whitelist.map(recordIdentifier => {
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
    })).then(consumers => consumers.compact()),
  });
}

function serviceConverter(caveat, getRecord) {
  const whitelist = get(caveat, 'whitelist') || [];
  return PromiseArray.create({
    promise: Promise.all(whitelist.map(recordIdentifier => {
      const [modelAbbrev, entityId] = recordIdentifier.split('-');
      const modelName = ['opp', 'ozp'].includes(modelAbbrev) ?
        'serviceOnepanel' : 'service';
      if (entityId === '*') {
        return resolve({
          record: { representsAll: modelName },
          model: modelName,
        });
      } else {
        return getRecord('cluster', entityId)
          .then(record => ({
            record,
            model: modelName,
          }))
          .catch(() => ({
            id: entityId,
            model: modelName,
          }));
      }
    })),
  });
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
          pathSpace: { entityId: spaceEntityId },
          pathString,
        };
      });
    spacesFetchPromises.push(spaceFetchPromise);
    caveatDefaultData.__fieldsValueNames.push(valueName);
  });
  return PromiseObject.create({
    promise: allFulfilled(spacesFetchPromises).then(() => caveatDefaultData),
  });
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
  return caveatDefaultData;
}
