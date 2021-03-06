import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';

describe('Integration | Component | content atm inventories workflows/creator view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/creator-view', {
      integration: true,
    });

    beforeEach(function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      this.setProperties({
        atmInventory: {
          entityId: 'someId',
        },
        backSlideSpy: sinon.spy(),
        atmWorkflowSchemaAddedSpy: sinon.spy(),
        createCreateAtmWorkflowSchemaActionStub: sinon.stub(workflowActions,
          'createCreateAtmWorkflowSchemaAction'),
      });
    });

    it('has class "content-atm-inventories-workflows-creator-view"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/creator-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-workflows-creator-view')
        .and.to.have.length(1);
    });

    it('has header "Add new workflow"', async function () {
      await render(this);

      expect(this.$('.header-row h1').text().trim()).to.equal('Add new workflow');
    });

    it('shows empty workflow schema details form in edit mode', async function () {
      await render(this);

      const $form = this.$('.atm-workflow-schema-details-form');
      expect($form).to.exist;
      expect($form.find('.field-view-mode')).to.not.exist;
      expect($form.find('.name-field .form-control')).to.have.value('');
      expect($form.find('.description-field .form-control')).to.have.value('');
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await render(this);

      const backSlideSpy = this.get('backSlideSpy');
      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('calls "onAtmWorkflowSchemaAdded" when workflow schema has been created',
      async function () {
        const {
          atmInventory,
          createCreateAtmWorkflowSchemaActionStub,
          atmWorkflowSchemaAddedSpy,
        } = this.getProperties(
          'atmInventory',
          'createCreateAtmWorkflowSchemaActionStub',
          'atmWorkflowSchemaAddedSpy'
        );
        const createdRecord = {};
        createCreateAtmWorkflowSchemaActionStub.returns({
          execute: () => resolve({
            status: 'done',
            result: createdRecord,
          }),
        });
        await render(this);

        expect(atmWorkflowSchemaAddedSpy).to.be.not.called;

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.description-field .form-control', 'someDescription');
        await click('.btn-content-info');

        expect(createCreateAtmWorkflowSchemaActionStub).to.be.calledOnce
          .and.to.be.calledWith({
            atmInventory,
            rawAtmWorkflowSchema: sinon.match({
              name: 'someName',
              description: 'someDescription',
            }),
          });
        expect(atmWorkflowSchemaAddedSpy).to.be.calledOnce
          .and.to.be.calledWith(sinon.match.same(createdRecord));
      });

    it('does not call "onAtmWorkflowSchemaAdded" and when workflow schema creation failed',
      async function () {
        this.get('createCreateAtmWorkflowSchemaActionStub').returns({
          execute: () => resolve({ status: 'failed' }),
        });
        await render(this);

        await fillIn('.name-field .form-control', 'someName');
        await click('.btn-content-info');

        expect(this.get('atmWorkflowSchemaAddedSpy')).to.be.not.called;
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/creator-view
    atmInventory=atmInventory
    onBackSlide=backSlideSpy
    onAtmWorkflowSchemaAdded=atmWorkflowSchemaAddedSpy
  }}`);
  await wait();
}
