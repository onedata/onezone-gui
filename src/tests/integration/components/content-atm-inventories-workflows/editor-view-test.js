import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';
import EmberObject, { set, get } from '@ember/object';
import _ from 'lodash';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';

describe('Integration | Component | content atm inventories workflows/editor view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/editor-view', {
      integration: true,
    });

    before(function () {
      // Instatiate Action classes to make its `prototype.execute` available for
      // mocking.
      ModifyAtmWorkflowSchemaAction.create();
      RemoveAtmWorkflowSchemaAction.create();
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyAtmWorkflowSchemaAction,
        RemoveAtmWorkflowSchemaAction,
      ].forEach(action => {
        if (action.prototype.execute.restore) {
          action.prototype.execute.restore();
        }
      });
    });

    beforeEach(function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      this.setProperties({
        atmWorkflowSchema: EmberObject.create({
          name: 'workflow1',
          lanes: [{
            id: 'l1',
            name: 'lane1',
            storeIteratorSpec: {
              strategy: {
                type: 'serial',
              },
              storeSchemaId: 's1',
            },
            parallelBoxes: [{
              id: 'pbox1',
              name: 'pbox1',
              tasks: [{
                id: 't1',
                name: 'task1',
                argumentMappings: [],
                resultMappings: [],
              }],
            }],
          }],
          stores: [{
            id: 's1',
            name: 'store1',
            type: 'list',
            dataSpec: {
              type: 'string',
              valueConstraints: {},
            },
          }],
        }),
        backSlideSpy: sinon.spy(),
        createRemoveAtmWorkflowSchemaActionStub: sinon.stub(workflowActions,
          'createRemoveAtmWorkflowSchemaAction'),
      });
    });

    it('has class "content-atm-inventories-workflows-editor-view"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/editor-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-workflows-editor-view')
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
      const atmWorkflowSchema = this.get('atmWorkflowSchema');
      const executeStub = sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'execute')
        .callsFake(function () {
          expect(this.get('atmWorkflowSchema')).to.equal(atmWorkflowSchema);
          expect(this.get('atmWorkflowSchemaDiff')).to.deep.include({
            name: 'newName',
          });
          set(atmWorkflowSchema, 'name', 'newName');
          return resolve({ status: 'done' });
        });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', 'newName');
      await click('.workflow-schema-name .save-icon');

      expect(executeStub).to.be.calledOnce;
      expect(this.$('.header-row').text()).to.contain('newName');
    });

    it('does not close name editor when applying name change failed', async function () {
      sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'execute')
        .callsFake(function () {
          return resolve({ status: 'failed' });
        });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', 'newName');
      await click('.workflow-schema-name .save-icon');

      expect(this.$('.workflow-schema-name input')).to.exist;
    });

    it('does not close name editor when provided name is empty', async function () {
      const executeStub = sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'execute')
        .callsFake(function () {
          return resolve({ status: 'failed' });
        });
      await render(this);

      await click('.workflow-schema-name .one-label');
      await fillIn('.workflow-schema-name input', '');
      await click('.workflow-schema-name .save-icon');

      expect(this.$('.workflow-schema-name input')).to.exist;
      expect(executeStub).to.not.be.called;
    });

    it('shows workflow schema elements', async function () {
      await render(this);

      const $workflowVisualiser = this.$('.workflow-visualiser');
      expect($workflowVisualiser).to.have.class('mode-edit');
      ['lane1', 'pbox1', 'task1'].forEach(textContent =>
        expect($workflowVisualiser.text()).to.contain(textContent)
      );
    });

    it('allows to save modified workflow schema elements', async function () {
      const atmWorkflowSchema = this.get('atmWorkflowSchema');
      const newLanes = _.cloneDeep(get(atmWorkflowSchema, 'lanes'));
      newLanes[0].name = 'newName';
      const executeStub = sinon.stub(ModifyAtmWorkflowSchemaAction.prototype, 'execute')
        .callsFake(function () {
          expect(this.get('atmWorkflowSchema')).to.equal(atmWorkflowSchema);
          expect(this.get('atmWorkflowSchemaDiff')).to.deep.include({
            lanes: newLanes,
          });
          return resolve({ status: 'done' });
        });
      await render(this);

      await click('.lane-name .one-label');
      await fillIn('.lane-name .form-control', 'newName');
      await click('.lane-name .save-icon');
      await click('.btn-save');

      expect(executeStub).to.be.calledOnce;
    });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/editor-view
    atmWorkflowSchema=atmWorkflowSchema
    onBackSlide=backSlideSpy
  }}`);
  await wait();
}
