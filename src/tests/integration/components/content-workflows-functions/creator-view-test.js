import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { lookupService } from '../../../helpers/stub-service';
import { resolve } from 'rsvp';

describe(
  'Integration | Component | content workflows functions/creator view',
  function () {
    setupComponentTest('content-workflows-functions/creator-view', {
      integration: true,
    });

    beforeEach(function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      this.setProperties({
        workflowDirectory: {
          entityId: 'someId',
        },
        backSlideSpy: sinon.spy(),
        functionAddedSpy: sinon.spy(),
        createCreateLambdaFunctionActionStub: sinon.stub(workflowActions, 'createCreateLambdaFunctionAction'),
      });
    });

    it('has class "content-workflows-functions-creator-view"', function () {
      this.render(hbs `{{content-workflows-functions/creator-view}}`);

      expect(this.$().children()).to.have.class('content-workflows-functions-creator-view')
        .and.to.have.length(1);
    });

    it('has header "Add new function"', async function () {
      await render(this);

      expect(this.$('.header-row h1').text().trim()).to.equal('Add new function');
    });

    it('shows function creator in "create" mode', async function () {
      await render(this);

      const $form = this.$('.lambda-function-form');
      expect($form).to.exist.and.to.have.class('mode-create');
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await render(this);

      const backSlideSpy = this.get('backSlideSpy');
      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('calls "onFunctionAdded" when lambda function has been created',
      async function () {
        const {
          workflowDirectory,
          createCreateLambdaFunctionActionStub,
          functionAddedSpy,
        } = this.getProperties(
          'workflowDirectory',
          'createCreateLambdaFunctionActionStub',
          'functionAddedSpy'
        );
        const createdRecord = {};
        createCreateLambdaFunctionActionStub.returns({
          execute: () => resolve({
            status: 'done',
            result: createdRecord,
          }),
        });
        await render(this);

        expect(functionAddedSpy).to.be.not.called;

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.dockerImage-field .form-control', 'someImage');
        await click('.btn-submit');

        expect(createCreateLambdaFunctionActionStub).to.be.calledOnce
          .and.to.be.calledWith({
            workflowDirectory,
            rawLambdaFunction: sinon.match({ name: 'someName' }),
          });
        expect(functionAddedSpy).to.be.calledOnce
          .and.to.be.calledWith(sinon.match.same(createdRecord));
      });

    it('does not call "onFunctionAdded" when lambda function creation failed',
      async function () {
        this.get('createCreateLambdaFunctionActionStub').returns({
          execute: () => resolve({ status: 'failed' }),
        });
        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.dockerImage-field .form-control', 'someImage');
        await click('.btn-submit');

        expect(this.get('functionAddedSpy')).to.be.not.called;
      });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-workflows-functions/creator-view
    workflowDirectory=workflowDirectory
    onBackSlide=backSlideSpy
    onFunctionAdded=functionAddedSpy
  }}`);
  await wait();
}
