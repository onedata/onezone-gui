import { getProperties, get } from '@ember/object';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/token';

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
  const expireCaveat = get(caveats, 'expireCaveat');

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
  if (type === 'access') {
    const {
      interfaceCaveat,
      readonlyCaveat,
      pathCaveat,
      objectIdCaveat,
    } = getProperties(
      get(caveats, 'accessOnlyCaveats') || {},
      'interfaceCaveat',
      'readonlyCaveat',
      'pathCaveat',
      'objectIdCaveat'
    );

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
