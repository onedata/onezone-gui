import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';
import $ from 'jquery';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';

describe(
  'Integration | Component | content atm inventories lambdas/atm lambdas list',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/atm-lambdas-list', {
      integration: true,
    });

    beforeEach(function () {
      this.set('collection', [{
        name: 'f1',
        summary: 'f1 summary',
        engine: 'openfaas',
        operationRef: 'f1Image',
        executionOptions: {
          readonly: false,
          mountSpaceOptions: {
            mouncOneclient: false,
          },
        },
        arguments: [],
        results: [],
      }, {
        name: 'f0',
        summary: 'f0 summary',
        engine: 'onedataFunction',
        operationRef: 'f0Function',
        executionOptions: {
          readonly: false,
          mountSpaceOptions: {
            mouncOneclient: false,
          },
        },
        arguments: [],
        results: [],
      }]);
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

    it('allows to turn on edition mode for lambda', async function () {
      await render(this);

      await click('.atm-lambda-actions-trigger');
      await click($('body .webui-popover.in .modify-action-trigger')[0]);

      expect(this.$('.view-data-collapse').eq(0)).to.not.have.class('in');
      expect(this.$('.details-collapse').eq(0)).to.have.class('in');
      expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-edit');
    });

    it('saves modified lambda and closes edition mode', async function () {
      const workflowActions = lookupService(this, 'workflow-actions');
      const createModifyAtmLambdaActionStub =
        sinon.stub(workflowActions, 'createModifyAtmLambdaAction')
        .returns({
          execute: () => resolve({
            status: 'done',
          }),
        });
      await render(this);

      await click('.atm-lambda-actions-trigger');
      await click($('body .webui-popover.in .modify-action-trigger')[0]);
      await fillIn('.name-field .form-control', 'randomname');
      await fillIn('.summary-field .form-control', 'randomsummary');
      await click('.btn-submit');

      expect(createModifyAtmLambdaActionStub).to.be.calledOnce
        .and.to.be.calledWith({
          atmLambda: this.get('collection.1'),
          atmLambdaDiff: sinon.match({
            name: 'randomname',
            summary: 'randomsummary',
          }),
        });
      expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-view');
    });

    it('cancels lambda modification', async function () {
      await render(this);

      await click('.atm-lambda-actions-trigger');
      await click($('body .webui-popover.in .modify-action-trigger')[0]);
      await click('.btn-cancel');

      expect(this.$('.atm-lambda-form').eq(0)).to.have.class('mode-view');
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/atm-lambdas-list
    collection=collection
  }}`);
  await wait();
}

async function toggleLambdaDetails(lambdaIdx) {
  await click(`.atm-lambdas-list-entry:nth-child(${lambdaIdx + 1}) .details-toggle`);
}
