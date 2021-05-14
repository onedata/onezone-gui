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

describe('Integration | Component | content atm inventories lambdas/list view',
  function () {
    setupComponentTest('content-atm-inventories-lambdas/list-view', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        atmInventory: {
          privileges: {
            manageLambdas: true,
          },
          atmLambdaList: promiseObject(resolve({
            list: promiseArray(resolve([{
              name: 'f1',
              summary: 'f1 summary',
              operationSpec: {
                engine: 'openfaas',
                dockerImage: 'f1Image',
                dockerExecutionOptions: {
                  readonly: false,
                  mountOneclient: false,
                },
              },
              argumentSpecs: [],
              resultSpecs: [],
            }, {
              name: 'f0',
              summary: 'f0 summary',
              operationSpec: {
                engine: 'onedataFunction',
                functionId: 'f0Function',
              },
              argumentSpecs: [],
              resultSpecs: [],
            }])),
          })),
        },
        addAtmLambdaSpy: sinon.spy(),
      });
    });

    it('has class "content-atm-inventories-lambdas-list-view"', function () {
      this.render(hbs `{{content-atm-inventories-lambdas/list-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-lambdas-list-view')
        .and.to.have.length(1);
    });

    it('has header "Lambdas"', async function () {
      await render(this);

      expect(this.$('.header-row h1 .one-label').text().trim()).to.equal('Lambdas');
    });

    it('shows list of lambdas of given automation inventory', async function () {
      await render(this);

      expect(this.$('.lambdas-list')).to.exist;
      const $entries = this.$('.atm-lambdas-list-entry');
      expect($entries).to.have.length(2);
      expect($entries.eq(0).text()).to.contain('f0');
      expect($entries.eq(1).text()).to.contain('f1');
    });

    it('has "add new lambda" button, which calls "onAddAtmLambda" callback on click',
      async function () {
        await render(this);

        const $addAtmLambdaBtn = this.$('.header-row .open-add-atm-lambda-trigger');
        expect($addAtmLambdaBtn.text().trim()).to.equal('Add new lambda');
        const addAtmLambdaSpy = this.get('addAtmLambdaSpy');
        expect(addAtmLambdaSpy).to.not.be.called;

        await click($addAtmLambdaBtn[0]);

        expect(addAtmLambdaSpy).to.be.calledOnce;
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas/list-view
    atmInventory=atmInventory
    onAddAtmLambda=addAtmLambdaSpy
  }}`);
  await wait();
}
