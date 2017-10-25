import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import EmberObject from '@ember/object';
import RoutesDevelopmentModelMixin from 'onedata-gui-websocket-client/mixins/routes/development-model';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

const storeStub = {};
const envConfig = {};

describe('Unit | Mixin | routes/development model', function () {
  beforeEach(function () {
    this.RoutesDevelopmentModelObject =
      EmberObject.extend(RoutesDevelopmentModelMixin, {
        envConfig,
        store: storeStub,
        generateDevelopmentModel() {},
        clearDevelopmentModel: () => Promise.resolve(), 
        isDevelopment() {},
        isModelMocked() {},
      });
  });

  it('resolves beforeModel if model is already mocked', function (done) {
    let subject = this.RoutesDevelopmentModelObject.create();

    let generateDevelopmentModel = sinon.stub(subject, 'generateDevelopmentModel');
    let clearDevelopmentModel = sinon.spy(subject, 'clearDevelopmentModel');
    let isDevelopment = sinon.stub(subject, 'isDevelopment');
    isDevelopment.returns(true);
    let isModelMocked = sinon.stub(subject, 'isModelMocked');
    isModelMocked.resolves(true);

    let promise = subject.beforeModel();

    wait().then(() => {
      expect(isDevelopment).to.be.calledOnce;
      expect(isModelMocked).to.be.called;
      expect(clearDevelopmentModel).to.be.called;
      expect(generateDevelopmentModel).to.not.be.called;
      expect(promise).to.eventually.be.fulfilled.notify(done);
    });
  });

  it('invokes generateDevelopmentModel if model is not mocked yet', function (done) {
    let subject = this.RoutesDevelopmentModelObject.create();

    let generateDevelopmentModel = sinon.stub(subject, 'generateDevelopmentModel');
    let clearDevelopmentModel = sinon.spy(subject, 'clearDevelopmentModel');
    generateDevelopmentModel.resolves();
    let isDevelopment = sinon.stub(subject, 'isDevelopment');
    isDevelopment.returns(true);
    let isModelMocked = sinon.stub(subject, 'isModelMocked');
    isModelMocked.resolves(false);

    let promise = subject.beforeModel();
    wait().then(() => {
      expect(isDevelopment).to.be.calledOnce;
      expect(isModelMocked).to.be.called;
      expect(clearDevelopmentModel).to.be.called;
      expect(generateDevelopmentModel).to.be.calledOnce;
      expect(promise).to.eventually.be.fulfilled.notify(done);
    });
  });
});
