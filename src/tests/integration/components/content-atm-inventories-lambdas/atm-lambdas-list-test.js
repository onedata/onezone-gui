import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import ModifyAtmLambdaAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-action';
import CopyRecordIdAction from 'onedata-gui-common/utils/clipboard-actions/copy-record-id-action';

const lambdaActionsSpec = [{
  className: 'modify-action-trigger',
  label: 'Modify',
  icon: 'rename',
}, {
  className: 'copy-record-id-action-trigger',
  label: 'Copy lambda ID',
  icon: 'copy',
}];

function generateLambda(name, content) {
  return Object.assign({
    constructor: {
      modelName: 'atm-lambda',
    },
    name,
    summary: `${name} summary`,
    isLoaded: true,
    argumentSpecs: [],
    resultSpecs: [],
  }, content);
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
      ModifyAtmLambdaAction.create();
      CopyRecordIdAction.create();
    });

    beforeEach(function () {
      const collection = [
        generateLambda('f1', {
          operationSpec: {
            engine: 'openfaas',
            dockerImage: 'f1Image',
            dockerExecutionOptions: {
              readonly: false,
              mountOneclient: false,
            },
          },
        }),
        generateLambda('f0', {
          operationSpec: {
            engine: 'onedataFunction',
            functionId: 'f0Function',
          },
        }),
      ];
      const allCollection = [
        ...collection,
        generateLambda('f2', {
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
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyAtmLambdaAction,
        CopyRecordIdAction,
      ].forEach(action => {
        if (action.prototype.execute.restore) {
          action.prototype.execute.restore();
        }
      });
    });

    it('has class "atm-lambdas-list"', function () {
      this.render(hbs `{{content-atm-inventories-lambdas/atm-lambdas-list}}`);

      expect(this.$().children()).to.have.class('atm-lambdas-list')
        .and.to.have.length(1);
    });

    it('shows list of collapsed lambda entries', async function () {
      await render(this);

      const $lambdas = this.$('.atm-lambdas-list-entry');
      expect($lambdas).to.have.length(2);
      [0, 1].forEach(idx => {
        const $lambda = $lambdas.eq(idx);
        expect($lambda.find('.view-data-collapse')).to.have.class('in');
        expect($lambda.find('.name').text().trim()).to.equal(`f${idx}`);
        expect($lambda.find('.summary').text().trim())
          .to.equal(`f${idx} summary`);
        expect($lambda.find('.details-collapse')).to.not.have.class('in');
        expect($lambda.find('.atm-lambda-form')).to.not.exist;
      });
    });

    it('does not show summary when lambda does not have any', async function () {
      this.get('collection').setEach('summary', '');

      await render(this);

      expect(this.$('.summary')).to.not.exist;
    });

    it('allows to expand lambda details', async function () {
      await render(this);

      await toggleLambdaDetails(0);

      expect(this.$('.details-collapse').eq(0)).to.have.class('in');
      expect(this.$('.details-toggle').eq(0).text().trim()).to.equal('Hide details');
    });

    it('allows to collapse lambda details', async function () {
      await render(this);

      await toggleLambdaDetails(0);
      await toggleLambdaDetails(0);

      expect(this.$('.details-collapse').eq(0)).to.not.have.class('in');
      expect(this.$('.details-toggle').eq(0).text().trim()).to.equal('Show details...');
    });

    it('shows lambda details when lambda is expanded', async function () {
      await render(this);

      await toggleLambdaDetails(0);
      await toggleLambdaDetails(1);

      const $detailsForms = this.$('.atm-lambdas-list-entry .atm-lambda-form');
      expect($detailsForms).to.have.length(2).and.to.have.class('mode-view');
      expect($detailsForms.eq(0).text()).to.contain('f0Function');
      expect($detailsForms.eq(1).text()).to.contain('f1Image');
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

    context('in "presentation" mode', function () {
      beforeEach(function () {
        this.set('mode', 'presentation');
      });

      it('has class "mode-presentation"', async function () {
        await render(this);

        expect(this.$('.atm-lambdas-list')).to.have.class('mode-presentation');
      });

      it('allows to choose from lambda actions', async function () {
        await render(this);

        const $actionsTrigger = this.$('.atm-lambda-actions-trigger');
        expect($actionsTrigger).to.exist;

        await click($actionsTrigger[0]);

        const $actions = $('body .webui-popover.in .actions-popover-content a');
        expect($actions).to.have.length(lambdaActionsSpec.length);
        lambdaActionsSpec.forEach(({ className, label, icon }, index) => {
          const $action = $actions.eq(index);
          expect($action).to.have.class(className);
          expect($action.text().trim()).to.equal(label);
          expect($action.find('.one-icon')).to.have.class(`oneicon-${icon}`);
        });
      });

      it('allows to turn on edition mode for lambda', async function () {
        await render(this);

        await click('.atm-lambda-actions-trigger');
        await click($('body .webui-popover.in .modify-action-trigger')[0]);

        expect(this.$('.view-data-collapse').eq(0)).to.not.have.class('in');
        expect(this.$('.details-collapse').eq(0)).to.have.class('in');
        expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-edit');
      });

      it('saves modified lambda and closes edition mode', async function () {
        const firstLambda = this.get('collection.1');
        const executeStub = sinon.stub(ModifyAtmLambdaAction.prototype, 'execute')
          .callsFake(function () {
            expect(this.get('context.atmLambda')).to.equal(firstLambda);
            expect(this.get('context.atmLambdaDiff')).to.deep.include({
              name: 'randomname',
              summary: 'randomsummary',
            });
            return resolve({ status: 'done' });
          });
        await render(this);

        await click('.atm-lambda-actions-trigger');
        await click($('body .webui-popover.in .modify-action-trigger')[0]);
        await fillIn('.name-field .form-control', 'randomname');
        await fillIn('.summary-field .form-control', 'randomsummary');
        await click('.btn-submit');

        expect(executeStub).to.be.calledOnce;
        expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-view');
      });

      it('cancels lambda modification', async function () {
        await render(this);

        await click('.atm-lambda-actions-trigger');
        await click($('body .webui-popover.in .modify-action-trigger')[0]);
        await click('.btn-cancel');

        expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-view');
      });

      it('allows to copy lambda ID', async function () {
        const firstLambda = this.get('collection.1');
        const executeStub = sinon.stub(
          CopyRecordIdAction.prototype,
          'execute'
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

        expect(this.$('.add-to-workflow-action-trigger')).to.not.exist;
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

      it('does not show lambda actions trigger', async function () {
        await render(this);

        expect(this.$('.atm-lambda-actions-trigger')).to.not.exist;
      });

      it('notifies about "add to workflow" button click', async function () {
        const addToAtmWorkflowSchemaSpy = this.get('addToAtmWorkflowSchemaSpy');
        await render(this);

        expect(addToAtmWorkflowSchemaSpy).to.be.not.called;
        const $addBtn =
          this.$('.atm-lambdas-list-entry .add-to-workflow-action-trigger').eq(0);
        await click($addBtn[0]);

        expect($addBtn.text().trim()).to.equal('Add to workflow');
        expect(addToAtmWorkflowSchemaSpy).to.be.calledOnce
          .and.to.be.calledWith(this.get('collection.1'));
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
    mode=mode
    onAddToAtmWorkflowSchema=addToAtmWorkflowSchemaSpy
  }}`);
  await wait();
}

async function toggleLambdaDetails(lambdaIdx) {
  await click(`.atm-lambdas-list-entry:nth-child(${lambdaIdx + 1}) .details-toggle`);
}
