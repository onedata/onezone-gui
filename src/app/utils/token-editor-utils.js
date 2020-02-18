import { getProperties, get } from '@ember/object';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/token';

const consumerModelToPrefix = {
  user: 'usr',
  group: 'grp',
  oneprovider: 'prv',
};

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
  } = getProperties(
    caveats,
    'expireCaveat',
    'consumerCaveat',
  );

  if (name) {
    tokenData.name = name;
  }
  if (['invite', 'access'].includes(type)) {
    const typeKey = `${type}Token`;
    tokenData.type = {
      [typeKey]: {},
    };
  }
  if (type === 'invite') {
    const subtype = get(basic, 'inviteDetails.subtype');
    const target = get(basic, 'inviteDetails.inviteTargetDetails.target');
    const privileges =
      get(basic, 'inviteDetails.inviteTargetDetails.invitePrivilegesDetails.privileges');
    const usageLimitSelector = get(basic, 'inviteDetails.usageLimit.usageLimitSelector');
    const usageLimitNumber = get(basic, 'inviteDetails.usageLimit.usageLimitNumber');

    if (subtype) {
      const availableSubtype = get(inviteTokenSubtypeToTargetModelMapping, subtype);
      if (availableSubtype) {
        tokenData.type.inviteToken.subtype = subtype;

        let targetEntityId;
        if (subtype === 'registerOneprovider') {
          targetEntityId = currentUser && get(currentUser, 'entityId');
        } else if (target && get(target, 'entityType') === availableSubtype.modelName) {
          targetEntityId = get(target, 'entityId');
        }
        if (targetEntityId) {
          tokenData.type.inviteToken[get(availableSubtype, 'idFieldName')] = targetEntityId;
        }

        if (availableSubtype.privileges && privileges) {
          tokenData.privileges = privileges;
        }
      }
    }
    if (usageLimitSelector === 'infinity') {
      tokenData.usageLimit = 'infinity';
    } else if (usageLimitSelector === 'number' && usageLimitNumber) {
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
        validUntil: expireDate.valueOf() / 1000,
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
    const whitelist = (get(consumerCaveat, 'consumer') || [])
      .map(value => {
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
  if (type === 'access') {
    const {
      interfaceCaveat,
      readonlyCaveat,
      pathCaveat,
      objectIdCaveat,
      serviceCaveat,
    } = getProperties(
      get(caveats, 'accessOnlyCaveats') || {},
      'interfaceCaveat',
      'readonlyCaveat',
      'pathCaveat',
      'objectIdCaveat',
      'serviceCaveat'
    );

    if (serviceCaveat && get(serviceCaveat, 'serviceEnabled')) {
      const whitelist = (get(serviceCaveat, 'service') || [])
        .map(value => {
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
    if (interfaceCaveat && get(interfaceCaveat, 'interfaceEnabled')) {
      const value = get(interfaceCaveat, 'interface');
      if (value) {
        caveatsData.push({
          type: 'interface',
          interface: value,
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
          const pathString = get(pathEntry, 'pathString');
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
