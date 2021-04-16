import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | content workflows functions/list view', function () {
  setupComponentTest('content-workflows-functions/list-view', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      workflowDirectory: {
        lambdaFunctionList: promiseObject(resolve({
          list: promiseArray(resolve([{
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
          }])),
        })),
      },
      addFunctionSpy: sinon.spy(),
    });
  });

  it('has class "content-workflows-functions-list-view"', function () {
    this.render(hbs `{{content-workflows-functions/list-view}}`);

    expect(this.$().children()).to.have.class('content-workflows-functions-list-view')
      .and.to.have.length(1);
  });

  it('has header "Functions"', async function () {
    await render(this);

    expect(this.$('.header-row h1 .one-label').text().trim()).to.equal('Functions');
  });

  it('shows list of lambda functions of given workflow directory', async function () {
    await render(this);

    expect(this.$('.lambda-functions-list')).to.exist;
    const $entries = this.$('.lambda-functions-list-entry');
    expect($entries).to.have.length(2);
    expect($entries.eq(0).text()).to.contain('f0');
    expect($entries.eq(1).text()).to.contain('f1');
  });

  it('has "add new function" button, which calls "onAddFunction" callback on click',
    async function () {
      await render(this);

      const $addFunctionBtn = this.$('.header-row .open-add-function-trigger');
      expect($addFunctionBtn.text().trim()).to.equal('Add new function');
      const addFunctionSpy = this.get('addFunctionSpy');
      expect(addFunctionSpy).to.not.be.called;

      await click($addFunctionBtn[0]);

      expect(addFunctionSpy).to.be.calledOnce;
    });
});

async function render(testCase) {
  testCase.render(hbs `{{content-workflows-functions/list-view
    workflowDirectory=workflowDirectory
    onAddFunction=addFunctionSpy
  }}`);
  await wait();
}
