import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { set, get, setProperties } from '@ember/object';
import { Promise, resolve } from 'rsvp';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | content-atm-inventories-workflows (main)', function () {
  setupRenderingTest();

  beforeEach(function () {
    const store = lookupService(this, 'store');
    const atmLambdas = [
      store.createRecord('atm-lambda', {
        id: 'atm_lambda.lambda1.instance:private',
        revisionRegistry: {
          1: {
            name: 'f1',
            summary: 'f1 summary',
            preferredBatchSize: 10,
            operationSpec: {
              engine: 'openfaas',
              dockerImage: 'f1Image',
              dockerExecutionOptions: {
                readonly: false,
                mountOneclient: false,
              },
            },
            argumentSpecs: [{
              name: 'argstring',
              dataSpec: {
                type: 'string',
              },
              isOptional: true,
            }],
            resultSpecs: [],
          },
        },
      }),
      store.createRecord('atm-lambda', {
        id: 'atm_lambda.lambda0.instance:private',
        revisionRegistry: {
          1: {
            name: 'f0',
            summary: 'f0 summary',
            operationSpec: {
              engine: 'onedataFunction',
              functionId: 'f0Function',
            },
            argumentSpecs: [],
            resultSpecs: [],
          },
        },
      }),
    ];
    const allInventoriesLambdas = [
      ...atmLambdas, store.createRecord('atm-lambda', {
        id: 'atm_lambda.lambda2.instance:private',
        revisionRegistry: {
          1: {
            name: 'f2',
            summary: 'f2 summary',
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
          },
        },
      }),
    ];
    const atmWorkflowSchemas = [{
      entityId: 'w1id',
      name: 'w1',
      summary: 'w1 summary',
      revisionRegistry: {
        2: {
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
                lambdaId: 'lambda1',
                lambdaRevisionNumber: 1,
                name: 'task1',
                argumentMappings: [],
                resultMappings: [],
              }],
            }],
          }],
          stores: [{
            id: 's1',
            name: 'store1',
            type: 'singleValue',
            dataSpec: {
              type: 'string',
            },
          }],
        },
      },
      atmLambdaList: promiseObject(resolve({
        list: promiseArray(resolve(atmLambdas)),
      })),
      isLoaded: true,
      save: resolve,
    }, {
      entityId: 'w0id',
      name: 'w0',
      summary: 'w0 summary',
      revisionRegistry: {},
      atmLambdaList: promiseObject(resolve({
        list: promiseArray(resolve(atmLambdas)),
      })),
      isLoaded: true,
      save: resolve,
    }];
    const atmInventory = {
      entityId: 'inv1',
      atmWorkflowSchemaList: promiseObject(resolve({
        list: promiseArray(resolve(atmWorkflowSchemas)),
      })),
      atmLambdaList: promiseObject(resolve({
        list: promiseArray(resolve(atmLambdas)),
      })),
      privileges: {
        view: true,
        manageWorkflowSchemas: true,
      },
    };
    atmWorkflowSchemas.forEach(atmWorkflowSchema =>
      atmWorkflowSchema.atmInventory = promiseObject(resolve(atmInventory))
    );

    const workflowManager = lookupService(this, 'workflow-manager');
    const recordManager = lookupService(this, 'record-manager');
    const navigationState = lookupService(this, 'navigation-state');
    sinon.stub(navigationState, 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
    sinon.stub(workflowManager, 'getAllKnownAtmLambdas')
      .returns(promiseArray(resolve(allInventoriesLambdas)));
    const attachAtmLambdaToAtmInventoryStub = sinon.stub(
      workflowManager,
      'attachAtmLambdaToAtmInventory'
    ).resolves();
    sinon.stub(workflowManager, 'saveAtmWorkflowSchemaRevision')
      .callsFake((atmWorkflowSchemaId, revisionNumber, revisionData) => {
        const wf = atmWorkflowSchemas.findBy('entityId', atmWorkflowSchemaId);
        set(wf.revisionRegistry, String(revisionNumber), revisionData);
        return resolve();
      });
    const getRecordByIdStub = sinon.stub(recordManager, 'getRecordById')
      .callsFake((modelName, id) => {
        if (modelName === 'atmWorkflowSchema') {
          const atmWorkflowSchema = atmWorkflowSchemas.findBy('entityId', id);
          return resolve(atmWorkflowSchema || {
            name: 'someName',
            atmInventory: promiseObject(resolve(atmInventory)),
            atmLambdaList: promiseObject(resolve({
              list: promiseArray(resolve(atmLambdas)),
            })),
          });
        }
        return resolve(null);
      });
    sinon.stub(recordManager, 'getLoadedRecordById')
      .callsFake((modelName, id) => {
        if (modelName === 'atmLambda') {
          return atmLambdas.findBy('entityId', id) || null;
        }
        return null;
      });

    this.setProperties({
      atmInventory,
      atmWorkflowSchemas,
      getRecordByIdStub,
      attachAtmLambdaToAtmInventoryStub,
    });
  });

  it('has class "content-atm-inventories-workflows"', async function () {
    await render(hbs `{{content-atm-inventories-workflows}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('content-atm-inventories-workflows');
  });

  it('contains carousel with five slides', async function () {
    await renderComponent();

    expect(findAll('.one-carousel-slide')).to.have.length(5);
    expect(getSlide('list')).to.exist;
    expect(getSlide('editor')).to.exist;
    expect(getSlide('lambdaSelector')).to.exist;
    expect(getSlide('lambdaCreator')).to.exist;
    expect(getSlide('taskDetails')).to.exist;
  });

  it('shows workflow schemas list when "view" query param is empty', async function () {
    await renderComponent();

    expect(isSlideActive('list')).to.be.true;
    const listSlide = getSlide('list');
    const listView = listSlide.querySelector('.content-atm-inventories-workflows-list-view');
    expect(listView).to.exist;
    expect(listView.innerText).to.contain('w0');
    expect(listView.innerText).to.contain('w1');
  });

  context('when "view" query param is "list"', function () {
    beforeEach(function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'list',
      });
    });

    it('shows workflow schemas list', async function () {
      await renderComponent();

      expect(isSlideActive('list')).to.be.true;
      expect(getSlide('list').innerText).to.contain('w0 summary');
    });

    it('shows workflow schemas list when "workflowId" and "revision" are not empty',
      async function () {
        setProperties(get(lookupService(this, 'navigation-state'), 'aspectOptions'), {
          workflowId: 'w1id',
          revision: '2',
        });

        await renderComponent();

        expect(isSlideActive('list')).to.be.true;
      });

    it('allows to open creator view', async function () {
      await renderComponent();

      await click(
        getSlide('list').querySelector('.open-add-atm-workflow-schema-trigger')
      );

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'creator');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: null, revision: null });
    });

    it('allows to open editor view for specific workflow schema', async function () {
      await renderComponent();

      await click(getSlide('list').querySelector('.revisions-table-revision-entry'));

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'editor');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: 'w1id', revision: '2' });
    });

    it('allows to create new revision and opens it in editor after creation',
      async function () {
        await renderComponent();

        await click(
          getSlide('list').querySelector('.revisions-table-create-revision-entry')
        );

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'editor');
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w0id', revision: '1' });
      });

    it('allows to redesign existing revision and opens it in editor after creation',
      async function () {
        await renderComponent();

        await click(
          getSlide('list').querySelector('.revision-actions-trigger')
        );
        await click(globals.document.querySelector(
          '.webui-popover.in .create-atm-workflow-schema-revision-action-trigger'
        ));

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'editor');
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w1id', revision: '3' });
      });
  });

  context('when "view" query param is "editor"', function () {
    beforeEach(function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'editor',
      });
    });

    it('shows workflow schema creator when "workflowId" is empty',
      async function () {
        set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', null);

        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'creator');
      });

    it('shows loading page when all query params are provided and workflow is being loaded',
      async function () {
        const navigationState = lookupService(this, 'navigation-state');
        set(navigationState, 'aspectOptions.workflowId', 'abc');
        set(navigationState, 'aspectOptions.revision', '2');
        this.get('getRecordByIdStub')
          .withArgs('atmWorkflowSchema', 'abc')
          .returns(new Promise(() => {}));

        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'loading');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.spin-spinner')).to.exist;
      });

    it('shows error page when all query params are provided and workflow loading failed',
      async function () {
        const navigationState = lookupService(this, 'navigation-state');
        let rejectCallback;
        set(navigationState, 'aspectOptions.workflowId', 'abc');
        set(navigationState, 'aspectOptions.revision', '2');
        this.get('getRecordByIdStub')
          .withArgs('atmWorkflowSchema', 'abc')
          .returns(new Promise((resolve, reject) => { rejectCallback = reject; }));

        await renderComponent();
        rejectCallback();
        await settled();

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'loading');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.resource-load-error')).to.exist;
      });

    it('shows editor page when all query params are provided and workflow is loaded',
      async function () {
        const navigationState = lookupService(this, 'navigation-state');
        set(navigationState, 'aspectOptions.workflowId', 'w1id');
        set(navigationState, 'aspectOptions.revision', '2');
        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'editor');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.header-row').innerText).to.contain('w1');
      });

    it('allows to go back from editor page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', 'w1id');
      set(navigationState, 'aspectOptions.revision', '2');
      await renderComponent();

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: 'w1id',
        revision: '2',
      });
    });

    it('allows to go back from creator page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', null);
      await renderComponent();

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: null,
        revision: null,
      });
    });

    it('allows to go back from loader page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', 'abc');
      set(navigationState, 'aspectOptions.revision', '2');
      this.get('getRecordByIdStub')
        .withArgs('atmWorkflowSchema', 'abc')
        .returns(new Promise(() => {}));
      await renderComponent();

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: 'abc',
        revision: '2',
      });
    });

    it('redirects to editor view after workflow creation', async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', null);
      const {
        atmWorkflowSchemas,
        atmInventory,
      } = this.getProperties('atmWorkflowSchemas', 'atmInventory');
      const createdRecord = {
        entityId: 'someId',
        revisionRegistry: {
          1: {},
        },
        atmInventory: promiseObject(resolve(atmInventory)),
        atmLambdaList: promiseObject(resolve({
          list: promiseArray(resolve([])),
        })),
      };
      sinon.stub(
        lookupService(this, 'workflow-actions'),
        'createCreateAtmWorkflowSchemaAction'
      ).returns({
        execute: () => {
          atmWorkflowSchemas.push(createdRecord);
          return resolve({
            status: 'done',
            result: createdRecord,
          });
        },
        destroy: () => {},
      });
      await renderComponent();
      await fillIn('.name-field .form-control', 'someName');
      await click('.btn-content-info');

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'editor');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: 'someId', revision: '1' });
    });

    it('allows to add new task', async function () {
      const navigationsState = lookupService(this, 'navigation-state');
      set(navigationsState, 'aspectOptions.workflowId', 'w1id');
      set(navigationsState, 'aspectOptions.revision', '2');
      await renderComponent();
      const editorSlide = getSlide('editor');
      const lambdaSelectorSlide = getSlide('lambdaSelector');
      const taskDetailsSlide = getSlide('taskDetails');

      await click(editorSlide.querySelector('.create-task-action-trigger'));

      expect(isSlideActive('lambdaSelector')).to.be.true;
      await click(
        lambdaSelectorSlide.querySelectorAll('.add-to-workflow-action-trigger')[1]
      );

      expect(isSlideActive('taskDetails')).to.be.true;
      await selectChoose('.valueBuilderType-field', 'Iterated item');
      await click(taskDetailsSlide.querySelector('.btn-submit'));

      expect(isSlideActive('editor')).to.be.true;
      const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
      expect(tasks).to.have.length(2);
      expect(tasks[1].innerText).to.contain('f1');
      await click(editorSlide.querySelector('.btn-save'));

      const atmWorkflowSchema = this.get('atmWorkflowSchemas').findBy('entityId', 'w1id');
      expect(atmWorkflowSchema.revisionRegistry[2].lanes[0].parallelBoxes[0].tasks[1])
        .to.deep.include({
          name: 'f1',
          lambdaId: 'lambda1',
          lambdaRevisionNumber: 1,
          argumentMappings: [{
            argumentName: 'argstring',
            valueBuilder: {
              valueBuilderType: 'iteratedItem',
            },
          }],
          resultMappings: [],
        });
    });

    it('allows to add new task using lambda from another inventory',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        const attachAtmLambdaToAtmInventoryStub =
          this.get('attachAtmLambdaToAtmInventoryStub');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const lambdaSelectorSlide = getSlide('lambdaSelector');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.create-task-action-trigger'));
        await click(lambdaSelectorSlide.querySelector('.btn-all'));
        await click(
          lambdaSelectorSlide.querySelectorAll('.add-to-workflow-action-trigger')[2]
        );

        expect(attachAtmLambdaToAtmInventoryStub).to.be.not.called;
        await click(taskDetailsSlide.querySelector('.btn-submit'));

        expect(isSlideActive('editor')).to.be.true;
        const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
        expect(tasks).to.have.length(2);
        expect(tasks[1].innerText).to.contain('f2');
        expect(attachAtmLambdaToAtmInventoryStub).to.be.calledOnce
          .and.to.be.calledWith('lambda2', 'inv1');
        await click(editorSlide.querySelector('.btn-save'));

        const atmWorkflowSchema = this.get('atmWorkflowSchemas').findBy('entityId', 'w1id');
        expect(atmWorkflowSchema.revisionRegistry[2].lanes[0].parallelBoxes[0].tasks[1])
          .to.deep.include({
            name: 'f2',
            lambdaId: 'lambda2',
            lambdaRevisionNumber: 1,
            argumentMappings: [],
            resultMappings: [],
          });
      });

    it('allows to go back from lambdas selector during task creation',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const lambdaSelectorSlide = getSlide('lambdaSelector');

        await click(editorSlide.querySelector('.create-task-action-trigger'));
        await click(lambdaSelectorSlide.querySelector('.content-back-link'));

        expect(isSlideActive('editor')).to.be.true;
        const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
        expect(tasks).to.have.length(1);
      });

    it('allows to go back to lambdas selector from task details during task creation',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const lambdaSelectorSlide = getSlide('lambdaSelector');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.create-task-action-trigger'));
        await click(lambdaSelectorSlide.querySelector('.add-to-workflow-action-trigger'));
        await click(taskDetailsSlide.querySelector('.content-back-link'));

        expect(isSlideActive('lambdaSelector')).to.be.true;
      });

    it('allows to go back to editor from task details during task creation',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const lambdaSelectorSlide = getSlide('lambdaSelector');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.create-task-action-trigger'));
        await click(lambdaSelectorSlide.querySelector('.add-to-workflow-action-trigger'));
        await click(taskDetailsSlide.querySelector('.content-back-link'));
        await click(lambdaSelectorSlide.querySelector('.content-back-link'));

        expect(isSlideActive('editor')).to.be.true;
      });

    it('navigates to editor on "Cancel" click from task details during task creation',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const lambdaSelectorSlide = getSlide('lambdaSelector');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.create-task-action-trigger'));
        await click(lambdaSelectorSlide.querySelector('.add-to-workflow-action-trigger'));
        await click(taskDetailsSlide.querySelector('.btn-cancel'));

        expect(isSlideActive('editor')).to.be.true;
      });

    it('allows to modify existing task', async function () {
      const navigationsState = lookupService(this, 'navigation-state');
      set(navigationsState, 'aspectOptions.workflowId', 'w1id');
      set(navigationsState, 'aspectOptions.revision', '2');
      await renderComponent();
      const editorSlide = getSlide('editor');
      const taskDetailsSlide = getSlide('taskDetails');

      await click(editorSlide.querySelector('.task-actions-trigger'));
      await click('.modify-task-action-trigger');

      expect(isSlideActive('taskDetails')).to.be.true;
      await fillIn(taskDetailsSlide.querySelector('.name-field .form-control'), 'newName');
      await selectChoose('.valueBuilderType-field', 'Constant value');
      await fillIn('.valueBuilderConstValue-field .form-control', 'abc');
      await click(taskDetailsSlide.querySelector('.btn-submit'));

      expect(isSlideActive('editor')).to.be.true;
      const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
      expect(tasks).to.have.length(1);
      expect(tasks[0].innerText).to.contain('newName');
      await click(editorSlide.querySelector('.btn-save'));

      const atmWorkflowSchema = this.get('atmWorkflowSchemas').findBy('entityId', 'w1id');
      expect(atmWorkflowSchema.revisionRegistry[2].lanes[0].parallelBoxes[0].tasks[0])
        .to.deep.include({
          name: 'newName',
          argumentMappings: [{
            argumentName: 'argstring',
            valueBuilder: {
              valueBuilderType: 'const',
              valueBuilderRecipe: 'abc',
            },
          }],
        });
    });

    it('allows to go back to editor from task details during task modification',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.task-actions-trigger'));
        await click('.modify-task-action-trigger');
        await click(taskDetailsSlide.querySelector('.content-back-link'));

        expect(isSlideActive('editor')).to.be.true;
      });

    it('navigates to editor on "Cancel" click from task details during task modification',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        set(navigationsState, 'aspectOptions.revision', '2');
        await renderComponent();
        const editorSlide = getSlide('editor');
        const taskDetailsSlide = getSlide('taskDetails');

        await click(editorSlide.querySelector('.task-actions-trigger'));
        await click('.modify-task-action-trigger');
        await click(taskDetailsSlide.querySelector('.btn-cancel'));

        expect(isSlideActive('editor')).to.be.true;
      });
  });

  context('when "view" query param is "lambdaSelector"', function () {
    it('redirects to editor view when component is entered directly via url',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions', {
          view: 'lambdaSelector',
          workflowId: 'w1id',
          revision: '2',
        });

        await renderComponent();

        expect(get(navigationsState, 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w1id', revision: '2' });
      });
  });

  context('when "view" query param is "taskDetails"', function () {
    it('redirects to editor view when component is entered directly via url',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions', {
          view: 'taskDetails',
          workflowId: 'w1id',
          revision: '2',
        });

        await renderComponent();

        expect(get(navigationsState, 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w1id', revision: '2' });
      });
  });
});

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-workflows
    atmInventory=atmInventory
  }}`);
}

function expectSlideContainsView(slideId, viewName) {
  const slide = getSlide(slideId);
  expect(slide.children).to.have.length(1);
  expect(slide.children[0].className)
    .to.contain(`content-atm-inventories-workflows-${viewName}-view`);

}
