import { expect } from 'chai';
import { describe, it } from 'mocha';
import { editorDataToToken } from 'onezone-gui/utils/token-editor-utils';
import { inviteTokenSubtypeToTargetModelMapping } from 'onezone-gui/models/token';
import { get, getProperties } from '@ember/object';

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

    it('returns object with type.inviteToken.subtype', function () {
      const result = editorDataToToken({
        basic: {
          type: 'invite',
          inviteDetails: {
            subtype: 'groupJoinGroup',
          },
        },
      });
      const inviteToken = result.type.inviteToken;
      expect(inviteToken).to.have.deep.property('subtype', 'groupJoinGroup');
      expect(Object.keys(inviteToken)).to.have.length(1);
    });

    Object.keys(inviteTokenSubtypeToTargetModelMapping).forEach(subtype => {
      const {
        idFieldName,
        modelName,
      } = getProperties(
        get(inviteTokenSubtypeToTargetModelMapping, subtype),
        'idFieldName',
        'modelName'
      );
      it(
        `returns object with type.inviteToken.{subtype,${idFieldName}} when target is ${modelName} for subtype ${subtype}`,
        function () {
          const result = editorDataToToken({
            basic: {
              type: 'invite',
              inviteDetails: {
                subtype,
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
          expect(inviteToken).to.have.deep.property('subtype', subtype);
          expect(inviteToken).to.have.deep.property(idFieldName, 'abc');
          expect(Object.keys(inviteToken)).to.have.length(2);
        }
      );
    });

    it(
      'returns object without specified token invite target if target model is not suitable for invitation subtype',
      function () {
        const result = editorDataToToken({
          basic: {
            type: 'invite',
            inviteDetails: {
              subtype: 'groupJoinGroup',
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
        expect(inviteToken).to.not.have.deep.property('clusterId', 'abc');
        expect(inviteToken).to.not.have.deep.property('groupId', 'abc');
        expect(Object.keys(inviteToken)).to.have.length(1);
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
            type: caveatName,
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
            accessOnlyCaveats: generateCaveatEntry('interface', true,
              undefined),
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
        expect(get(result, 'caveats')).to.be.an('array').with.length(9);
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
