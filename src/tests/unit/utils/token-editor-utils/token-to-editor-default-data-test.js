import { expect } from 'chai';
import { describe, it } from 'mocha';
import { tokenToEditorDefaultData } from 'onezone-gui/utils/token-editor-utils';
import { get } from '@ember/object';
import _ from 'lodash';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve, reject } from 'rsvp';
import moment from 'moment';

describe('Unit | Utility | token editor utils/token to editor default data', function () {
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
        const correctResult = [{
          record: {
            entityId: '1',
          },
          model: 'service',
        }, {
          id: 'unknown',
          model: 'service',
        }, {
          record: {
            name: 'onezone',
          },
          model: 'service',
        }, {
          record: {
            representsAll: 'service',
          },
          model: 'service',
        }, {
          record: {
            entityId: '1',
            type: 'oneprovider',
          },
          model: 'serviceOnepanel',
        }, {
          id: 'unknown',
          model: 'serviceOnepanel',
        }, {
          record: {
            entityId: 'ozid',
            type: 'onezone',
          },
          model: 'serviceOnepanel',
        }, {
          record: {
            representsAll: 'serviceOnepanel',
          },
          model: 'serviceOnepanel',
        }];
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

function getRecordMock(modelName, entityId) {
  if (entityId === 'unknown') {
    return reject();
  }

  switch (modelName) {
    case 'cluster': {
      if (entityId === 'onezone') {
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
    }
    case 'onezone':
      return resolve({
        name: 'onezone',
      });
    default:
      return resolve({ entityId });
  }
}
