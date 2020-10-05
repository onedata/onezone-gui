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
    return tokenToEditorDefaultData({ name: 't1' })
      .then(result => expect(get(result, 'name')).to.equal('t1'));
  });

  it('converts revoked', function () {
    return tokenToEditorDefaultData({ revoked: true })
      .then(result => expect(get(result, 'revoked')).to.be.true);
  });

  it('converts token string', function () {
    return tokenToEditorDefaultData({ token: 'abc' })
      .then(result => expect(get(result, 'tokenString')).to.equal('abc'));
  });

  it('converts type', function () {
    return tokenToEditorDefaultData({ typeName: 'identity' })
      .then(result => expect(get(result, 'type')).to.equal('identity'));
  });

  it('converts invite type', function () {
    return tokenToEditorDefaultData({ inviteType: 'userJoinSpace' })
      .then(result => expect(get(result, 'inviteType')).to.equal('userJoinSpace'));
  });

  it('converts invite target (fetch success)', function () {
    const tokenTargetProxy = PromiseObject.create({ promise: resolve('sth') });
    return tokenToEditorDefaultData({ tokenTargetProxy })
      .then(result => expect(get(result, 'inviteTarget')).to.equal('sth'));
  });

  it('converts invite target (id not specified, fetched null)', function () {
    const tokenTargetProxy = PromiseObject.create({ promise: resolve(null) });
    return tokenToEditorDefaultData({
      tokenTargetProxy,
      targetModelName: 'space',
    }).then(result => expect(get(result, 'inviteTarget')).to.deep.equal({
      entityId: undefined,
      entityType: 'space',
      name: 'ID: unknown',
    }));
  });

  it('converts invite target (id specified, fetched null)', function () {
    const tokenTargetProxy = PromiseObject.create({ promise: resolve(null) });
    return tokenToEditorDefaultData({
      tokenTargetProxy,
      targetModelName: 'space',
      targetRecordId: 'space1',
    }).then(result => expect(get(result, 'inviteTarget')).to.deep.equal({
      entityId: 'space1',
      entityType: 'space',
      name: 'ID: space1',
    }));
  });

  it('converts invite target (fetch error)', function () {
    const tokenTargetProxy = PromiseObject.create({ promise: reject('error') });
    return tokenToEditorDefaultData({
      tokenTargetProxy,
      targetModelName: 'space',
      targetRecordId: 'space1',
    }).then(result => expect(get(result, 'inviteTarget')).to.deep.equal({
      entityId: 'space1',
      entityType: 'space',
      name: 'ID: space1',
    }));
  });

  it('converts privileges', function () {
    const privileges = ['space_view'];
    return tokenToEditorDefaultData({ privileges })
      .then(result => expect(get(result, 'privileges')).to.equal(privileges));
  });

  it('converts usageLimit', function () {
    return tokenToEditorDefaultData({ usageLimit: 4 })
      .then(result => expect(get(result, 'usageLimit')).to.equal(4));
  });

  it('converts usageCount', function () {
    return tokenToEditorDefaultData({ usageCount: 3 })
      .then(result => expect(get(result, 'usageCount')).to.equal(3));
  });

  it(
    'returns result with empty caveats object, when no caveats were passed',
    function () {
      return tokenToEditorDefaultData({ caveats: [] })
        .then(result => expect(Object.keys(get(result, 'caveats'))).to.be.empty);
    }
  );

  it('converts time caveat', function () {
    const expireTimestamp = Math.floor(new Date().valueOf() / 1000);

    return tokenToEditorDefaultData({
      caveats: [{
        type: 'time',
        validUntil: expireTimestamp,
      }],
    }).then(result => {
      const caveatValue = get(result, 'caveats.expire');
      expect(caveatValue).to.be.an.instanceof(Date);
      expect(moment(caveatValue).unix()).to.equal(expireTimestamp);
    });
  });

  [
    'region',
    'country',
  ].forEach(caveatName => {
    it(`converts ${caveatName} caveat`, function () {
      const list = ['abc', 'def'];

      return tokenToEditorDefaultData({
        caveats: [{
          type: `geo.${caveatName}`,
          filter: 'blacklist',
          list,
        }],
      }).then(result => {
        const caveatValue = get(result, `caveats.${caveatName}`);
        expect(get(caveatValue, 'type')).to.equal('blacklist');
        expect(get(caveatValue, 'list')).to.equal(list);
      });
    });
  });

  [
    'asn',
    'ip',
  ].forEach(caveatName => {
    it(`converts ${caveatName} caveat`, function () {
      const whitelist = ['abc', 'def'];

      return tokenToEditorDefaultData({
        caveats: [{
          type: caveatName,
          whitelist,
        }],
      }).then(result => expect(get(result, `caveats.${caveatName}`)).to.equal(whitelist));
    });
  });

  it('converts consumer caveat', function () {
    return tokenToEditorDefaultData({
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
    }, getRecordMock).then(result => {
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
      expect(get(result, 'caveats.consumer')).to.deep.equal(correctResult);
    });
  });

  it('converts service caveat', function () {
    return tokenToEditorDefaultData({
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
    }, getRecordMock).then(result => {
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
      expect(get(result, 'caveats.service')).to.deep.equal(correctResult);
    });
  });

  it('converts interface caveat', function () {
    return tokenToEditorDefaultData({
      caveats: [{
        type: 'interface',
        interface: 'oneclient',
      }],
    }).then(result => expect(get(result, 'caveats.interface')).to.equal('oneclient'));
  });

  it('converts readonly caveat', function () {
    return tokenToEditorDefaultData({
      caveats: [{
        type: 'data.readonly',
      }],
    }).then(result => expect(get(result, 'caveats.readonly')).to.equal(true));
  });

  it('converts path caveat', function () {
    return tokenToEditorDefaultData({
      caveats: [{
        type: 'data.path',
        whitelist: [
          'L3MxL2FiYy9kZWY=', // /s1/abc/def
          'L3Mx', // /s1
          'L3Vua25vd24vYWJjL2RlZi9naGk=', // /unknown/abc/def/ghi (non-existing space)
        ],
      }],
    }, getRecordMock).then(result => {
      expect(get(result, 'caveats.path')).to.deep.equal({
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
    return tokenToEditorDefaultData({
      caveats: [{
        type: 'data.objectid',
        whitelist: [
          'abc',
          'def',
        ],
      }],
    }).then(result => expect(get(result, 'caveats.objectId')).to.deep.equal({
      objectIdEntry0: 'abc',
      objectIdEntry1: 'def',
      __fieldsValueNames: ['objectIdEntry0', 'objectIdEntry1'],
    }));
  });
});

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
