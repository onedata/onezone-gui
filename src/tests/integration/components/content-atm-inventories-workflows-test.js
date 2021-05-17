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

describe('Integration | Component | content atm inventories workflows', function () {
  setupComponentTest('content-atm-inventories-workflows', {
    integration: true,
  });

  suppressRejections();

  beforeEach(function () {
    const atmInventory = {
      atmWorkflowSchemaList: promiseObject(resolve({
        list: promiseArray(resolve([{
          entityId: 'w1id',
          name: 'w1',
          description: 'w1 description',
        }, {
          entityId: 'w0id',
          name: 'w0',
          description: 'w0 description',
        }])),
      })),
    };
    this.setProperties({
      atmInventory,
      getRecordByIdStub: sinon.stub(lookupService(this, 'record-manager'), 'getRecordById')
        .withArgs('atmWorkflowSchema', sinon.match.any)
        .resolves({
          name: 'someName',
          atmInventory: promiseObject(resolve(atmInventory)),
        }),
    });
    sinon.stub(lookupService(this, 'navigation-state'), 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
  });

  it('has class "content-atm-inventories-workflows"', function () {
    this.render(hbs `{{content-atm-inventories-workflows}}`);

    expect(this.$().children()).to.have.class('content-atm-inventories-workflows')
      .and.to.have.length(1);
  });

  it('contains carousel with two slides', async function () {
    await render(this);

    const $slides = this.$('.one-carousel-slide');
    expect($slides).to.have.length(2);
    expect(getSlide('list')).to.exist;
    expect(getSlide('editor')).to.exist;
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
        set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', 'abc');

        await render(this);

        expect(isSlideActive('editor')).to.be.true;
        expectSlideContainsView('editor', 'editor');
        const editorSlide = getSlide('editor');
        expect(editorSlide.querySelector('.header-row').innerText).to.contain('someName');
      });

    it('allows to go back from editor page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', 'abc');
      await render(this);

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({ view: 'list' });
    });

    it('allows to go back from creator page', async function () {
      const navigationState = lookupService(this, 'navigation-state');
      set(navigationState, 'aspectOptions.workflowId', null);
      await render(this);

      await click(getSlide('editor').querySelector('.content-back-link'));

      expect(isSlideActive('list')).to.be.true;
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({ view: 'list' });
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
      expect(get(navigationState, 'aspectOptions')).to.deep.equal({ view: 'list' });
    });

    it('redirects to editor view after workflow creation', async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions.workflowId', null);
      const createdRecord = {
        entityId: 'someId',
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
