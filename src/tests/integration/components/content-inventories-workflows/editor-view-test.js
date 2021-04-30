import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';
import EmberObject, { set } from '@ember/object';

describe('Integration | Component | content inventories workflows/editor view',
  function () {
    setupComponentTest('content-inventories-workflows/editor-view', {
      integration: true,
    });

    beforeEach(function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      this.setProperties({
        atmWorkflowSchema: EmberObject.create({
          name: 'workflow1',
        }),
        backSlideSpy: sinon.spy(),
        createModifyAtmWorkflowSchemaActionStub: sinon.stub(workflowActions,
          'createModifyAtmWorkflowSchemaAction'),
        createRemoveAtmWorkflowSchemaActionStub: sinon.stub(workflowActions,
          'createRemoveAtmWorkflowSchemaAction'),
      });
    });

    it('has class "content-inventories-workflows-editor-view"', function () {
      this.render(hbs `{{content-inventories-workflows/editor-view}}`);

      expect(this.$().children()).to.have.class('content-inventories-workflows-editor-view')
        .and.to.have.length(1);
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await render(this);

      const backSlideSpy = this.get('backSlideSpy');
      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('shows workflow schema name in header', async function () {
      await render(this);

      expect(this.$('.header-row').text()).to.contain('workflow1');
    });

    it('allows to change workflow schema name', async function () {
      const {
        createModifyAtmWorkflowSchemaActionStub,
        atmWorkflowSchema,
      } = this.getProperties(
        'createModifyAtmWorkflowSchemaActionStub',
        'atmWorkflowSchema'
      );
      createModifyAtmWorkflowSchemaActionStub.returns({
        execute: () => {
          set(atmWorkflowSchema, 'name', 'newName');
          return resolve({
            status: 'done',
          });
        },
      });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', 'newName');
      await click('.workflow-schema-name .save-icon');

      expect(createModifyAtmWorkflowSchemaActionStub).to.be.calledOnce
        .and.to.be.calledWith({
          atmWorkflowSchema,
          atmWorkflowSchemaDiff: sinon.match({
            name: 'newName',
          }),
        });
      expect(this.$('.header-row').text()).to.contain('newName');
    });

    it('does not close name editor when applying name change failed', async function () {
      this.get('createModifyAtmWorkflowSchemaActionStub').returns({
        execute: () => resolve({
          status: 'failed',
        }),
      });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', 'newName');
      await click('.workflow-schema-name .save-icon');

      expect(this.$('.workflow-schema-name input')).to.exist;
    });

    it('does not close name editor when provided name is empty', async function () {
      let executeCalled = false;
      this.get('createModifyAtmWorkflowSchemaActionStub').returns({
        execute: () => {
          executeCalled = true;
          return resolve({
            status: 'failed',
          });
        },
      });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', '');
      await click('.workflow-schema-name .save-icon');

      expect(this.$('.workflow-schema-name input')).to.exist;
      expect(executeCalled).to.be.false;
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-workflows/editor-view
    atmWorkflowSchema=atmWorkflowSchema
    onBackSlide=backSlideSpy
  }}`);
  await wait();
}
