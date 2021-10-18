import { expect } from 'chai';
import { describe, it, before, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';

describe('Integration | Component | content atm inventories workflows/list view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/list-view', {
      integration: true,
    });

    before(function () {
      // Instatiate Action class to make its `prototype.execute` available for
      // mocking.
      CreateAtmWorkflowSchemaRevisionAction.create();
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
              revisionRegistry: {
                2: {},
              },
              isLoaded: true,
            }])),
          })),
          privileges: {
            view: true,
            manageWorkflowSchemas: true,
          },
        },
        addFunctionSpy: sinon.spy(),
        openAtmWorkflowSchemaRevisionSpy: sinon.spy(),
        createdAtmWorkflowSchemaRevisionSpy: sinon.spy(),
      });
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        CreateAtmWorkflowSchemaRevisionAction,
      ].forEach(action => {
        if (action.prototype.onExecute.restore) {
          action.prototype.onExecute.restore();
        }
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

    it('calls "onOpenAtmWorkflowSchemaRevision" when workflow revision has been clicked',
      async function () {
        await render(this);

        await click('.revisions-table-revision-entry');

        expect(this.get('openAtmWorkflowSchemaRevisionSpy')).to.be.calledOnce
          .and.to.be.calledWith(sinon.match({ name: 'w0' }), 2);
      });

    it('calls "onCreatedAtmWorkflowSchemaRevision" when "create revision" has been clicked',
      async function () {
        sinon.stub(
          CreateAtmWorkflowSchemaRevisionAction.prototype,
          'onExecute'
        ).resolves(4);
        await render(this);

        await click('.revisions-table-create-revision-entry');

        expect(this.get('createdAtmWorkflowSchemaRevisionSpy')).to.be.calledOnce
          .and.to.be.calledWith(sinon.match({ name: 'w0' }), 4);
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/list-view
    atmInventory=atmInventory
    onAddAtmWorkflowSchema=addFunctionSpy
    onOpenAtmWorkflowSchemaRevision=openAtmWorkflowSchemaRevisionSpy
    onCreatedAtmWorkflowSchemaRevision=createdAtmWorkflowSchemaRevisionSpy
  }}`);
  await wait();
}
