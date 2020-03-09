/**
 * Util functions related to token-editor component.
 *
 * @module utils/token-editor-utils
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { getProperties, get, set } from '@ember/object';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import { Promise, resolve, all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

const consumerModelToPrefix = {
  user: 'usr',
  group: 'grp',
  provider: 'prv',
};

const prefixToConsumerModel = _.invert(consumerModelToPrefix);

const decodedPathRegexp = /^\/([^/]+)(.*)$/;

export function editorDataToToken(editorData, currentUser) {
  const tokenData = {};

  let {
    basic,
    caveats,
  } = getProperties(
    editorData,
    'basic',
    'caveats',
  );
  basic = basic || {};
  caveats = caveats || {};
  const {
    name,
    type,
  } = getProperties(
    basic,
    'name',
    'type'
  );
  const {
    expireCaveat,
    consumerCaveat,
    interfaceCaveat,
    serviceCaveat,
  } = getProperties(
    caveats,
    'expireCaveat',
    'consumerCaveat',
    'interfaceCaveat',
    'serviceCaveat'
  );

  if (name) {
    tokenData.name = name;
  }
  if (['access', 'identity', 'invite'].includes(type)) {
    const typeKey = `${type}Token`;
    tokenData.type = {
      [typeKey]: {},
    };
  }
  if (type === 'invite') {
    const inviteType = get(basic, 'inviteDetails.inviteType');
    const target = get(basic, 'inviteDetails.inviteTargetDetails.target');
    const privileges =
      get(basic, 'inviteDetails.inviteTargetDetails.invitePrivilegesDetails.privileges');
    const usageLimitType = get(basic, 'inviteDetails.usageLimit.usageLimitType');
    const usageLimitNumber = get(basic, 'inviteDetails.usageLimit.usageLimitNumber');

    if (inviteType) {
      const inviteTypeSpec = get(tokenInviteTypeToTargetModelMapping, inviteType);
      if (inviteTypeSpec) {
        tokenData.type.inviteToken.inviteType = inviteType;

        let targetEntityId;
        if (inviteType === 'registerOneprovider') {
          targetEntityId = currentUser && get(currentUser, 'entityId');
        } else if (target && get(target, 'entityType') === inviteTypeSpec.modelName) {
          targetEntityId = get(target, 'entityId');
        }
        if (targetEntityId) {
          tokenData.type.inviteToken[get(inviteTypeSpec, 'idFieldName')] = targetEntityId;
        }

        if (inviteTypeSpec.privileges && privileges) {
          tokenData.privileges = privileges;
        }
      }
    }
    if (usageLimitType === 'infinity') {
      tokenData.usageLimit = 'infinity';
    } else if (usageLimitType === 'number' && usageLimitNumber) {
      const parsedUsageLimitNumber = parseInt(usageLimitNumber);
      if (parsedUsageLimitNumber && parsedUsageLimitNumber > 0) {
        tokenData.usageLimit = parsedUsageLimitNumber;
      }
    }
  }
  const caveatsData = [];
  if (expireCaveat && get(expireCaveat, 'expireEnabled')) {
    const expireDate = get(expireCaveat, 'expire');
    if (expireDate) {
      caveatsData.push({
        type: 'time',
        validUntil: Math.floor(expireDate.valueOf() / 1000),
      });
    }
  }
  [
    'asn',
    'ip',
  ].forEach(caveatName => {
    const caveatFormObj = get(caveats, `${caveatName}Caveat`);
    if (caveatFormObj && get(caveatFormObj, `${caveatName}Enabled`)) {
      const whitelist = get(caveatFormObj, caveatName);
      if (whitelist && whitelist.length) {
        caveatsData.push({
          type: caveatName,
          whitelist,
        });
      }
    }
  });
  [
    'region',
    'country',
  ].forEach(caveatName => {
    const caveatFormObj = get(caveats, `${caveatName}Caveat`);
    if (caveatFormObj && get(caveatFormObj, `${caveatName}Enabled`)) {
      const filter = get(caveatFormObj, `${caveatName}.${caveatName}Type`);
      const list = get(caveatFormObj, `${caveatName}.${caveatName}List`);
      if (filter && list && list.length) {
        caveatsData.push({
          type: `geo.${caveatName}`,
          filter,
          list,
        });
      }
    }
  });
  if (consumerCaveat && get(consumerCaveat, 'consumerEnabled')) {
    const whitelist = (get(consumerCaveat, 'consumer') || []).map(value => {
      const {
        record,
        id: recordId,
        model,
      } = getProperties(value, 'record', 'id', 'model');
      const prefix = consumerModelToPrefix[model];
      let id = recordId;
      if (!id) {
        id = get(record, 'representsAll') ? '*' : get(record, 'entityId');
      }
      return `${prefix}-${id}`;
    });
    if (whitelist.length) {
      caveatsData.push({
        type: 'consumer',
        whitelist,
      });
    }
  }
  if (['identity', 'access'].includes(type)) {
    if (interfaceCaveat && get(interfaceCaveat, 'interfaceEnabled')) {
      const value = get(interfaceCaveat, 'interface');
      if (value) {
        caveatsData.push({
          type: 'interface',
          interface: value,
        });
      }
    }
  }
  if (type === 'access') {
    const {
      readonlyCaveat,
      pathCaveat,
      objectIdCaveat,
    } = getProperties(
      get(caveats, 'dataAccessCaveats') || {},
      'readonlyCaveat',
      'pathCaveat',
      'objectIdCaveat'
    );

    if (serviceCaveat && get(serviceCaveat, 'serviceEnabled')) {
      const whitelist = (get(serviceCaveat, 'service') || []).map(value => {
        const {
          record,
          id: recordId,
          model,
        } = getProperties(value, 'record', 'id', 'model');
        const serviceType = record && get(record, 'type') || 'oneprovider';
        const prefix = (serviceType === 'onezone' ? 'oz' : 'op') +
          (model === 'serviceOnepanel' ? 'p' : 'w');
        let id = serviceType === 'onezone' ? 'onezone' : recordId;
        if (!id) {
          id = get(record, 'representsAll') ? '*' : get(record, 'entityId');
        }
        return `${prefix}-${id}`;
      });
      if (whitelist.length) {
        caveatsData.push({
          type: 'service',
          whitelist,
        });
      }
    }
    if (readonlyCaveat && get(readonlyCaveat, 'readonlyEnabled')) {
      caveatsData.push({
        type: 'data.readonly',
      });
    }

    if (pathCaveat && get(pathCaveat, 'pathEnabled')) {
      const pathFieldsNames = get(pathCaveat, 'path.__fieldsValueNames') || [];
      const whitelist = pathFieldsNames
        .map(name => get(pathCaveat, `path.${name}`))
        .compact()
        .map(pathEntry => {
          const spaceId = get(pathEntry, 'pathSpace.entityId');
          const pathString = (get(pathEntry, 'pathString') || '').replace(/\/+$/, '');
          if (spaceId) {
            const absolutePath = `/${spaceId}${pathString}`;
            return btoa(absolutePath);
          }
        })
        .compact();
      if (whitelist.length) {
        caveatsData.push({
          type: 'data.path',
          whitelist,
        });
      }
    }

    if (objectIdCaveat && get(objectIdCaveat, 'objectIdEnabled')) {
      const objectIdFieldsNames = get(objectIdCaveat, 'objectId.__fieldsValueNames') || [];
      const whitelist = objectIdFieldsNames
        .map(name => get(objectIdCaveat, `objectId.${name}`))
        .compact();
      if (whitelist.length) {
        caveatsData.push({
          type: 'data.objectid',
          whitelist,
        });
      }
    }
  }

  if (caveatsData.length) {
    tokenData.caveats = caveatsData;
  }
  return tokenData;
}

/**
 * @param {Models.Token} token 
 * @param {Function} getRecord (modelName: String, entityId: String|'onezone'): Promise<Model>
 * @returns {EmberObject}
 */
export function tokenToEditorDefaultData(token, getRecord) {
  if (!token) {
    return EmberObject.create();
  }

  const {
    name,
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
    tokenString,
    type: typeName,
    inviteType,
    inviteTargetProxy,
    privileges,
    usageLimit,
    usageCount,
    caveats: EmberObject.create(),
  });

  if (caveats && get(caveats, 'length')) {
    const timeCaveat = caveats.findBy('type', 'time');
    if (timeCaveat) {
      const validUntil = new Date((get(timeCaveat, 'validUntil') || 0) * 1000);
      set(defaultData, 'caveats.expire', validUntil);
    }

    [
      'region',
      'country',
    ].forEach(caveatName => {
      const caveat = caveats.findBy('type', `geo.${caveatName}`);
      if (caveat) {
        set(defaultData, `caveats.${caveatName}`, EmberObject.create({
          type: get(caveat, 'filter'),
          list: get(caveat, 'list'),
        }));
      }
    });

    [
      'asn',
      'ip',
    ].forEach(caveatName => {
      const caveat = caveats.findBy('type', caveatName);
      if (caveat) {
        set(defaultData, `caveats.${caveatName}`, get(caveat, 'whitelist'));
      }
    });

    const consumerCaveat = caveats.findBy('type', 'consumer');
    if (consumerCaveat) {
      const whitelist = get(consumerCaveat, 'whitelist') || [];
      const consumerProxy = PromiseArray.create({
        promise: Promise.all(whitelist.map(recordIdentitier => {
          const [modelAbbrev, entityId] = recordIdentitier.split('-');
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
      set(defaultData, 'caveats.consumer', consumerProxy);
    }

    const serviceCaveat = caveats.findBy('type', 'service');
    if (serviceCaveat) {
      const whitelist = get(serviceCaveat, 'whitelist') || [];
      const serviceProxy = PromiseArray.create({
        promise: Promise.all(whitelist.map(recordIdentitier => {
          const [modelAbbrev, entityId] = recordIdentitier.split('-');
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
      set(defaultData, 'caveats.service', serviceProxy);
    }

    const interfaceCaveat = caveats.findBy('type', 'interface');
    if (interfaceCaveat) {
      set(defaultData, 'caveats.interface', get(interfaceCaveat, 'interface'));
    }

    const readonlyCaveat = caveats.findBy('type', 'data.readonly');
    if (readonlyCaveat) {
      set(defaultData, 'caveats.readonly', true);
    }

    const pathCaveat = caveats.findBy('type', 'data.path');
    if (pathCaveat && get(pathCaveat, 'whitelist.length')) {
      const whitelist = get(pathCaveat, 'whitelist');
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
      const pathProxy = PromiseObject.create({
        promise: allFulfilled(spacesFetchPromises).then(() => caveatDefaultData),
      });
      set(defaultData, 'caveats.path', pathProxy);
    }

    const objectIdCaveat = caveats.findBy('type', 'data.objectid');
    if (objectIdCaveat && get(objectIdCaveat, 'whitelist.length')) {
      const whitelist = get(objectIdCaveat, 'whitelist');
      const caveatDefaultData = {
        __fieldsValueNames: [],
      };
      whitelist.forEach((objectId, index) => {
        const valueName = `objectIdEntry${index}`;
        caveatDefaultData[valueName] = objectId;
        caveatDefaultData.__fieldsValueNames.push(valueName);
      });
      set(defaultData, 'caveats.objectId', caveatDefaultData);
    }
  }

  set(defaultData, 'hasCaveats', Object.keys(get(defaultData, 'caveats')).length > 1);

  return defaultData;
}
