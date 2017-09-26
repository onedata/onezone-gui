import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { A } from '@ember/array';

describe('Unit | Utility | generate development model', function () {
  it('creates and saves records', function (done) {
    const stubsToCheck = [];

    function createModelStub(modelName, properties) {
      return EmberObject
        .reopenClass({
          modelName,
        })
        .extend({
          id: 'some_id',
          init() {
            const save = sinon.stub(this, 'save');
            save.resolves(this);
            stubsToCheck.push(save);

            this.set('list', A());
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
        'spaceList', 'groupList', 'providerList',
        'space', 'group', 'provider',
      ].forEach(modelName =>
        expect(createRecord).to.be.calledWith(modelName, sinon.match.object)
      );
      stubsToCheck.forEach(stub => expect(stub).to.be.calledOnce);
      done();
    });
  });
});
