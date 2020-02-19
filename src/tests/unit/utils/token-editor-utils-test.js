import { expect } from 'chai';
import { describe, it } from 'mocha';
import { editorDataToToken } from 'onezone-gui/utils/token-editor-utils';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import { get, getProperties } from '@ember/object';
import _ from 'lodash';

describe('Unit | Utility | token editor utils', function () {
  describe('editor data to token', function () {
    it('converts name', function () {
      const result = editorDataToToken({
        basic: {
          name: 'asd',
        },
      });
      expect(result).to.have.property('name', 'asd');
    });

    [
      'invite',
      'access',
    ].forEach(typeName => {
      it(
        `returns object with type.${typeName}Token if type is '${typeName}'`,
        function () {
          const result = editorDataToToken({
            basic: {
              type: typeName,
            },
          });
          const type = result.type;
          expect(type).to.have.deep.property(`${typeName}Token`, {});
          expect(Object.keys(type)).to.have.length(1);
        }
      );
    });

    it('returns object with type.inviteToken.inviteType', function () {
      const result = editorDataToToken({
        basic: {
          type: 'invite',
          inviteDetails: {
            inviteType: 'groupJoinGroup',
          },
        },
      });
      const inviteToken = result.type.inviteToken;
      expect(inviteToken).to.have.property('inviteType', 'groupJoinGroup');
      expect(Object.keys(inviteToken)).to.have.length(1);
    });

    Object.keys(tokenInviteTypeToTargetModelMapping)
      .without('registerOneprovider')
      .forEach(inviteType => {
        const {
          idFieldName,
          modelName,
        } = getProperties(
          get(tokenInviteTypeToTargetModelMapping, inviteType),
          'idFieldName',
          'modelName'
        );
        it(
          `returns object with type.inviteToken.{inviteType,${idFieldName}} when target is ${modelName} for inviteType ${inviteType}`,
          function () {
            const result = editorDataToToken({
              basic: {
                type: 'invite',
                inviteDetails: {
                  inviteType,
                  inviteTargetDetails: {
                    target: {
                      entityType: modelName,
                      entityId: 'abc',
                    },
                  },
                },
              },
            });
            const inviteToken = result.type.inviteToken;
            expect(inviteToken).to.have.property('inviteType', inviteType);
            expect(inviteToken).to.have.property(idFieldName, 'abc');
            expect(Object.keys(inviteToken)).to.have.length(2);
          }
        );
      });

    it(
      'returns object without specified token invite target if target model is not suitable for invitation inviteType',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
            inviteDetails: {
              inviteType: 'groupJoinGroup',
              inviteTargetDetails: {
                target: {
                  entityType: 'cluster',
                  entityId: 'abc',
                },
              },
            },
          },
        });
        const inviteToken = result.type.inviteToken;
        expect(inviteToken).to.not.have.property('clusterId', 'abc');
        expect(inviteToken).to.not.have.property('groupId', 'abc');
        expect(Object.keys(inviteToken)).to.have.length(1);
      }
    );

    it(
      'returns object with current user as a target model when inviteType is registerOneprovider',
      function () {
        const currentUser = { entityId: 'user1' };
        const result = editorDataToToken({
          basic: {
            type: 'invite',
            inviteDetails: {
              inviteType: 'registerOneprovider',
              // Incorrect target to check, that it will be ignored
              inviteTargetDetails: {
                target: {
                  entityType: 'cluster',
                  entityId: 'abc',
                },
              },
            },
          },
        }, currentUser);
        const inviteToken = result.type.inviteToken;
        expect(inviteToken).to.have.deep.property('adminUserId', 'user1');
        expect(Object.keys(inviteToken)).to.have.length(2);
      }
    );

    Object.keys(tokenInviteTypeToTargetModelMapping).forEach(inviteType => {
      const privilegesModel =
        get(tokenInviteTypeToTargetModelMapping, `${inviteType}.privileges`);

      if (privilegesModel) {
        it(
          `converts invite privileges for ${inviteType} token`,
          function () {
            const result = editorDataToToken({
              basic: {
                type: 'invite',
                inviteDetails: {
                  inviteType,
                  inviteTargetDetails: {
                    invitePrivilegesDetails: {
                      privileges: ['space_view'],
                    },
                  },
                },
              },
            });
            expect(result).to.have.deep.property(
              'privileges',
              ['space_view']
            );
          }
        );
      } else {
        it(
          `does not convert invite privileges when for ${inviteType} token`,
          function () {
            const result = editorDataToToken({
              basic: {
                type: 'invite',
                inviteDetails: {
                  inviteType,
                  inviteTargetDetails: {
                    invitePrivilegesDetails: {
                      privileges: ['space_view'],
                    },
                  },
                },
              },
            });
            expect(result).to.not.have.property('privileges');
          }
        );
      }
    });

    it(
      'does not convert invite privileges when token is of type access',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
            inviteDetails: {
              inviteType: 'groupJoinGroup',
              inviteTargetDetails: {
                target: {
                  entityType: 'group',
                  entityId: 'abc',
                },
                invitePrivilegesDetails: {
                  privileges: ['space_view'],
                },
              },
            },
          },
        });
        expect(result).to.not.have.property('privileges');
      }
    );

    it(
      'converts infinity usage limit when token is of type invite',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
            inviteDetails: {
              inviteType: 'groupJoinGroup',
              inviteTargetDetails: {
                target: {
                  entityType: 'group',
                  entityId: 'abc',
                },
              },
              usageLimit: {
                usageLimitSelector: 'infinity',
                usageLimitNumber: '2',
              },
            },
          },
        });
        expect(result).to.have.property('usageLimit', 'infinity');
      }
    );

    it(
      'converts number usage limit when token is of type invite',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
            inviteDetails: {
              inviteType: 'groupJoinGroup',
              inviteTargetDetails: {
                target: {
                  entityType: 'group',
                  entityId: 'abc',
                },
              },
              usageLimit: {
                usageLimitSelector: 'number',
                usageLimitNumber: '2',
              },
            },
          },
        });
        expect(result).to.have.property('usageLimit', 2);
      }
    );

    it(
      'does not convert usage limit when token is of type access',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
            inviteDetails: {
              inviteType: 'groupJoinGroup',
              inviteTargetDetails: {
                target: {
                  entityType: 'group',
                  entityId: 'abc',
                },
              },
              usageLimit: {
                usageLimitSelector: 'number',
                usageLimitNumber: '2',
              },
            },
          },
        });
        expect(result).to.not.have.property('usageLimit');
      }
    );

    [
      'invite',
      'access',
    ].forEach(type => {
      it(
        `has no caveats field in returned object if no caveats were enabled (with values) for token of type ${type}`,
        function () {
          const result = editorDataToToken({
            basic: {
              type,
            },
            caveats: Object.assign(
              generateCaveatEntry('expire', false, new Date()),
              generateCaveatEntry('asn', false, [23]),
              generateCaveatEntry('ip', false, ['1.1.1.1']),
              generateCaveatEntry('region', false, {
                regionType: 'whitelist',
                regionList: ['Europe'],
              }),
              generateCaveatEntry('country', false, {
                countryType: 'whitelist',
                countryList: ['PL'],
              }), {
                accessOnlyCaveats: Object.assign(
                  generateCaveatEntry('service', false, [{
                    model: 'service',
                    id: 'test',
                  }]),
                  generateCaveatEntry('interface', false, 'rest'),
                  generateCaveatEntry('readonly', false),
                  generateCaveatEntry('path', false, {
                    pathEntry0: {
                      pathSpace: { entityId: 's1' },
                      pathString: '/abc/def',
                    },
                    __fieldsValueNames: ['pathEntry0'],
                  }),
                  generateCaveatEntry('objectId', false, {
                    objectIdEntry0: '1234567890',
                    __fieldsValueNames: ['objectIdEntry0'],
                  }),
                ),
              }),
          });
          expect(result).to.not.have.property('caveats');
        }
      );

      it(
        `has no caveats field in returned object if all caveats with additional values were enabled (additional values are empty) for token of type ${type}`,
        function () {
          const result = editorDataToToken({
            basic: {
              type,
            },
            caveats: Object.assign(
              generateCaveatEntry('expire', true),
              generateCaveatEntry('asn', true, []),
              generateCaveatEntry('ip', true, []),
              generateCaveatEntry('region', true, {
                regionType: undefined,
                regionList: [],
              }),
              generateCaveatEntry('country', true, {
                countryType: undefined,
                countryList: [],
              }), {
                accessOnlyCaveats: Object.assign(
                  generateCaveatEntry('service', true, []),
                  generateCaveatEntry('interface', true),
                  generateCaveatEntry('path', true, {
                    __fieldsValueNames: [],
                  }),
                  generateCaveatEntry('objectId', true, {
                    __fieldsValueNames: [],
                  }),
                ),
              }),
          });
          expect(result).to.not.have.property('caveats');
        }
      );
    });

    it('converts expire caveat', function () {
      const expireDate = new Date();
      const expireTimestamp = expireDate.valueOf() / 1000;
      const result = editorDataToToken({
        caveats: generateCaveatEntry('expire', true, expireDate),
      });

      expect(result).to.have.deep.nested.property('caveats[0]', {
        type: 'time',
        validUntil: expireTimestamp,
      });
    });

    [
      'asn',
      'ip',
    ].forEach(caveatName => {
      it(`converts ${caveatName} caveat`, function () {
        const whitelist = ['A', 'B'];
        const result = editorDataToToken({
          caveats: generateCaveatEntry(caveatName, true, whitelist),
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: caveatName,
          whitelist,
        });
      });

      it(
        `does not convert ${caveatName} caveat when whitelist is empty`,
        function () {
          const result = editorDataToToken({
            caveats: generateCaveatEntry(caveatName, true, []),
          });

          expect(result).to.not.have.property('caveats');
        }
      );
    });

    [
      'region',
      'country',
    ].forEach(caveatName => {
      [
        'whitelist',
        'blacklist',
      ].forEach(type => {
        it(`converts ${caveatName} caveat with ${type}`, function () {
          const list = ['A', 'B'];
          const result = editorDataToToken({
            caveats: generateCaveatEntry(caveatName, true, {
              [`${caveatName}Type`]: type,
              [`${caveatName}List`]: list,
            }),
          });

          expect(result).to.have.deep.nested.property('caveats[0]', {
            type: `geo.${caveatName}`,
            filter: type,
            list,
          });
        });

        it(
          `does not convert ${caveatName} caveat with ${type} when countries list is empty`,
          function () {
            const result = editorDataToToken({
              caveats: generateCaveatEntry(caveatName, true, {
                [`${caveatName}Type`]: type,
                [`${caveatName}List`]: [],
              }),
            });

            expect(result).to.not.have.property('caveats');
          }
        );
      });

      it(
        `does not convert ${caveatName} caveat when filter type is not provided`,
        function () {
          const result = editorDataToToken({
            caveats: generateCaveatEntry(caveatName, true, {
              [`${caveatName}Type`]: undefined,
              [`${caveatName}List`]: ['A'],
            }),
          });

          expect(result).to.not.have.property('caveats');
        }
      );
    });

    it('does not convert service caveat, when token is not of type "access"', function () {
      const result = editorDataToToken({
        basic: {
          type: 'invite',
        },
        caveats: {
          accessOnlyCaveats: generateCaveatEntry('service', true, [{
            model: 'service',
            id: 'test',
          }]),
        },
      });

      expect(result).to.not.have.property('caveats');
    });

    it('converts service caveat, when token is not of type "access"', function () {
      const selectedValues = _.flatten(['service', 'serviceOnepanel']
        .map(model => ([{
          model,
          record: {
            type: 'oneprovider',
            entityId: 'op0',
          },
        }, {
          model,
          id: 'customid',
        }, {
          model,
          record: {
            type: 'onezone',
            entityId: 'oz0',
          },
        }, {
          model,
          record: {
            representsAll: 'service',
          },
        }])));
      const result = editorDataToToken({
        basic: {
          type: 'access',
        },
        caveats: {
          accessOnlyCaveats: generateCaveatEntry('service', true, selectedValues),
        },
      });

      expect(result).to.have.deep.nested.property('caveats[0]', {
        type: 'service',
        whitelist: [
          'opw-op0',
          'opw-customid',
          'ozw-onezone',
          'opw-*',
          'opp-op0',
          'opp-customid',
          'ozp-onezone',
          'opp-*',
        ],
      });
    });

    it(
      'does not convert interface caveat, when token is not of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('interface', true, 'rest'),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts interface caveat, when token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('interface', true, 'rest'),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'interface',
          interface: 'rest',
        });
      }
    );

    it(
      'does not convert interface caveat, when caveat is empty and token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('interface', true, undefined),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'does not convert readonly caveat, when token is not of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('readonly', true),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts readonly caveat, when token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('readonly', true),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.readonly',
        });
      }
    );

    it(
      'does not convert path caveat, when token is not of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('path', true, {
              pathEntry0: {
                pathSpace: { entityId: 's1' },
                pathString: '/abc/def',
              },
              __fieldsValueNames: ['pathEntry0'],
            }),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts path caveat, when token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('path', true, {
              pathEntry0: {
                pathSpace: { entityId: 's1' },
                pathString: '/abc/def',
              },
              pathEntry1: {
                pathSpace: { entityId: 's2' },
                pathString: '/abc/def/ghi',
              },
              __fieldsValueNames: ['pathEntry0', 'pathEntry1'],
            }),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.path',
          whitelist: [
            'L3MxL2FiYy9kZWY=', // /s1/abc/def
            'L3MyL2FiYy9kZWYvZ2hp', // /s2/abc/def/ghi
          ],
        });
      }
    );

    it(
      'converts path caveat, when token is of type "access" and one of paths does not have space specified',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('path', true, {
              pathEntry0: {
                pathSpace: undefined,
                pathString: '/abc/def',
              },
              pathEntry1: {
                pathSpace: { entityId: 's2' },
                pathString: '/abc/def/ghi',
              },
              __fieldsValueNames: ['pathEntry0', 'pathEntry1'],
            }),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.path',
          whitelist: [
            'L3MyL2FiYy9kZWYvZ2hp', // /s2/abc/def/ghi
          ],
        });
      }
    );

    it(
      'does not convert path caveat, when caveat is empty and token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('path', true, {
              __fieldsValueNames: [],
            }),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'does not convert objectId caveat, when token is not of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('objectId', true, {
              objectIdEntry0: '1234567890',
              __fieldsValueNames: ['objectIdEntry0'],
            }),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts objectId caveat, when token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('objectId', true, {
              objectIdEntry0: '1234567890',
              objectIdEntry1: '0123456789',
              __fieldsValueNames: ['objectIdEntry0', 'objectIdEntry1'],
            }),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.objectid',
          whitelist: [
            '1234567890',
            '0123456789',
          ],
        });
      }
    );

    it(
      'does not convert objectId caveat, when caveat is empty and token is of type "access"',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            accessOnlyCaveats: generateCaveatEntry('objectId', true, {
              __fieldsValueNames: [],
            }),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts all caveats when all of them are enabled and have a value',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: Object.assign(
            generateCaveatEntry('expire', true, new Date()),
            generateCaveatEntry('asn', true, [23]),
            generateCaveatEntry('ip', true, ['1.1.1.1']),
            generateCaveatEntry('region', true, {
              regionType: 'whitelist',
              regionList: ['Europe'],
            }),
            generateCaveatEntry('country', true, {
              countryType: 'whitelist',
              countryList: ['PL'],
            }), {
              accessOnlyCaveats: Object.assign(
                generateCaveatEntry('service', true, [{
                  model: 'service',
                  id: 'test',
                }]),
                generateCaveatEntry('interface', true, 'rest'),
                generateCaveatEntry('readonly', true),
                generateCaveatEntry('path', true, {
                  pathEntry0: {
                    pathSpace: { entityId: 's1' },
                    pathString: '/abc/def',
                  },
                  __fieldsValueNames: ['pathEntry0'],
                }),
                generateCaveatEntry('objectId', true, {
                  objectIdEntry0: '1234567890',
                  __fieldsValueNames: ['objectIdEntry0'],
                }),
              ),
            }),
        });
        expect(get(result, 'caveats')).to.be.an('array').with.length(10);
      }
    );
  });
});

function generateCaveatEntry(caveatName, isEnabled, value) {
  return {
    [`${caveatName}Caveat`]: {
      [`${caveatName}Enabled`]: isEnabled,
      [caveatName]: value,
    },
  };
}
