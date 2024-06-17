import { expect } from 'chai';
import {
  describe,
  it,
  before,
  beforeEach,
  afterEach,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import EmberObject, { get } from '@ember/object';
import _ from 'lodash';
import ModifyAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import { findByText } from '../../../helpers/find';

describe('Integration | Component | content-atm-inventories-workflows/editor-view',
  function () {
    setupRenderingTest();

    before(function () {
      // Instatiate Action classes to make its `prototype.execute` available for
      // mocking.
      ModifyAtmWorkflowSchemaRevisionAction.create().destroy();
    });

    afterEach(function () {
      // Reset stubbed actions
      [
        ModifyAtmWorkflowSchemaRevisionAction,
      ].forEach(action => {
        if (action.prototype.onExecute.restore) {
          action.prototype.onExecute.restore();
        }
      });
    });

    beforeEach(function () {
      this.setProperties({
        revisionNumber: 2,
        atmWorkflowSchema: EmberObject.create({
          name: 'workflow1',
          revisionRegistry: {
            2: {
              state: 'stable',
              description: 'desc',
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
                },
              }],
            },
          },
        }),
        backSlideSpy: sinon.spy(),
      });
    });

    it('has class "content-atm-inventories-workflows-editor-view"', async function () {
      await render(hbs `{{content-atm-inventories-workflows/editor-view}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('content-atm-inventories-workflows-editor-view');
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      await renderComponent();

      const backSlideSpy = this.get('backSlideSpy');
      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('shows workflow schema name in header', async function () {
      await renderComponent();

      expect(find('.header-row')).to.contain.text('workflow1');
    });

    it('shows workflow schema elements', async function () {
      await renderComponent();

      const workflowVisualiser = find('.workflow-visualiser');
      expect(workflowVisualiser).to.have.class('mode-edit');
      ['lane1', 'pbox1', 'task1'].forEach(textContent =>
        expect(workflowVisualiser).to.contain.text(textContent)
      );
    });

    it('allows to save modified workflow schema revision [modification via visualiser]',
      async function () {
        const {
          atmWorkflowSchema,
          revisionNumber,
        } = this.getProperties('atmWorkflowSchema', 'revisionNumber');
        const newLanes = _.cloneDeep(get(atmWorkflowSchema, 'revisionRegistry.2.lanes'));
        newLanes[0].name = 'newName';
        const executeStub = sinon.stub(ModifyAtmWorkflowSchemaRevisionAction.prototype, 'onExecute')
          .callsFake(function () {
            expect(this.get('atmWorkflowSchema')).to.equal(atmWorkflowSchema);
            expect(this.get('revisionNumber')).to.equal(revisionNumber);
            expect(this.get('revisionDiff')).to.deep.include({
              lanes: newLanes,
            });
          });
        await renderComponent();

        await click('.lane-name .one-label');
        await fillIn('.lane-name .form-control', 'newName');
        await click('.lane-name .save-icon');
        await click('.btn-save');

        expect(executeStub).to.be.calledOnce;
      });

    it('has two tabs - "editor" (default) and "details"', async function () {
      await renderComponent();

      const tabs = findAll('.nav-tabs .nav-link');
      expect(tabs[0]).to.have.trimmed.text('Editor');
      expect(tabs[0]).to.have.class('active');
      expect(find('#editor.tab-pane')).to.have.class('active');
      expect(tabs[1]).to.have.trimmed.text('Details');
    });

    it('shows revision details in "details" tab', async function () {
      await renderComponent();
      const detailsTabLink = findByText('Details', '.nav-link');
      const form = find('.revision-details-form');

      await click(detailsTabLink);

      expect(detailsTabLink).to.have.class('active');
      expect(find('#details.tab-pane')).to.have.class('active');
      expect(form.querySelector('.state-field .dropdown-field-trigger'))
        .to.contain.text('Stable');
      expect(form.querySelector('.description-field .form-control'))
        .to.have.value('desc');
    });

    it('allows to save modified workflow schema revision [modification via details]',
      async function () {
        const {
          atmWorkflowSchema,
          revisionNumber,
        } = this.getProperties('atmWorkflowSchema', 'revisionNumber');
        const executeStub = sinon.stub(ModifyAtmWorkflowSchemaRevisionAction.prototype, 'onExecute')
          .callsFake(function () {
            expect(this.get('atmWorkflowSchema')).to.equal(atmWorkflowSchema);
            expect(this.get('revisionNumber')).to.equal(revisionNumber);
            expect(this.get('revisionDiff')).to.deep.include({
              state: 'deprecated',
              description: 'abcd',
            });
          });
        await renderComponent();

        await click(findByText('Details', '.nav-link'));
        await selectChoose('.state-field', 'Deprecated');
        await fillIn('.description-field .form-control', 'abcd');
        await click('.btn-save');

        expect(executeStub).to.be.calledOnce;
      });
  });

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-workflows/editor-view
    atmWorkflowSchema=atmWorkflowSchema
    revisionNumber=revisionNumber
    onBackSlide=backSlideSpy
  }}`);
}
