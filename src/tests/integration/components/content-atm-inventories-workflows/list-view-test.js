import { expect } from 'chai';
import {
  describe,
  it,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';

describe('Integration | Component | content atm inventories workflows/list view',
  function () {
    setupRenderingTest();

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

    it('has class "content-atm-inventories-workflows-list-view"', async function () {
      await render(hbs `{{content-atm-inventories-workflows/list-view}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('content-atm-inventories-workflows-list-view');
    });

    it('has header "Workflows"', async function () {
      await renderComponent();

      expect(find('.header-row h1 .one-label')).to.have.trimmed.text('Workflows');
    });

    it('shows list of workflow schemas of given automation inventory', async function () {
      await renderComponent();

      expect(find('.atm-workflow-schemas-list')).to.exist;
      const entries = findAll('.atm-workflow-schemas-list-entry');
      expect(entries).to.have.length(2);
      expect(entries[0]).to.contain.text('w0');
      expect(entries[1]).to.contain.text('w1');
    });

    it('has "add new workflow" button, which calls "onAddAtmWorkflowSchema" callback on click',
      async function () {
        await renderComponent();

        const addFunctionBtn = find('.header-row .open-add-atm-workflow-schema-trigger');
        expect(addFunctionBtn).to.have.trimmed.text('Add new workflow');
        const addFunctionSpy = this.get('addFunctionSpy');
        expect(addFunctionSpy).to.not.be.called;

        await click(addFunctionBtn);

        expect(addFunctionSpy).to.be.calledOnce;
      });

    it('calls "onOpenAtmWorkflowSchemaRevision" when workflow revision has been clicked',
      async function () {
        await renderComponent();

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
        await renderComponent();

        await click('.revisions-table-create-revision-entry');

        expect(this.get('createdAtmWorkflowSchemaRevisionSpy')).to.be.calledOnce
          .and.to.be.calledWith(sinon.match({ name: 'w0' }), 4);
      });

    it('calls "onCreatedAtmWorkflowSchemaRevision" when "redesign revision" has been clicked',
      async function () {
        sinon.stub(
          CreateAtmWorkflowSchemaRevisionAction.prototype,
          'onExecute'
        ).resolves(4);
        await renderComponent();

        await click('.revision-actions-trigger');
        await click(document.querySelector(
          '.webui-popover.in .create-atm-workflow-schema-revision-action-trigger'
        ));

        expect(this.get('createdAtmWorkflowSchemaRevisionSpy')).to.be.calledOnce
          .and.to.be.calledWith(sinon.match({ name: 'w0' }), 4);
      });
  });

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-workflows/list-view
    atmInventory=atmInventory
    onAddAtmWorkflowSchema=addFunctionSpy
    onOpenAtmWorkflowSchemaRevision=openAtmWorkflowSchemaRevisionSpy
    onCreatedAtmWorkflowSchemaRevision=createdAtmWorkflowSchemaRevisionSpy
  }}`);
}
