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
import { click, fillIn } from 'ember-native-dom-helpers';

describe('Integration | Component | content inventories functions', function () {
  setupComponentTest('content-inventories-functions', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      atmInventory: {
        lambdaFunctionList: promiseObject(resolve({
          list: promiseArray(resolve([{
            name: 'f1',
            summary: 'f1 summary',
            engine: 'openfaas',
            operationRef: 'f1Image',
            executionOptions: {
              readonly: false,
              mountSpaceOptions: {
                mouncOneclient: false,
              },
            },
            arguments: [],
            results: [],
          }, {
            name: 'f0',
            summary: 'f0 summary',
            engine: 'onedataFunction',
            operationRef: 'f0Function',
            executionOptions: {
              readonly: false,
              mountSpaceOptions: {
                mouncOneclient: false,
              },
            },
            arguments: [],
            results: [],
          }])),
        })),
      },
    });
    sinon.stub(lookupService(this, 'navigation-state'), 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
  });

  it('has class "content-inventories-functions"', function () {
    this.render(hbs `{{content-inventories-functions}}`);

    expect(this.$().children()).to.have.class('content-inventories-functions')
      .and.to.have.length(1);
  });

  it('contains carousel with two slides', async function () {
    await render(this);

    const $slides = this.$('.one-carousel-slide');
    expect($slides).to.have.length(2);
    expect(getSlide('list')).to.exist;
    expect(getSlide('creator')).to.exist;
    expect(isSlideActive('list')).to.be.true;
  });

  it('shows functions list in "list" slide', async function () {
    await render(this);

    const listSlide = getSlide('list');
    const listView = listSlide.querySelector('.content-inventories-functions-list-view');
    expect(listView).to.exist;
    expect(listView.innerText).to.contain('f0');
    expect(listView.innerText).to.contain('f1');
  });

  it('has new function form in "creator" slide', async function () {
    await render(this);

    const creatorSlide = getSlide('creator');
    expect(creatorSlide.querySelector('.content-inventories-functions-creator-view'))
      .to.exist;
  });

  it('allows to add new function', async function () {
    const workflowActions = lookupService(this, 'workflow-actions');
    const createCreateLambdaFunctionActionStub =
      sinon.stub(workflowActions, 'createCreateLambdaFunctionAction')
      .returns({
        execute: () => resolve({ status: 'done' }),
      });
    await render(this);

    await click(getSlide('list').querySelector('.open-add-function-trigger'));
    expect(isSlideActive('creator')).to.be.true;

    const creatorSlide = getSlide('creator');
    await fillIn(creatorSlide.querySelector('.name-field .form-control'), 'someName');
    await fillIn(creatorSlide.querySelector('.dockerImage-field .form-control'), 'someImage');
    await click(creatorSlide.querySelector('.btn-submit'));
    expect(createCreateLambdaFunctionActionStub).to.be.calledOnce
      .and.to.be.calledWith(sinon.match({
        // Checking only if atmInventory is passed. Function creation is tested
        // in nested components.
        atmInventory: this.get('atmInventory'),
      }));
    expect(isSlideActive('list')).to.be.true;
  });

  it('allows to get back from "creator" slide', async function () {
    await render(this);

    await click(getSlide('list').querySelector('.open-add-function-trigger'));
    expect(isSlideActive('creator')).to.be.true;

    await click(getSlide('creator').querySelector('.content-back-link'));
    expect(isSlideActive('list')).to.be.true;
  });
});

async function render(testCase) {
  testCase.render(hbs `{{content-inventories-functions
    atmInventory=atmInventory
  }}`);
  await wait();
}
