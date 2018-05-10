import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { A } from '@ember/array';
import { Promise } from 'rsvp';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

describe('Unit | Utility | generate development model', function () {
  it('creates and saves records', function (done) {
    const stubsToCheck = [];

    function createModelStub(modelName, properties) {
      return EmberObject
        .reopenClass({
          modelName,
        })
        .extend({
          id: 'sth.7g35du7c.instance',
          gri: 'sth.7g35du7c.instance',
          init() {
            const save = sinon.stub(this, 'save');
            save.resolves(this);
            stubsToCheck.push(save);
            const list = A();
            list.save = () => Promise.resolve();
            this.set('list', PromiseObject.create({ promise: Promise.resolve(list) }));
          },
          save() {},
        })
        .create(properties);
    }

    const StoreStub = {
      createRecord(modelName, props) {
        return createModelStub(modelName, props);
      },
    };

    const createRecord = sinon.spy(StoreStub, 'createRecord');

    const promise = generateDevelopmentModel(StoreStub);
    promise.then(() => {
      [
        'user',
        'sharedGroup', 'sharedUser',
        'spaceList', 'groupList', 'providerList', 'clientTokenList',
        'linkedAccountList', 'groupGroupPermissionList', 'groupUserPermissionList',
        'space', 'group', 'provider', 'clientToken', 'linkedAccount',
        'groupGroupPermission', 'groupUserPermission',
      ].forEach(modelName =>
        expect(createRecord, `createRecord for ${modelName}`).to.be.calledWith(
          modelName, sinon.match.object)
      );
      stubsToCheck.forEach(stub => expect(stub).to.be.called);
      done();
    });
  });
});
