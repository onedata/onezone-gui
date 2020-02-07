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

    it('converts metadata', function () {
      const json = { a: 1 };
      const result = editorDataToToken({
        basic: {
          metadata: JSON.stringify(json),
        },
      });
      expect(result).to.have.deep.property('customMetadata', json);
    });

    it('ignores undefined metadata', function () {
      const result = editorDataToToken({
        basic: {
          metadata: undefined,
        },
      });
      expect(result).to.not.have.property('customMetadata');
    });

    it('ignores empty string metadata', function () {
      const result = editorDataToToken({
        basic: {
          metadata: '',
        },
      });
      expect(result).to.not.have.property('customMetadata');
    });

    it(
      'has no caveats field in returned object if no caveats were enabled (with values)',
      function () {
        const result = editorDataToToken({
          caveats: Object.assign(
            generateCaveatEntry('expire', false, new Date()),
            generateCaveatEntry('asn', false, [23]),
            generateCaveatEntry('ip', false, ['1.1.1.1']),
            generateCaveatEntry('country', false, {
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
                  __fieldsValueNames: [],
                }),
                generateCaveatEntry('objectId', false, {
                  __fieldsValueNames: [],
                }),
              ),
            }),
        });
        expect(result).to.not.have.property('caveats');
      }
    );

    it(
      'has no caveats field in returned object if all caveats with additional values were enabled (additional values are empty)',
      function () {
        const result = editorDataToToken({
          caveats: Object.assign(
            generateCaveatEntry('expire', true),
            generateCaveatEntry('asn', true, []),
            generateCaveatEntry('ip', true, []),
            generateCaveatEntry('country', true, {
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
