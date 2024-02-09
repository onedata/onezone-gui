/**
 * Converts token to object consumable by token-editor component in view mode.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  getProperties,
  set,
} from '@ember/object';
import { resolve, all as allFulfilled } from 'rsvp';
import moment from 'moment';
import { createValuesContainer } from 'onedata-gui-common/utils/form-component/values-container';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';

const caveatConverters = {
  timeCaveats: {
    expire: {
      backendName: 'time',
      converter: expireConverter,
    },
  },
  geoCaveats: {
    region: {
      backendName: 'geo.region',
      converter: regionConverter,
    },
    country: {
      backendName: 'geo.country',
      converter: countryConverter,
    },
  },
  networkCaveats: {
    asn: {
      backendName: 'asn',
      converter: caveat => resolve(createValuesContainer({
        asnEnabled: Boolean(caveat),
        asn: caveat?.whitelist ?? [],
      })),
    },
    ip: {
      backendName: 'ip',
      converter: caveat => resolve(createValuesContainer({
        ipEnabled: Boolean(caveat),
        ip: caveat?.whitelist ?? [],
      })),
    },
  },
  endpointCaveats: {
    consumer: {
      backendName: 'consumer',
      converter: consumerConverter,
    },
    service: {
      backendName: 'service',
      converter: serviceConverter,
    },
    interface: {
      backendName: 'interface',
      converter: caveat => resolve(createValuesContainer({
        interfaceEnabled: Boolean(caveat),
        interface: caveat?.interface ?? 'rest',
      })),
    },
  },
  dataAccessCaveats: {
    readonly: {
      backendName: 'data.readonly',
      converter: caveat => resolve(createValuesContainer({
        readonlyEnabled: Boolean(caveat),
      })),
    },
    path: {
      backendName: 'data.path',
      converter: pathConverter,
    },
    objectId: {
      backendName: 'data.objectid',
      converter: objectIdConverter,
    },
  },
};

const prefixToConsumerModel = {
  usr: 'user',
  grp: 'group',
  prv: 'provider',
};

const decodedPathRegexp = /^\/([^/]+)(.*)$/;

export default async function tokenToEditorDefaultData(token, getRecord) {
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
    token ?? {},
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

  const inviteTypeSpec = tokenInviteTypeToTargetModelMapping[inviteType];
  let privilegesTarget = undefined;
  if (inviteTypeSpec?.modelName && inviteTypeSpec?.hasPrivileges) {
    privilegesTarget = inviteTypeSpec.modelName;
  }

  const formData = createValuesContainer({
    basic: createValuesContainer({
      name: name ?? '',
      revoked: revoked ?? false,
      tokenString: tokenString ?? '',
      type: typeName ?? 'access',
      inviteDetails: createValuesContainer({
        inviteType: inviteType ?? 'userJoinGroup',
        inviteTargetDetails: createValuesContainer({
          target: await (tokenTargetProxy || resolve(undefined))
            .catch(() => undefined)
            .then(record => {
              if (record) {
                return record;
              }
              if (targetRecordId && targetModelName) {
                return {
                  constructor: {
                    modelName: targetModelName,
                  },
                  entityId: targetRecordId,
                  name: `ID: ${targetRecordId ? targetRecordId : 'unknown'}`,
                };
              }
              return undefined;
            }),
          invitePrivilegesDetails: createValuesContainer({
            privileges: privileges ? {
              privilegesTarget,
              privileges,
            } : undefined,
          }),
        }),
        usageLimit: createValuesContainer({
          usageLimitType: Number.isInteger(usageLimit) ? 'number' : 'infinity',
          usageLimitNumber: Number.isInteger(usageLimit) ? String(usageLimit) : '',
        }),
        usageCount: `${usageCount} / ${usageLimit}`,
      }),
    }),
    caveats: createValuesContainer(),
  });

  const caveatPromises = [];
  for (const [sectionName, nestedCaveats] of Object.entries(caveatConverters)) {
    set(formData.caveats, sectionName, createValuesContainer());
    for (
      const [caveatName, { backendName, converter }] of Object.entries(nestedCaveats)
    ) {
      const caveatValue = caveats?.find(({ type }) => type === backendName);
      caveatPromises.push(converter(caveatValue, getRecord).then((val) =>
        set(formData.caveats[sectionName], `${caveatName}Caveat`, val)
      ));
    }
  }

  await allFulfilled(caveatPromises);
  return formData;
}

function expireConverter(caveat) {
  return resolve(createValuesContainer({
    expireEnabled: Boolean(caveat?.validUntil),
    expire: caveat?.validUntil ?
      new Date(caveat.validUntil * 1000) : moment().add(1, 'day').endOf('day').toDate(),
  }));
}

function countryConverter(caveat) {
  return resolve(createValuesContainer({
    countryEnabled: Boolean(caveat),
    country: createValuesContainer({
      countryType: caveat?.filter ?? 'whitelist',
      countryList: caveat?.list ?? [],
    }),
  }));
}

function regionConverter(caveat) {
  return resolve(createValuesContainer({
    regionEnabled: Boolean(caveat),
    region: createValuesContainer({
      regionType: caveat?.filter ?? 'whitelist',
      regionList: caveat?.list ?? [],
    }),
  }));
}

function consumerConverter(caveat, getRecord) {
  const whitelist = caveat?.whitelist || [];
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
  })).then(consumers => createValuesContainer({
    consumerEnabled: Boolean(caveat),
    consumer: consumers.compact(),
  }));
}

function serviceConverter(caveat, getRecord) {
  const whitelist = caveat?.whitelist || [];
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
  })).then((services) => createValuesContainer({
    serviceEnabled: Boolean(caveat),
    service: services,
  }));
}

function pathConverter(caveat, getRecord) {
  const whitelist = caveat?.whitelist;
  const caveatDefaultData = {
    __fieldsValueNames: [],
  };
  const spacesFetchPromises = [];
  whitelist?.forEach((encodedPath, index) => {
    const valueName = `pathEntry${index}`;
    const decodedPath = atob(encodedPath);
    let [, spaceEntityId, pathString] = decodedPath.match(decodedPathRegexp);
    pathString = pathString || '/';
    const spaceFetchPromise = getRecord('space', spaceEntityId)
      .then(pathSpace => {
        caveatDefaultData[valueName] = createValuesContainer({
          pathSpace,
          pathString,
        });
      })
      .catch(() => {
        caveatDefaultData[valueName] = createValuesContainer({
          pathSpace: {
            constructor: {
              modelName: 'space',
            },
            entityId: spaceEntityId,
          },
          pathString,
        });
      });
    spacesFetchPromises.push(spaceFetchPromise);
    caveatDefaultData.__fieldsValueNames.push(valueName);
  });
  return allFulfilled(spacesFetchPromises).then(() => createValuesContainer({
    pathEnabled: Boolean(caveat),
    path: createValuesContainer(caveatDefaultData),
  }));
}

function objectIdConverter(caveat) {
  const whitelist = caveat?.whitelist;
  const caveatDefaultData = {
    __fieldsValueNames: [],
  };
  whitelist?.forEach((objectId, index) => {
    const valueName = `objectIdEntry${index}`;
    caveatDefaultData[valueName] = objectId;
    caveatDefaultData.__fieldsValueNames.push(valueName);
  });
  return resolve(createValuesContainer({
    objectIdEnabled: Boolean(caveat),
    objectId: createValuesContainer(caveatDefaultData),
  }));
}
