import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { isSlideActive, getSlide } from '../../helpers/one-carousel';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import { lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { set } from '@ember/object';

describe('Integration | Component | content inventories workflows', function () {
  setupComponentTest('content-inventories-workflows', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      atmInventory: {
        workflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve([{
            name: 'w1',
            description: 'w1 description',
          }, {
            name: 'w0',
            description: 'w0 description',
          }])),
        })),
      },
    });
    sinon.stub(lookupService(this, 'navigation-state'), 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
  });

  it('has class "content-inventories-workflows"', function () {
    this.render(hbs `{{content-inventories-workflows}}`);

    expect(this.$().children()).to.have.class('content-inventories-workflows')
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
    const listView = listSlide.querySelector('.content-inventories-workflows-list-view');
    expect(listView).to.exist;
    expect(listView.innerText).to.contain('w0');
    expect(listView.innerText).to.contain('w1');
  });

  it('shows workflow schemas list when "view" query param is equal to "list"',
    async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', { view: 'list' });

      await render(this);

      expect(isSlideActive('list')).to.be.true;
    });

  it('shows workflow schemas list when "view" query param is equal to "list" and "workflowId" is not empty',
    async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'list',
        workflowId: 'someId',
      });

      await render(this);

      expect(isSlideActive('list')).to.be.true;
    });

  it('shows workflow schema creator when "view" query param is "editor" and "workflowId" is empty',
    async function () {
      set(lookupService(this, 'navigation-state'), 'aspectOptions', {
        view: 'editor',
        workflowId: '',
      });

      await render(this);

      expect(isSlideActive('editor')).to.be.true;
      const editorSlide = getSlide('editor');
      expect(editorSlide.querySelector('.content-inventories-workflows-creator-view'))
        .to.exist;
    });
});

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-workflows
    atmInventory=atmInventory
  }}`);
  await wait();
}
