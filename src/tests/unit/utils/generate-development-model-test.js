import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { Promise, resolve } from 'rsvp';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import gri from 'onedata-gui-websocket-client/utils/gri';

describe('Unit | Utility | generate development model', function () {
  it('creates and saves records', function () {
    const stubsToCheck = [];

    function createModelStub(modelName, properties) {
      return EmberObject
        .reopenClass({
          modelName,
        })
        .extend({
          id: 'sth.7g35du7c.instance',
          gri: 'sth.7g35du7c.instance',
          entityId: '7g35du7c',
          init() {
            const save = sinon.stub(this, 'save');
            save.resolves(this);
            stubsToCheck.push(save);
            const list = A();
            list.save = () => Promise.resolve();
            this.set('list', PromiseArray.create({
              promise: Promise.resolve(list),
            }));
          },
          save() {},
          then(callback) {
            return resolve(callback(this));
          },
        })
        .create(properties);
    }

    const StoreStub = {
      createRecord(modelName, props) {
        return createModelStub(modelName, props);
      },
      userGri() {
        return gri({
          entityType: 'user',
          entityId: 'user_id',
          aspect: 'instance',
        });
      },
    };

    const createRecord = sinon.spy(StoreStub, 'createRecord');

    return generateDevelopmentModel(StoreStub)
      .then(() => {
        [
          'user', 'sharedUser',
          'spaceList', 'groupList', 'providerList', 'tokenList',
          'linkedAccountList', 'harvesterList', 'indexList', 'shareList',
          'space', 'group', 'provider', 'token', 'linkedAccount',
          'privilege', 'harvester', 'index', 'guiMessage', 'share',
        ].forEach(modelName =>
          expect(createRecord, `createRecord for ${modelName}`)
          .to.be.calledWith(modelName, sinon.match.object)
        );
        stubsToCheck.forEach(stub => expect(stub).to.be.called);
      });
  });
});
