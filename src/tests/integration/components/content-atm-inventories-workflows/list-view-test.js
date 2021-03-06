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

describe('Integration | Component | content atm inventories workflows/list view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/list-view', {
      integration: true,
    });

    beforeEach(function () {
      this.setProperties({
        atmInventory: {
          atmWorkflowSchemaList: promiseObject(resolve({
            list: promiseArray(resolve([{
              name: 'w1',
              description: 'w1 description',
              isLoaded: true,
            }, {
              name: 'w0',
              description: 'w0 description',
              isLoaded: true,
            }])),
          })),
          privileges: {
            view: true,
            manageWorkflowSchemas: true,
          },
        },
        addFunctionSpy: sinon.spy(),
      });
    });

    it('has class "content-atm-inventories-workflows-list-view"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/list-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-workflows-list-view')
        .and.to.have.length(1);
    });

    it('has header "Workflows"', async function () {
      await render(this);

      expect(this.$('.header-row h1 .one-label').text().trim()).to.equal('Workflows');
    });

    it('shows list of workflow schemas of given automation inventory', async function () {
      await render(this);

      expect(this.$('.atm-workflow-schemas-list')).to.exist;
      const $entries = this.$('.atm-workflow-schemas-list-entry');
      expect($entries).to.have.length(2);
      expect($entries.eq(0).text()).to.contain('w0');
      expect($entries.eq(1).text()).to.contain('w1');
    });

    it('has "add new workflow" button, which calls "onAddAtmWorkflowSchema" callback on click',
      async function () {
        await render(this);

        const $addFunctionBtn = this.$('.header-row .open-add-atm-workflow-schema-trigger');
        expect($addFunctionBtn.text().trim()).to.equal('Add new workflow');
        const addFunctionSpy = this.get('addFunctionSpy');
        expect(addFunctionSpy).to.not.be.called;

        await click($addFunctionBtn[0]);

        expect(addFunctionSpy).to.be.calledOnce;
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/list-view
    atmInventory=atmInventory
    onAddAtmWorkflowSchema=addFunctionSpy
  }}`);
  await wait();
}
