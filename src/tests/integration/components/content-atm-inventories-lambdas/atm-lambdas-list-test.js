import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { set } from '@ember/object';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';
import UnlinkAtmLambdaAction from 'onezone-gui/utils/workflow-actions/unlink-atm-lambda-action';
import { lookupService } from '../../../helpers/stub-service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

const lambdaPresentationActionsSpec = [{
  className: 'unlink-atm-lambda-action-trigger',
  label: 'Unlink',
  icon: 'x',
}, {
  className: 'copy-record-id-action-trigger',
  label: 'Copy ID',
  icon: 'copy',
}];

const lambdaSelectionActionsSpec = [lambdaPresentationActionsSpec[1]];

function generateLambda(testCase, name, content) {
  const store = lookupService(testCase, 'store');
  return store.createRecord('atm-lambda', {
    revisionRegistry: {
      1: Object.assign({
        name,
        state: 'stable',
        summary: `${name} summary`,
        argumentSpecs: [],
        resultSpecs: [],
      }, content),
    },
  });
}

describe(
  'Integration | Component | content atm inventories lambdas/atm lambdas list',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/atm-lambdas-list', {
      integration: true,
    });

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      CopyRecordIdAction.create();
      UnlinkAtmLambdaAction.create();
    });

    beforeEach(function () {
      const collection = [
        generateLambda(this, 'f1', {
          operationSpec: {
            engine: 'openfaas',
            dockerImage: 'f1Image',
            dockerExecutionOptions: {
              readonly: false,
              mountOneclient: false,
            },
          },
        }),
        generateLambda(this, 'f0', {
          operationSpec: {
            engine: 'onedataFunction',
            functionId: 'f0Function',
          },
        }),
      ];
      const allCollection = [
        ...collection,
        generateLambda(this, 'f2', {
          operationSpec: {
            engine: 'openfaas',
            dockerImage: 'f2Image',
            dockerExecutionOptions: {
              readonly: false,
              mountOneclient: false,
            },
          },
        }),
      ];
      this.setProperties({
        collection,
        allCollection,
        lambdaRevisionClickedSpy: sinon.spy(),
        atmInventory: {
          name: 'inv1',
          atmWorkflowSchemaList: promiseObject(resolve({
            list: promiseArray(resolve([])),
          })),
          privileges: {
            manageLambdas: true,
          },
        },
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        CopyRecordIdAction,
        UnlinkAtmLambdaAction,
      ].forEach(action => {
        if (action.prototype.onExecute.restore) {
          action.prototype.onExecute.restore();
        }
      });
    });

    it('has class "atm-lambdas-list"', function () {
      this.render(hbs `{{content-atm-inventories-lambdas/atm-lambdas-list}}`);

      expect(this.$().children()).to.have.class('atm-lambdas-list')
        .and.to.have.length(1);
    });

    it('shows list of lambda entries', async function () {
      await render(this);

      const $lambdas = this.$('.atm-lambdas-list-entry');
      expect($lambdas).to.have.length(2);

      [0, 1].forEach(idx => {
        const $lambda = $lambdas.eq(idx);
        expect($lambda.find('.lambda-name').text().trim()).to.equal(`f${idx}`);
        expect($lambda.find('.lambda-summary').text().trim())
          .to.equal(`f${idx} summary`);
      });
    });

    it('does not show summary when lambda does not have any', async function () {
      this.get('collection').forEach((atmLambda) =>
        set(atmLambda, 'revisionRegistry.1.summary', undefined)
      );

      await render(this);

      expect(this.$('.lambda-summary')).to.not.exist;
    });

    it('shows table with lambda revisions', async function () {
      await render(this);

      const $table = this.$('.atm-lambdas-list-entry').eq(0).find('.revisions-table');
      expect($table.find('.name-column').text().trim()).to.equal('Name');
      expect($table.find('.summary-column').text().trim()).to.equal('Summary');
      expect($table.find('.revision-number').text().trim()).to.equal('1');
      expect($table.find('.state').text().trim()).to.equal('Stable');
      expect($table.find('.name').text().trim()).to.equal('f0');
      expect($table.find('.summary').text().trim()).to.equal('f0 summary');
    });

    it('has empty search input on init', async function () {
      await render(this);

      expect(this.$('.search-bar')).to.have.value('');
    });

    it('filters lambdas by name when search input is not empty', async function () {
      await render(this);

      await fillIn('.search-bar', 'f1');

      const $lambdas = this.$('.atm-lambdas-list-entry');
      expect($lambdas).to.have.length(1);
      expect($lambdas.text()).to.contain('f1');
    });

    it('notifies about lambda revision click', async function () {
      await render(this);

      await click('.atm-lambdas-list-entry .revisions-table-revision-entry');

      expect(this.get('lambdaRevisionClickedSpy')).to.be.calledOnce
        .and.to.be.calledWith(this.get('collection.1'), 1);
    });

    context('in "presentation" mode', function () {
      beforeEach(function () {
        this.set('mode', 'presentation');
      });

      it('has class "mode-presentation"', async function () {
        await render(this);

        expect(this.$('.atm-lambdas-list')).to.have.class('mode-presentation');
      });

      itAllowsToChooseLambdaActions(lambdaPresentationActionsSpec);

      it('allows to remove lambda', async function () {
        // const workflowActions = lookup
        const {
          collection,
          atmInventory,
        } = this.getProperties('collection', 'atmInventory');
        const firstLambda = collection.findBy('latestRevision.name', 'f0');
        const unlinkStub = sinon.stub(UnlinkAtmLambdaAction.prototype, 'onExecute')
          .callsFake(function () {
            expect(this.get('context.atmLambda')).to.equal(firstLambda);
            expect(this.get('context.atmInventory')).to.equal(atmInventory);
          });

        await render(this);
        const $atmLambdas = this.$('.atm-lambdas-list-entry');
        const $firstAtmLambda = $atmLambdas.eq(0);

        await click($firstAtmLambda.find('.atm-lambda-actions-trigger')[0]);
        await click(
          $('body .webui-popover.in .unlink-atm-lambda-action-trigger')[0]
        );

        expect(unlinkStub).to.be.calledOnce;
      });

      it('allows to copy lambda ID', async function () {
        const firstLambda = this.get('collection.1');
        const executeStub = sinon.stub(
          CopyRecordIdAction.prototype,
          'onExecute'
        ).callsFake(function () {
          expect(this.get('context.record')).to.equal(firstLambda);
          return resolve({ status: 'done' });
        });

        await render(this);
        await click('.atm-lambda-actions-trigger');
        await click(
          $('body .webui-popover.in .copy-record-id-action-trigger')[0]
        );

        expect(executeStub).to.be.calledOnce;
      });

      it('does not have "add to workflow" button', async function () {
        await render(this);

        expect(this.$('.addToWorkflow button')).to.not.exist;
      });

      it('does not have collection type selector', async function () {
        await render(this);

        expect(this.$('.collection-type-selector')).to.not.exist;
      });
    });

    context('in "selection" mode', function () {
      beforeEach(function () {
        this.setProperties({
          mode: 'selection',
          addToAtmWorkflowSchemaSpy: sinon.spy(),
        });
      });

      it('has class "mode-selection"', async function () {
        await render(this);

        expect(this.$('.atm-lambdas-list')).to.have.class('mode-selection');
      });

      itAllowsToChooseLambdaActions(lambdaSelectionActionsSpec);

      it('notifies about "add to workflow" button click', async function () {
        const addToAtmWorkflowSchemaSpy = this.get('addToAtmWorkflowSchemaSpy');
        await render(this);

        expect(addToAtmWorkflowSchemaSpy).to.be.not.called;
        const $addBtn =
          this.$('.atm-lambdas-list-entry .addToWorkflow button').eq(0);
        await click($addBtn[0]);

        expect($addBtn.text().trim()).to.equal('Add to workflow');
        expect(addToAtmWorkflowSchemaSpy).to.be.calledOnce
          .and.to.be.calledWith(this.get('collection.1'), 1);
      });

      it('has collection type selector with preselected "this inventory"',
        async function () {
          await render(this);

          const $selector = this.$('.collection-type-selector');
          expect($selector).to.exist.and.to.have.class('btn-group');
          const $buttons = $selector.find('.btn');
          expect($buttons.eq(0).text().trim()).to.equal('This inventory');
          expect($buttons.eq(0)).to.have.class('active');
          expect($buttons.eq(1).text().trim()).to.equal('All');
        });

      it('allows to toggle between collection types', async function () {
        await render(this);

        expect(this.$('.atm-lambdas-list-entry')).to.have.length(2);
        await click('.btn-all');

        expect(this.$('.atm-lambdas-list-entry')).to.have.length(3);
        await click('.btn-this-inventory');

        expect(this.$('.atm-lambdas-list-entry')).to.have.length(2);
      });

      it('does not reset filtering during collection type change', async function () {
        await render(this);

        await fillIn('.search-bar', 'f2');

        expect(this.$('.atm-lambdas-list-entry')).to.have.length(0);
        await click('.btn-all');

        expect(this.$('.atm-lambdas-list-entry')).to.have.length(1);
      });

      it('shows proper message when this inventory collection is empty',
        async function () {
          this.set('collection', []);

          await render(this);

          expect(this.$('.empty-message').text().trim()).to.equal(
            'This automation inventory does not have any lambdas yet. To see lambdas from other inventories, change the listing mode to "All".'
          );
        });

      it('shows proper message when all inventories collection is empty',
        async function () {
          this.set('allCollection', []);

          await render(this);
          await click('.btn-all');

          expect(this.$('.empty-message').text().trim()).to.equal(
            'You do not have access to any lambdas.'
          );
        });
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/atm-lambdas-list
    collection=collection
    allCollection=allCollection
    atmInventory=atmInventory
    mode=mode
    onAddToAtmWorkflowSchema=addToAtmWorkflowSchemaSpy
    onRevisionClick=lambdaRevisionClickedSpy
  }}`);
  await wait();
}

function itAllowsToChooseLambdaActions(actions) {
  it('allows to choose from lambda actions', async function () {
    await render(this);

    const $actionsTrigger = this.$('.atm-lambda-actions-trigger');
    expect($actionsTrigger).to.exist;

    await click($actionsTrigger[0]);

    const $actions = $('body .webui-popover.in .actions-popover-content a');
    expect($actions).to.have.length(actions.length);
    actions.forEach(({ className, label, icon }, index) => {
      const $action = $actions.eq(index);
      expect($action).to.have.class(className);
      expect($action.text().trim()).to.equal(label);
      expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
    });
  });
}
