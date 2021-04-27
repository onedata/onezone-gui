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

  it('contains carousel with one slide', async function () {
    await render(this);

    const $slides = this.$('.one-carousel-slide');
    expect($slides).to.have.length(1);
    expect(getSlide('list')).to.exist;
    expect(isSlideActive('list')).to.be.true;
  });

  it('shows workflow schemas list in "list" slide', async function () {
    await render(this);

    const listSlide = getSlide('list');
    const listView = listSlide.querySelector('.content-inventories-workflows-list-view');
    expect(listView).to.exist;
    expect(listView.innerText).to.contain('w0');
    expect(listView.innerText).to.contain('w1');
  });
});

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-workflows
    atmInventory=atmInventory
  }}`);
  await wait();
}
