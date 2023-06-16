/**
 * Converts data from token-editor to model-compatible token object.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { getProperties, get } from '@ember/object';
import { camelize } from '@ember/string';
import {
  tokenInviteTypeToTargetModelMapping,
} from 'onezone-gui/models/token';

const consumerModelToPrefix = {
  user: 'usr',
  group: 'grp',
  provider: 'prv',
};

export default function creatorDataToToken(editorData, currentUser) {
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
  const expireCaveat = get(caveats, 'timeCaveats.expireCaveat');
  const {
    consumerCaveat,
    interfaceCaveat,
    serviceCaveat,
  } = getProperties(
    get(caveats, 'endpointCaveats') || {},
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
        } else if (
          target && camelize(get(target, 'entityType') ?? '') === inviteTypeSpec.modelName
        ) {
          targetEntityId = get(target, 'entityId');
        }
        if (targetEntityId) {
          tokenData.type.inviteToken[get(inviteTypeSpec, 'idFieldName')] = targetEntityId;
        }

        if (inviteTypeSpec.hasPrivileges && privileges) {
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
    const caveatFormObj = get(caveats, `networkCaveats.${caveatName}Caveat`);
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
    const caveatFormObj = get(caveats, `geoCaveats.${caveatName}Caveat`);
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
        const serviceType = record && get(record, 'serviceType') || 'oneprovider';
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
          return undefined;
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
      const objectIdFieldsNames =
        get(objectIdCaveat, 'objectId.__fieldsValueNames') || [];
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
