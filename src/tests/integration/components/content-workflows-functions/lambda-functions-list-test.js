import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { click, fillIn } from 'ember-native-dom-helpers';

describe(
  'Integration | Component | content workflows functions/lambda functions list',
  function () {
    setupComponentTest('content-workflows-functions/lambda-functions-list', {
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

    it('has class "lambda-functions-list"', function () {
      this.render(hbs `{{content-workflows-functions/lambda-functions-list}}`);

      expect(this.$().children()).to.have.class('lambda-functions-list')
        .and.to.have.length(1);
    });

    it('shows list of collapsed function entries', async function () {
      await render(this);

      const $functions = this.$('.lambda-functions-list-entry');
      expect($functions).to.have.length(2);
      [0, 1].forEach(idx => {
        expect($functions.eq(idx).find('.name').text().trim()).to.equal(`f${idx}`);
        expect($functions.eq(idx).find('.summary').text().trim())
          .to.equal(`f${idx} summary`);
        expect($functions.eq(idx).find('.details-collapse')).to.not.have.class('in');
        expect($functions.eq(idx).find('.lambda-function-form')).to.not.exist;
      });
    });

    it('does not show summary when function does not have any', async function () {
      this.get('collection').setEach('summary', '');

      await render(this);

      expect(this.$('.summary')).to.not.exist;
    });

    it('allows to expand function details', async function () {
      await render(this);

      await toggleFunctionDetails(0);

      expect(this.$('.details-collapse').eq(0)).to.have.class('in');
    });

    it('allows to collapse function details', async function () {
      await render(this);

      await toggleFunctionDetails(0);
      await toggleFunctionDetails(0);

      expect(this.$('.details-collapse').eq(0)).to.not.have.class('in');
    });

    it('shows function details when function is expanded', async function () {
      await render(this);

      await toggleFunctionDetails(0);
      await toggleFunctionDetails(1);

      const $detailsForms = this.$('.lambda-functions-list-entry .lambda-function-form');
      expect($detailsForms).to.have.length(2).and.to.have.class('mode-view');
      expect($detailsForms.eq(0).text()).to.contain('f0Function');
      expect($detailsForms.eq(1).text()).to.contain('f1Image');
    });

    it('has empty search input on init', async function () {
      await render(this);

      expect(this.$('.search-input')).to.have.value('');
    });

    it('filters functions by name when search input is not empty', async function () {
      await render(this);

      await fillIn('.search-input', 'f1');

      const $functions = this.$('.lambda-functions-list-entry');
      expect($functions).to.have.length(1);
      expect($functions.text()).to.contain('f1');
    });
  }
);

async function render(testCase) {
  testCase.render(hbs `{{content-workflows-functions/lambda-functions-list
    collection=collection
  }}`);
  await wait();
}

async function toggleFunctionDetails(functionIdx) {
  await click(`.lambda-functions-list-entry:nth-child(${functionIdx + 1}) .details-toggle`);
}
