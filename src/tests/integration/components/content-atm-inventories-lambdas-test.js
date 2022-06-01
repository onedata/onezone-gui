import { expect } from 'chai';
import {
  describe,
  it,
  beforeEach,
  before,
  afterEach,
  context,
} from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
import { resolve, Promise } from 'rsvp';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { selectChoose } from '../../helpers/ember-power-select';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';
import { set, setProperties, get } from '@ember/object';

describe('Integration | Component | content atm inventories lambdas', function () {
  setupRenderingTest();

  before(function () {
    // Instatiate Action class to make its `prototype.execute` available for
    // mocking.
    CreateAtmLambdaAction.create();
    CreateAtmLambdaRevisionAction.create();
    ModifyAtmLambdaRevisionAction.create();
  });

  beforeEach(function () {
    const store = lookupService(this, 'store');
    const lambda0 = store.createRecord('atm-lambda', {
      id: 'atm_lambda.lambda0.instance:private',
      revisionRegistry: {
        1: {
          name: 'f0',
          state: 'draft',
          summary: 'f0 summary',
          operationSpec: {
            engine: 'onedataFunction',
            functionId: 'f0Function',
          },
          preferredBatchSize: 100,
          argumentSpecs: [],
          resultSpecs: [],
          resourceSpec: {
            cpuRequested: 2,
            cpuLimit: 3,
            memoryRequested: 20 * 1024 * 1024,
            memoryLimit: 30 * 1024 * 1024,
            ephemeralStorageRequested: 1024 * 1024,
            ephemeralStorageLimit: 10 * 1024 * 1024,
          },
        },
      },
    });
    const lambda1 = store.createRecord('atm-lambda', {
      id: 'atm_lambda.lambda1.instance:private',
      revisionRegistry: {
        1: {
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
          preferredBatchSize: 100,
          argumentSpecs: [],
          resultSpecs: [],
          resourceSpec: {
            cpuRequested: 2,
            cpuLimit: 3,
            memoryRequested: 20 * 1024 * 1024,
            memoryLimit: 30 * 1024 * 1024,
            ephemeralStorageRequested: 1024 * 1024,
            ephemeralStorageLimit: 10 * 1024 * 1024,
          },
        },
      },
    });
    const atmLambdas = [lambda0, lambda1];
    const atmLambdaList = store.createRecord('atmLambdaList', {
      list: atmLambdas,
    });
    const atmInventory = store.createRecord('atmInventory', {
      privileges: {
        view: true,
        manageLambdas: true,
      },
      atmLambdaList,
    });
    const atmInventoryList = store.createRecord('atmInventoryList', {
      list: [atmInventory],
    });
    atmLambdas.forEach(atmLambda =>
      set(atmLambda, 'atmInventoryList', atmInventoryList)
    );

    const recordManager = lookupService(this, 'record-manager');
    const navigationState = lookupService(this, 'navigation-state');

    const getRecordByIdStub = sinon.stub(recordManager, 'getRecordById')
      .callsFake((modelName, id) => {
        if (modelName === 'atmLambda') {
          const atmWorkflowSchema = atmLambdas.findBy('entityId', id);
          return resolve(atmWorkflowSchema);
        }
        return resolve(null);
      });
    sinon.stub(navigationState, 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });

    this.setProperties({
      atmInventory,
      getRecordByIdStub,
    });
  });

  afterEach(function () {
    // Reset stubbed actions
    [
      CreateAtmLambdaAction,
      CreateAtmLambdaRevisionAction,
      ModifyAtmLambdaRevisionAction,
    ].forEach(action => {
      if (action.prototype.onExecute.restore) {
        action.prototype.onExecute.restore();
      }
    });
  });

  it('has class "content-atm-inventories-lambdas"', async function () {
    await render(hbs `{{content-atm-inventories-lambdas}}`);

    expect(this.element.children).to.have.length(1);
    expect(this.element.children[0]).to.have.class('content-atm-inventories-lambdas');
  });

  it('contains carousel with two slides', async function () {
    await renderComponent();

    expect(findAll('.one-carousel-slide')).to.have.length(2);
    expect(getSlide('list')).to.exist;
    expect(getSlide('editor')).to.exist;
    expect(isSlideActive('list')).to.be.true;
  });

  context('when "view" query param is "list"', function () {
    beforeEach(function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'list',
      });
    });

    it('shows lambdas list in "list" slide', async function (done) {
      await renderComponent();

      const listSlide = getSlide('list');
      const listView = listSlide.querySelector('.content-atm-inventories-lambdas-list-view');
      expect(listView).to.exist;
      expect(listView.innerText).to.contain('f0');
      expect(listView.innerText).to.contain('f1');
      done();
    });

    it('shows lambdas list when "lambdaId" and "revision" are not empty',
      async function (done) {
        setProperties(get(lookupService(this, 'navigation-state'), 'aspectOptions'), {
          lambdaId: 'lambda1',
          revision: '2',
        });

        await renderComponent();

        expect(isSlideActive('list')).to.be.true;
        done();
      });

    it('allows to open editor in creation mode', async function (done) {
      await renderComponent();

      await click(
        getSlide('list').querySelector('.open-add-atm-lambda-trigger')
      );

      expect(isSlideActive('editor')).to.be.true;
      expect(getSlide('editor').innerText).to.contain('Add new lambda');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'creator', lambdaId: null, revision: null });
      done();
    });

    it('allows to open editor for specific lambda', async function (done) {
      await renderComponent();

      await click(getSlide('list').querySelector('.revisions-table-revision-entry'));

      expect(isSlideActive('editor')).to.be.true;
      expect(getSlide('editor').innerText).to.contain('Modify lambda');
      expect(getSlide('editor').querySelector('.name-field .form-control').value)
        .to.equal('f0');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'editor', lambdaId: 'lambda0', revision: '1' });
      done();
    });

    it('allows to open new lambda revision creator', async function (done) {
      await renderComponent();

      await click(
        getSlide('list').querySelectorAll('.revisions-table-create-revision-entry')[1]
      );

      expect(isSlideActive('editor')).to.be.true;
      expect(getSlide('editor').innerText).to.contain('Add new lambda revision');
      expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
        .to.deep.equal({ view: 'creator', lambdaId: 'lambda1', revision: '1' });
      done();
    });

    it('allows to open new lambda revision creator based on old revision',
      async function (done) {
        await renderComponent();

        await click(
          getSlide('list').querySelectorAll('.revision-actions-trigger')[1]
        );
        await click(document.querySelector(
          '.webui-popover.in .create-atm-lambda-revision-action-trigger'
        ));

        expect(isSlideActive('editor')).to.be.true;
        expect(getSlide('editor').innerText).to.contain('Add new lambda revision');
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'creator', lambdaId: 'lambda1', revision: '1' });
        done();
      });
  });

  context('when "view" query param is "creator"', function () {
    beforeEach(function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'creator',
      });
    });

    itAllowsToGetBackToList(async () =>
      await click(getSlide('list').querySelector('.open-add-atm-lambda-trigger')), {
        lambdaId: null,
        revision: null,
      });

    context('when "lambdaId" and "revision" query params are empty', function () {
      it('shows lambda creator', async function (done) {
        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expect(getSlide('editor').innerText).to.contain('Add new lambda');
        expect(getSlide('editor').querySelector('.name-field .form-control').value)
          .to.equal('');
        done();
      });

      it('allows to add new lambda', async function (done) {
        const atmInventory = this.get('atmInventory');
        const createStub = sinon.stub(CreateAtmLambdaAction.prototype, 'onExecute')
          .callsFake(function () {
            // Checking only if atmInventory is passed. Function creation is tested
            // in nested components.
            expect(this.get('context.atmInventory')).to.equal(atmInventory);
          });
        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await fillIn('.dockerImage-field .form-control', 'someImage');
        await click('.btn-submit');
        expect(createStub).to.be.calledOnce;
        expect(isSlideActive('list')).to.be.true;
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'list', lambdaId: null, revision: null });

        done();
      });
    });

    context('when "lambdaId" and "revision" query params are provided', function () {
      beforeEach(function () {
        const navigationState = lookupService(this, 'navigation-state');
        set(navigationState, 'aspectOptions.lambdaId', 'lambda0');
        set(navigationState, 'aspectOptions.revision', '1');
      });

      itShowsLoader();

      it('shows lambda revision creator', async function (done) {
        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expect(getSlide('editor').innerText).to.contain('Add new lambda revision');
        expect(getSlide('editor').querySelector('.name-field .form-control').value)
          .to.equal('f0');
        done();
      });

      it('allows to add new lambda revision', async function (done) {
        const createStub = sinon.stub(CreateAtmLambdaRevisionAction.prototype, 'onExecute');
        await renderComponent();

        await fillIn('.name-field .form-control', 'someName');
        await click('.btn-submit');
        expect(createStub).to.be.calledOnce;
        expect(isSlideActive('list')).to.be.true;
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'list', lambdaId: 'lambda0', revision: '1' });
        done();
      });
    });
  });

  context('when "view" query param is "editor"', function () {
    beforeEach(function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'editor',
      });
    });

    context('when "lambdaId" and "revision" query params are empty', function () {
      it('redirects to "list" view', async function (done) {
        await renderComponent();

        expect(isSlideActive('list')).to.be.true;
        done();
      });
    });

    context('when "lambdaId" and "revision" query params are provided', function () {
      beforeEach(function () {
        const navigationState = lookupService(this, 'navigation-state');
        set(navigationState, 'aspectOptions.lambdaId', 'lambda0');
        set(navigationState, 'aspectOptions.revision', '1');
      });

      itShowsLoader();

      itAllowsToGetBackToList(() => {}, {
        lambdaId: 'lambda0',
        revision: '1',
      });

      it('shows lambda revision editor', async function (done) {
        await renderComponent();

        expect(isSlideActive('editor')).to.be.true;
        expect(getSlide('editor').innerText).to.contain('Modify lambda revision');
        expect(getSlide('editor').querySelector('.name-field .form-control').value)
          .to.equal('f0');
        done();
      });

      it('allows to modify lambda revision', async function (done) {
        const modifyStub = sinon.stub(ModifyAtmLambdaRevisionAction.prototype, 'onExecute');
        await renderComponent();

        await selectChoose('.state-field', 'Stable');
        await click('.btn-submit');
        expect(modifyStub).to.be.calledOnce;
        expect(isSlideActive('list')).to.be.true;
        expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
          .to.deep.equal({ view: 'list', lambdaId: 'lambda0', revision: '1' });
        done();
      });
    });
  });
});

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-lambdas
    atmInventory=atmInventory
  }}`);
}

function itAllowsToGetBackToList(enterEditorCallback, expectedListQueryParams) {
  const expectedQueryParams =
    Object.assign({ view: 'list' }, expectedListQueryParams);
  it('allows to get back to "list" slide using back link', async function (done) {
    await renderComponent();

    await enterEditorCallback(this);
    expect(isSlideActive('editor')).to.be.true;

    await click(getSlide('editor').querySelector('.content-back-link'));
    expect(isSlideActive('list')).to.be.true;
    expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
      .to.deep.equal(expectedQueryParams);
    done();
  });

  it('allows to get back to "list" slide using cancel button', async function (done) {
    await renderComponent();

    await enterEditorCallback(this);
    expect(isSlideActive('editor')).to.be.true;

    await click(getSlide('editor').querySelector('.btn-cancel'));
    expect(isSlideActive('list')).to.be.true;
    expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
      .to.deep.equal(expectedQueryParams);
    done();
  });
}

function itShowsLoader() {
  it('shows loading page when lambda is being loaded', async function (done) {
    this.get('getRecordByIdStub')
      .withArgs('atmLambda', 'lambda0')
      .returns(new Promise(() => {}));

    await renderComponent();

    expect(isSlideActive('editor')).to.be.true;
    expect(getSlide('editor').querySelector('.spin-spinner')).to.exist;
    done();
  });

  it('shows error page when lambda loading failed', async function (done) {
    let rejectCallback;
    this.get('getRecordByIdStub')
      .withArgs('atmLambda', 'lambda0')
      .returns(new Promise((resolve, reject) => { rejectCallback = reject; }));

    await renderComponent();
    rejectCallback();
    await settled();

    expect(isSlideActive('editor')).to.be.true;
    expect(getSlide('editor').querySelector('.resource-load-error')).to.exist;
    done();
  });

  it('allows to go back from loader page', async function (done) {
    this.get('getRecordByIdStub')
      .withArgs('atmLambda', 'lambda0')
      .returns(new Promise(() => {}));
    await renderComponent();

    await click(getSlide('editor').querySelector('.content-back-link'));

    expect(isSlideActive('list')).to.be.true;
    expect(get(lookupService(this, 'navigation-state'), 'aspectOptions'))
      .to.deep.equal({ view: 'list', lambdaId: 'lambda0', revision: '1' });
    done();
  });
}
