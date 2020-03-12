import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  creatorDataToToken,
  editorDataToDiffObject,
  tokenToEditorDefaultData,
} from 'onezone-gui/utils/token-editor-utils';
import { tokenInviteTypeToTargetModelMapping } from 'onezone-gui/models/token';
import { get, getProperties } from '@ember/object';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, reject } from 'rsvp';
import moment from 'moment';

describe('Unit | Utility | token editor utils', function () {
  describe('creator data to token', function () {
    it('converts name', function () {
      const result = creatorDataToToken({
        basic: {
          name: 'asd',
        },
      });
      expect(result).to.have.property('name', 'asd');
    });

    [
      'access',
      'identity',
      'invite',
    ].forEach(typeName => {
      it(
        `returns object with type.${typeName}Token if type is '${typeName}'`,
        function () {
          const result = creatorDataToToken({
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

    it('returns object with type.inviteToken.inviteType when inviteType is specified', function () {
      const result = creatorDataToToken({
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
            const result = creatorDataToToken({
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
        const result = creatorDataToToken({
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
        expect(inviteToken).to.not.have.property('clusterId');
        expect(inviteToken).to.not.have.property('groupId');
        expect(Object.keys(inviteToken)).to.have.length(1);
      }
    );

    it(
      'returns object with current user as a target model when inviteType is registerOneprovider',
      function () {
        const currentUser = { entityId: 'user1' };
        const result = creatorDataToToken({
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
            const result = creatorDataToToken({
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
            expect(result).to.have.deep.property('privileges', ['space_view']);
          }
        );
      } else {
        it(
          `does not convert invite privileges when for ${inviteType} token`,
          function () {
            const result = creatorDataToToken({
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

    [
      'access',
      'identity',
    ].forEach(tokenType => {
      it(
        `does not convert invite privileges when token is of type ${tokenType}`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type: tokenType,
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
    });

    it(
      'converts infinity usage limit when token is of type invite',
      function () {
        const result = creatorDataToToken({
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
                usageLimitType: 'infinity',
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
        const result = creatorDataToToken({
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
                usageLimitType: 'number',
                usageLimitNumber: '2',
              },
            },
          },
        });
        expect(result).to.have.property('usageLimit', 2);
      }
    );

    [
      'access',
      'identity',
    ].forEach(tokenType => {
      it(
        `does not convert usage limit when token is of type ${tokenType}`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type: tokenType,
              inviteDetails: {
                inviteType: 'groupJoinGroup',
                inviteTargetDetails: {
                  target: {
                    entityType: 'group',
                    entityId: 'abc',
                  },
                },
                usageLimit: {
                  usageLimitType: 'number',
                  usageLimitNumber: '2',
                },
              },
            },
          });
          expect(result).to.not.have.property('usageLimit');
        }
      );
    });

    [
      'invite',
      'identity',
      'access',
    ].forEach(type => {
      it(
        `has no caveats field in returned object if no caveats were enabled (but are not empty) for token of type ${type}`,
        function () {
          const result = creatorDataToToken({
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
              }),
              generateCaveatEntry('consumer', false, [{
                model: 'user',
                id: 'test',
              }]),
              generateCaveatEntry('service', false, [{
                model: 'service',
                id: 'test',
              }]),
              generateCaveatEntry('interface', false, 'rest'), {
                dataAccessCaveats: Object.assign(
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
              }
            ),
          });
          expect(result).to.not.have.property('caveats');
        }
      );

      it(
        `has no caveats field in returned object if all caveats that need extra data were enabled (but are empty) for token of type ${type}`,
        function () {
          const result = creatorDataToToken({
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
              }),
              generateCaveatEntry('service', true, []),
              generateCaveatEntry('consumer', true, []),
              generateCaveatEntry('interface', true), {
                dataAccessCaveats: Object.assign(
                  generateCaveatEntry('path', true, {
                    __fieldsValueNames: [],
                  }),
                  generateCaveatEntry('objectId', true, {
                    __fieldsValueNames: [],
                  }),
                ),
              }
            ),
          });
          expect(result).to.not.have.property('caveats');
        }
      );
    });

    it('converts expire caveat', function () {
      const expireDate = new Date();
      const expireTimestamp = Math.floor(expireDate.valueOf() / 1000);
      const result = creatorDataToToken({
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
        const result = creatorDataToToken({
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
          const result = creatorDataToToken({
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
          const result = creatorDataToToken({
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
            const result = creatorDataToToken({
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
          const result = creatorDataToToken({
            caveats: generateCaveatEntry(caveatName, true, {
              [`${caveatName}Type`]: undefined,
              [`${caveatName}List`]: ['A'],
            }),
          });

          expect(result).to.not.have.property('caveats');
        }
      );
    });

    it('converts consumer caveat', function () {
      const selectedValues = _.flatten(['user', 'group', 'provider']
        .map(model => ([{
          model,
          record: {
            entityId: 'id0',
          },
        }, {
          model,
          id: 'customid',
        }, {
          model,
          record: {
            representsAll: model,
          },
        }]))
      );
      const result = creatorDataToToken({
        caveats: generateCaveatEntry('consumer', true, selectedValues),
      });

      expect(result).to.have.deep.nested.property('caveats[0]', {
        type: 'consumer',
        whitelist: [
          'usr-id0',
          'usr-customid',
          'usr-*',
          'grp-id0',
          'grp-customid',
          'grp-*',
          'prv-id0',
          'prv-customid',
          'prv-*',
        ],
      });
    });

    [
      'identity',
      'invite',
    ].forEach(type => {
      it(`does not convert service caveat, when token is of type "${type}"`, function () {
        const result = creatorDataToToken({
          basic: {
            type,
          },
          caveats: generateCaveatEntry('service', true, [{
            model: 'service',
            id: 'test',
          }]),
        });

        expect(result).to.not.have.property('caveats');
      });
    });

    it('converts service caveat, when token is of type "access"', function () {
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
        }]))
      );
      const result = creatorDataToToken({
        basic: {
          type: 'access',
        },
        caveats: generateCaveatEntry('service', true, selectedValues),
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
      'does not convert interface caveat, when token is of type "invite"',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'invite',
          },
          caveats: generateCaveatEntry('interface', true, 'rest'),
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    [
      'access',
      'identity',
    ].forEach(type => {
      it(
        `converts interface caveat, when token is of type "${type}"`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type,
            },
            caveats: generateCaveatEntry('interface', true, 'rest'),
          });

          expect(result).to.have.deep.nested.property('caveats[0]', {
            type: 'interface',
            interface: 'rest',
          });
        }
      );
    });

    it(
      'does not convert interface caveat, when caveat is empty and token is of type "access"',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: generateCaveatEntry('interface', true, undefined),
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts readonly caveat, when token is of type "access"',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('readonly', true),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.readonly',
        });
      }
    );

    [
      'invite',
      'identity',
    ].forEach(type => {
      it(
        `does not convert readonly caveat, when token is not of type "${type}"`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type,
            },
            caveats: {
              dataAccessCaveats: generateCaveatEntry('readonly', true),
            },
          });

          expect(result).to.not.have.property('caveats');
        }
      );

      it(
        `does not convert path caveat, when token is not of type "${type}"`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type,
            },
            caveats: {
              dataAccessCaveats: generateCaveatEntry('path', true, {
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
        `does not convert objectId caveat, when token is not of type "${type}"`,
        function () {
          const result = creatorDataToToken({
            basic: {
              type,
            },
            caveats: {
              dataAccessCaveats: generateCaveatEntry('objectId', true, {
                objectIdEntry0: '1234567890',
                __fieldsValueNames: ['objectIdEntry0'],
              }),
            },
          });

          expect(result).to.not.have.property('caveats');
        }
      );
    });

    it(
      'converts path caveat, when token is of type "access"',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('path', true, {
              pathEntry0: {
                pathSpace: { entityId: 's1' },
                pathString: '/abc/def',
              },
              pathEntry1: {
                pathSpace: { entityId: 's1' },
                pathString: '/abc/def/',
              },
              pathEntry2: {
                pathSpace: { entityId: 's1' },
                pathString: '/',
              },
              pathEntry3: {
                pathSpace: { entityId: 's1' },
                pathString: undefined,
              },
              pathEntry4: {
                pathSpace: { entityId: 's2' },
                pathString: '/abc/def/ghi',
              },
              __fieldsValueNames: [
                'pathEntry0',
                'pathEntry1',
                'pathEntry2',
                'pathEntry3',
                'pathEntry4',
              ],
            }),
          },
        });

        expect(result).to.have.deep.nested.property('caveats[0]', {
          type: 'data.path',
          whitelist: [
            'L3MxL2FiYy9kZWY=', // /s1/abc/def
            'L3MxL2FiYy9kZWY=', // /s1/abc/def/
            'L3Mx', // /s1/
            'L3Mx', // /s1
            'L3MyL2FiYy9kZWYvZ2hp', // /s2/abc/def/ghi
          ],
        });
      }
    );

    it(
      'converts path caveat, when token is of type "access" and one of paths does not have space specified',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('path', true, {
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
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('path', true, {
              __fieldsValueNames: [],
            }),
          },
        });

        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'converts objectId caveat, when token is of type "access"',
      function () {
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('objectId', true, {
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
        const result = creatorDataToToken({
          basic: {
            type: 'access',
          },
          caveats: {
            dataAccessCaveats: generateCaveatEntry('objectId', true, {
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
        const result = creatorDataToToken({
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
            }),
            generateCaveatEntry('consumer', true, [{
              model: 'user',
              id: 'test',
            }]),
            generateCaveatEntry('service', true, [{
              model: 'service',
              id: 'test',
            }]),
            generateCaveatEntry('interface', true, 'rest'), {
              dataAccessCaveats: Object.assign(
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
        expect(get(result, 'caveats')).to.be.an('array').with.length(11);
      }
    );
  });

  describe('editor data to diff object', function () {
    it('converts name if it has been changed', function () {
      const result = editorDataToDiffObject({
        basic: {
          name: 'token2',
        },
      }, {
        name: 'token1',
      });

      expect(result).to.have.property('name', 'token2');
    });

    it('does not convert name if it has not been changed', function () {
      const result = editorDataToDiffObject({
        basic: {
          name: 'token1',
        },
      }, {
        name: 'token1',
      });

      expect(result).to.not.have.property('name');
    });

    it('converts revoked if it has been changed', function () {
      const result = editorDataToDiffObject({
        basic: {
          revoked: true,
        },
      }, {
        revoked: false,
      });

      expect(result).to.have.property('revoked', true);
    });

    it('does not convert revoked if it has not been changed', function () {
      const result = editorDataToDiffObject({
        basic: {
          revoked: false,
        },
      }, {
        revoked: false,
      });

      expect(result).to.not.have.property('revoked');
    });
  });

  describe('token to editor default data', function () {
    it('converts name', function () {
      const result = tokenToEditorDefaultData({ name: 't1' });

      expect(get(result, 'name')).to.equal('t1');
    });

    it('converts revoked', function () {
      const result = tokenToEditorDefaultData({ revoked: true });

      expect(get(result, 'revoked')).to.be.true;
    });

    it('converts token string', function () {
      const result = tokenToEditorDefaultData({ token: 'abc' });

      expect(get(result, 'tokenString')).to.equal('abc');
    });

    it('converts type', function () {
      const result = tokenToEditorDefaultData({ typeName: 'identity' });

      expect(get(result, 'type')).to.equal('identity');
    });

    it('converts invite type', function () {
      const result = tokenToEditorDefaultData({ inviteType: 'userJoinSpace' });

      expect(get(result, 'inviteType')).to.equal('userJoinSpace');
    });

    it('converts invite target (fetch success)', function () {
      const tokenTargetProxy = PromiseObject.create({ promise: resolve('sth') });
      const result = tokenToEditorDefaultData({ tokenTargetProxy });

      return get(result, 'inviteTargetProxy').then(record =>
        expect(record).to.equal('sth')
      );
    });

    it('converts invite target (id not specified, fetched null)', function () {
      const tokenTargetProxy = PromiseObject.create({ promise: resolve(null) });
      const result = tokenToEditorDefaultData({
        tokenTargetProxy,
        targetModelName: 'space',
      });

      return get(result, 'inviteTargetProxy').then(record =>
        expect(record).to.deep.equal({
          entityId: undefined,
          entityType: 'space',
          name: 'ID: unknown',
        })
      );
    });

    it('converts invite target (id specified, fetched null)', function () {
      const tokenTargetProxy = PromiseObject.create({ promise: resolve(null) });
      const result = tokenToEditorDefaultData({
        tokenTargetProxy,
        targetModelName: 'space',
        targetRecordId: 'space1',
      });

      return get(result, 'inviteTargetProxy').then(record =>
        expect(record).to.deep.equal({
          entityId: 'space1',
          entityType: 'space',
          name: 'ID: space1',
        })
      );
    });

    it('converts invite target (fetch error)', function () {
      const tokenTargetProxy = PromiseObject.create({ promise: reject('error') });
      const result = tokenToEditorDefaultData({
        tokenTargetProxy,
        targetModelName: 'space',
        targetRecordId: 'space1',
      });

      return get(result, 'inviteTargetProxy').then(record =>
        expect(record).to.deep.equal({
          entityId: 'space1',
          entityType: 'space',
          name: 'ID: space1',
        })
      );
    });

    it('converts privileges', function () {
      const privileges = ['space_view'];
      const result = tokenToEditorDefaultData({ privileges });

      expect(get(result, 'privileges')).to.equal(privileges);
    });

    it('converts usageLimit', function () {
      const result = tokenToEditorDefaultData({ usageLimit: 4 });

      expect(get(result, 'usageLimit')).to.equal(4);
    });

    it('converts usageCount', function () {
      const result = tokenToEditorDefaultData({ usageCount: 3 });

      expect(get(result, 'usageCount')).to.equal(3);
    });

    it(
      'returns result with empty caveats object, when no caveats were passed',
      function () {
        const result = tokenToEditorDefaultData({ caveats: [] });

        expect(Object.keys(get(result, 'caveats'))).to.be.empty;
      }
    );

    it('converts time caveat', function () {
      const expireTimestamp = Math.floor(new Date().valueOf() / 1000);

      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'time',
          validUntil: expireTimestamp,
        }],
      });

      const caveatValue = get(result, 'caveats.expire');
      expect(caveatValue).to.be.an.instanceof(Date);
      expect(moment(caveatValue).unix()).to.equal(expireTimestamp);
    });

    [
      'region',
      'country',
    ].forEach(caveatName => {
      it(`converts ${caveatName} caveat`, function () {
        const list = ['abc', 'def'];

        const result = tokenToEditorDefaultData({
          caveats: [{
            type: `geo.${caveatName}`,
            filter: 'blacklist',
            list,
          }],
        });

        const caveatValue = get(result, `caveats.${caveatName}`);
        expect(get(caveatValue, 'type')).to.equal('blacklist');
        expect(get(caveatValue, 'list')).to.equal(list);
      });
    });

    [
      'asn',
      'ip',
    ].forEach(caveatName => {
      it(`converts ${caveatName} caveat`, function () {
        const whitelist = ['abc', 'def'];

        const result = tokenToEditorDefaultData({
          caveats: [{
            type: caveatName,
            whitelist,
          }],
        });

        expect(get(result, `caveats.${caveatName}`)).to.equal(whitelist);
      });
    });

    it('converts consumer caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'consumer',
          whitelist: [
            'usr-1',
            'usr-unknown',
            'usr-*',
            'grp-1',
            'grp-unknown',
            'grp-*',
            'prv-1',
            'prv-unknown',
            'prv-*',
          ],
        }],
      }, getRecordMock);

      return get(result, 'caveats.consumer')
        .then(consumer => {
          const correctResult = _.flatten(
            ['user', 'group', 'provider'].map(modelName => [{
              record: {
                entityId: '1',
              },
              model: modelName,
            }, {
              id: 'unknown',
              model: modelName,
            }, {
              record: {
                representsAll: modelName,
              },
              model: modelName,
            }])
          );
          expect(consumer).to.deep.equal(correctResult);
        });
    });

    it('converts service caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'service',
          whitelist: [
            'opw-1',
            'opw-unknown',
            'ozw-onezone',
            'opw-*',
            'opp-1',
            'opp-unknown',
            'ozp-onezone',
            'opp-*',
          ],
        }],
      }, getRecordMock);

      return get(result, 'caveats.service')
        .then(consumer => {
          const correctResult = _.flatten(
            ['service', 'serviceOnepanel'].map(modelName => [{
              record: {
                entityId: '1',
                type: 'oneprovider',
              },
              model: modelName,
            }, {
              id: 'unknown',
              model: modelName,
            }, {
              record: {
                entityId: 'ozid',
                type: 'onezone',
              },
              model: modelName,
            }, {
              record: {
                representsAll: modelName,
              },
              model: modelName,
            }])
          );
          expect(consumer).to.deep.equal(correctResult);
        });
    });

    it('converts interface caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'interface',
          interface: 'oneclient',
        }],
      });

      expect(get(result, 'caveats.interface')).to.equal('oneclient');
    });

    it('converts readonly caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'data.readonly',
        }],
      });

      expect(get(result, 'caveats.readonly')).to.equal(true);
    });

    it('converts path caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'data.path',
          whitelist: [
            'L3MxL2FiYy9kZWY=', // /s1/abc/def
            'L3Mx', // /s1
            'L3Vua25vd24vYWJjL2RlZi9naGk=', // /unknown/abc/def/ghi (non-existing space)
          ],
        }],
      }, getRecordMock);

      return get(result, 'caveats.path').then(pathCaveat => {
        expect(pathCaveat).to.deep.equal({
          pathEntry0: {
            pathSpace: {
              entityId: 's1',
            },
            pathString: '/abc/def',
          },
          pathEntry1: {
            pathSpace: {
              entityId: 's1',
            },
            pathString: '/',
          },
          pathEntry2: {
            pathSpace: {
              entityId: 'unknown',
            },
            pathString: '/abc/def/ghi',
          },
          __fieldsValueNames: ['pathEntry0', 'pathEntry1', 'pathEntry2'],
        });
      });
    });

    it('converts objectId caveat', function () {
      const result = tokenToEditorDefaultData({
        caveats: [{
          type: 'data.objectid',
          whitelist: [
            'abc',
            'def',
          ],
        }],
      });

      expect(get(result, 'caveats.objectId')).to.deep.equal({
        objectIdEntry0: 'abc',
        objectIdEntry1: 'def',
        __fieldsValueNames: ['objectIdEntry0', 'objectIdEntry1'],
      });
    });
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

function getRecordMock(modelName, entityId) {
  if (modelName === 'cluster') {
    if (entityId === 'unknown') {
      return reject();
    } else if (entityId === 'onezone') {
      return resolve({
        entityId: 'ozid',
        type: 'onezone',
      });
    } else {
      return resolve({
        entityId,
        type: 'oneprovider',
      });
    }
  } else {
    return entityId === 'unknown' ? reject() : resolve({ entityId });
  }
}
