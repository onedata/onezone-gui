import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { set, get } from '@ember/object';
import { Promise } from 'rsvp';
import suppressRejections from '../../helpers/suppress-rejections';
import { click, fillIn } from 'ember-native-dom-helpers';
import { selectChoose } from '../../helpers/ember-power-select';

describe('Integration | Component | content atm inventories workflows', function () {
  setupComponentTest('content-atm-inventories-workflows', {
    integration: true,
  });

  suppressRejections();

  beforeEach(function () {
    const atmLambdas = [{
      entityId: 'lambda1',
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
      argumentSpecs: [{
        name: 'argstore',
        dataSpec: {
          type: 'storeCredentials',
          valueConstraints: {
            storeType: 'singleValue',
          },
        },
        isOptional: true,
        isBatch: false,
      }],
      resultSpecs: [],
    }, {
      entityId: 'lambda0',
      name: 'f0',
      summary: 'f0 summary',
      operationSpec: {
        engine: 'onedataFunction',
        functionId: 'f0Function',
      },
      argumentSpecs: [],
      resultSpecs: [],
    }];
    const allInventoriesLambdas = [
      ...atmLambdas, {
        entityId: 'lambda2',
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
    ];
    const atmWorkflowSchemas = [{
      entityId: 'w1id',
      name: 'w1',
      description: 'w1 description',
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
          valueConstraints: {},
        },
      }],
      atmLambdaList: promiseObject(resolve({
        list: promiseArray(resolve(atmLambdas)),
      })),
    }, {
      entityId: 'w0id',
      name: 'w0',
      description: 'w0 description',
      atmLambdaList: promiseObject(resolve({
        list: promiseArray(resolve(atmLambdas)),
      })),
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
    const getRecordByIdStub = sinon.stub(recordManager, 'getRecordById')
      .callsFake((modelName, id) => {
        if (modelName === 'atmWorkflowSchema') {
          const atmWorkflowSchema = atmWorkflowSchemas.findBy('entityId', id);
          return resolve(atmWorkflowSchema || {
            name: 'someName',
            atmInventory: promiseObject(resolve(atmInventory)),
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

  it('has class "content-atm-inventories-workflows"', function () {
    this.render(hbs `{{content-atm-inventories-workflows}}`);

    expect(this.$().children()).to.have.class('content-atm-inventories-workflows')
      .and.to.have.length(1);
  });

  it('contains carousel with four slides', async function () {
    await render(this);

    const $slides = this.$('.one-carousel-slide');
    expect($slides).to.have.length(4);
    expect(getSlide('list')).to.exist;
    expect(getSlide('editor')).to.exist;
    expect(getSlide('lambdaSelector')).to.exist;
    expect(getSlide('taskDetails')).to.exist;
  });

  it('shows workflow schemas list when "view" query param is empty', async function () {
    await render(this);

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
      await render(this);

      expect(isSlideActive('list')).to.be.true;
      expect(getSlide('list').innerText).to.contain('w0 description');
    });

    it('shows workflow schemas list when "workflowId" is not empty',
      async function () {
        set(
          lookupService(this, 'navigation-state'),
          'aspectOptions.workflowId',
          'someId'
        );

        await render(this);

        expect(isSlideActive('list')).to.be.true;
      });

    it('allows to open creator view', async function () {
      await render(this);

      await click(
        getSlide('list').querySelector('.open-add-atm-workflow-schema-trigger')
      );

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'creator');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: null });
    });

    it('allows to open editor view for specific workflow schema', async function () {
      await render(this);

      await click(getSlide('list').querySelector('.atm-workflow-schemas-list-entry'));

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'editor');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: 'w0id' });
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

        await render(this);

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'creator');
      });

    it('shows loading page when workflowId is not empty and workflow is being loaded',
      async function () {
        set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', 'abc');
        this.get('getRecordByIdStub')
          .withArgs('atmWorkflowSchema', 'abc')
          .returns(new Promise(() => {}));

        await render(this);

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'loading');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.spin-spinner')).to.exist;
      });

    it('shows error page when workflowId is not empty and workflow loading failed',
      async function () {
        set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', 'abc');
        this.get('getRecordByIdStub')
          .withArgs('atmWorkflowSchema', 'abc')
          .rejects('someError');

        await render(this);

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'loading');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.resource-load-error')).to.exist;
      });

    it('shows editor page when workflowId is not empty and workflow is loaded',
      async function () {
        set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', 'w1id');
        await render(this);

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'editor');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.header-row').innerText).to.contain('w1');
      });

    it('allows to go back from editor page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', 'abc');
      await render(this);

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: 'abc',
      });
    });

    it('allows to go back from creator page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', null);
      await render(this);

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: null,
      });
    });

    it('allows to go back from loader page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', 'abc');
      this.get('getRecordByIdStub')
        .withArgs('atmWorkflowSchema', 'abc')
        .rejects('someError');
      await render(this);

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({
        view: 'list',
        workflowId: 'abc',
      });
    });

    it('redirects to editor view after workflow creation', async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', null);
      const createdRecord = {
        entityId: 'someId',
        atmLambdaList: promiseObject(resolve({
          list: promiseArray(resolve([])),
        })),
      };
      sinon.stub(
        lookupService(this, 'workflow-actions'),
        'createCreateAtmWorkflowSchemaAction'
      ).returns({
        execute: () => resolve({
          status: 'done',
          result: createdRecord,
        }),
      });
      await render(this);

      await fillIn('.name-field .form-control', 'someName');
      await click('.btn-content-info');

      expect(isSlideActive('editor')).to.be.true;
      expectSlideContainsView('editor', 'editor');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', workflowId: 'someId' });
    });

    it('allows to add new task', async function () {
      const navigationsState = lookupService(this, 'navigation-state');
      set(navigationsState, 'aspectOptions.workflowId', 'w1id');
      await render(this);
      const editorSlide = getSlide('editor');
      const lambdaSelectorSlide = getSlide('lambdaSelector');
      const taskDetailsSlide = getSlide('taskDetails');

      await click(editorSlide.querySelector('.create-task-action-trigger'));

      expect(isSlideActive('lambdaSelector')).to.be.true;
      await click(
        lambdaSelectorSlide.querySelectorAll('.add-to-workflow-action-trigger')[1]
      );

      expect(isSlideActive('taskDetails')).to.be.true;
      await selectChoose('.valueBuilderType-field', 'Store credentials');
      await selectChoose('.valueBuilderStore-field', 'store1');
      await click(taskDetailsSlide.querySelector('.btn-submit'));

      expect(isSlideActive('editor')).to.be.true;
      const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
      expect(tasks).to.have.length(2);
      expect(tasks[1].innerText).to.contain('f1');
      await click(editorSlide.querySelector('.btn-save'));

      const atmWorkflowSchema = this.get('atmWorkflowSchemas').findBy('entityId', 'w1id');
      expect(atmWorkflowSchema.lanes[0].parallelBoxes[0].tasks[1]).to.deep.include({
        name: 'f1',
        lambdaId: 'lambda1',
        argumentMappings: [{
          argumentName: 'argstore',
          valueBuilder: {
            valueBuilderType: 'storeCredentials',
            valueBuilderRecipe: 's1',
          },
        }],
        resultMappings: [],
      });
    });

    it('allows to add new task using lambda from another inventory', async function () {
      const navigationsState = lookupService(this, 'navigation-state');
      const attachAtmLambdaToAtmInventoryStub =
        this.get('attachAtmLambdaToAtmInventoryStub');
      set(navigationsState, 'aspectOptions.workflowId', 'w1id');
      await render(this);
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
      expect(atmWorkflowSchema.lanes[0].parallelBoxes[0].tasks[1]).to.deep.include({
        name: 'f2',
        lambdaId: 'lambda2',
        argumentMappings: [],
        resultMappings: [],
      });
    });

    it('allows to go back from lambdas selector during task creation', async function () {
      const navigationsState = lookupService(this, 'navigation-state');
      set(navigationsState, 'aspectOptions.workflowId', 'w1id');
      await render(this);
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
        await render(this);
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
        await render(this);
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
        await render(this);
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
      await render(this);
      const editorSlide = getSlide('editor');
      const taskDetailsSlide = getSlide('taskDetails');

      await click(editorSlide.querySelector('.task-actions-trigger'));
      await click('.modify-task-action-trigger');

      expect(isSlideActive('taskDetails')).to.be.true;
      await fillIn('.name-field .form-control', 'newName');
      await selectChoose('.valueBuilderType-field', 'Store credentials');
      await selectChoose('.valueBuilderStore-field', 'store1');
      await click(taskDetailsSlide.querySelector('.btn-submit'));

      expect(isSlideActive('editor')).to.be.true;
      const tasks = editorSlide.querySelectorAll('.workflow-visualiser-task');
      expect(tasks).to.have.length(1);
      expect(tasks[0].innerText).to.contain('newName');
      await click(editorSlide.querySelector('.btn-save'));

      const atmWorkflowSchema = this.get('atmWorkflowSchemas').findBy('entityId', 'w1id');
      expect(atmWorkflowSchema.lanes[0].parallelBoxes[0].tasks[0]).to.deep.include({
        name: 'newName',
        argumentMappings: [{
          argumentName: 'argstore',
          valueBuilder: {
            valueBuilderType: 'storeCredentials',
            valueBuilderRecipe: 's1',
          },
        }],
      });
    });

    it('allows to go back to editor from task details during task modification',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions.workflowId', 'w1id');
        await render(this);
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
        await render(this);
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
        });

        await render(this);

        expect(get(navigationsState, 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w1id' });
      });
  });

  context('when "view" query param is "taskDetails"', function () {
    it('redirects to editor view when component is entered directly via url',
      async function () {
        const navigationsState = lookupService(this, 'navigation-state');
        set(navigationsState, 'aspectOptions', {
          view: 'taskDetails',
          workflowId: 'w1id',
        });

        await render(this);

        expect(get(navigationsState, 'aspectOptions'))
          .to.deep.equal({ view: 'editor', workflowId: 'w1id' });
      });
  });
});

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows
    atmInventory=atmInventory
  }}`);
  await wait();
}

function expectSlideContainsView(slideId, viewName) {
  const slide = getSlide(slideId);
  expect(slide.children).to.have.length(1);
  expect(slide.children[0].className)
    .to.contain(`content-atm-inventories-workflows-${viewName}-view`);

}
