import { getProperties, get } from '@ember/object';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/token';

export function editorDataToToken(editorData) {
  const tokenData = {};

  const {
    basic,
    caveats,
  } = getProperties(
    editorData,
    'basic',
    'caveats',
  );
  const {
    name,
    type,
    metadata,
  } = getProperties(
    basic || {},
    'name',
    'type',
    'metadata'
  );
  const {
    expireCaveat,
  } = getProperties(
    caveats || {},
    'expireCaveat',
  );

  if (name) {
    tokenData.name = name;
  }
  if (['invite', 'access'].contains(type)) {
    const typeKey = `${type}Token`;
    tokenData.type = {
      [typeKey]: {},
    };
  }
  if (type === 'invite') {
    const subtype = get(basic, 'inviteDetails.subtype');
    const target = get(basic, 'inviteDetails.inviteTargetDetails.target');

    if (subtype) {
      const availableSubtype = get(inviteTokenSubtypeToTargetModelMapping, subtype);
      if (availableSubtype) {
        tokenData.type.inviteToken.subtype = subtype;

        if (target && get(target, 'entityType') === availableSubtype.modelName) {
          tokenData.type.inviteToken[get(availableSubtype, 'idFieldName')] =
            get(target, 'entityId');
        }
      }
    }
  }
  if (metadata) {
    tokenData.customMetadata = JSON.parse(metadata);
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
  if (caveatsData.length) {
    tokenData.caveats = caveatsData;
  }
  return tokenData;
}
