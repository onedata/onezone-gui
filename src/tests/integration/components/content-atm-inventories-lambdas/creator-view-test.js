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
  'Integration | Component | content atm inventories lambdas/creator view',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/creator-view', {
      integration: true,
    });

    beforeEach(function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      this.setProperties({
        atmInventory: {
          entityId: 'someId',
        },
        backSlideSpy: sinon.spy(),
        atmLambdaAddedSpy: sinon.spy(),
        createCreateAtmLambdaActionStub: sinon.stub(workflowActions, 'createCreateAtmLambdaAction'),
      });
    });

    it('has class "content-atm-inventories-lambdas-creator-view"', function () {
      this.render(hbs `{{content-atm-inventories-lambdas/creator-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-lambdas-creator-view')
        .and.to.have.length(1);
    });

    it('has header "Add new lambda"', async function () {
      await render(this);

      expect(this.$('.header-row h1').text().trim()).to.equal('Add new lambda');
    });

    it('shows lambda creator in "create" mode', async function () {
      await render(this);

      const $form = this.$('.atm-lambda-form');
      expect($form).to.exist.and.to.have.class('mode-create');
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await render(this);

      const backSlideSpy = this.get('backSlideSpy');
      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('calls "onAtmLambdaAdded" and resets form when lambda has been created',
      async function () {
        const {
          atmInventory,
          createCreateAtmLambdaActionStub,
          atmLambdaAddedSpy,
        } = this.getProperties(
          'atmInventory',
          'createCreateAtmLambdaActionStub',
          'atmLambdaAddedSpy'
        );
        const createdRecord = {};
        createCreateAtmLambdaActionStub.returns({
          execute: () => resolve({
            status: 'done',
            result: createdRecord,
          }),
        });
        await render(this);

        expect(atmLambdaAddedSpy).to.be.not.called;

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.dockerImage-field .form-control', 'someImage');
        await click('.btn-submit');

        expect(createCreateAtmLambdaActionStub).to.be.calledOnce
          .and.to.be.calledWith({
            atmInventory,
            rawAtmLambda: sinon.match({ name: 'someName' }),
          });
        expect(atmLambdaAddedSpy).to.be.calledOnce
          .and.to.be.calledWith(sinon.match.same(createdRecord));
        expect(this.$('.name-field .form-control')).to.have.value('');
      });

    it('does not call "onAtmLambdaAdded" and does not reset form when lambda creation failed',
      async function () {
        this.get('createCreateAtmLambdaActionStub').returns({
          execute: () => resolve({ status: 'failed' }),
        });
        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.dockerImage-field .form-control', 'someImage');
        await click('.btn-submit');

        expect(this.get('atmLambdaAddedSpy')).to.be.not.called;
        expect(this.$('.name-field .form-control')).to.not.have.value('');
      });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/creator-view
    atmInventory=atmInventory
    onBackSlide=backSlideSpy
    onAtmLambdaAdded=atmLambdaAddedSpy
  }}`);
  await wait();
}
