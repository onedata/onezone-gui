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

describe('Integration | Component | content atm inventories lambdas', function () {
  setupComponentTest('content-atm-inventories-lambdas', {
    integration: true,
  });

  beforeEach(function () {
    this.setProperties({
      atmInventory: {
        privileges: {
          view: true,
          manageLambdas: true,
        },
        atmLambdaList: promiseObject(resolve({
          list: promiseArray(resolve([{
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
            argumentSpecs: [],
            resultSpecs: [],
          }, {
            name: 'f0',
            summary: 'f0 summary',
            operationSpec: {
              engine: 'onedataFunction',
              functionId: 'f0Function',
            },
            argumentSpecs: [],
            resultSpecs: [],
          }])),
        })),
      },
    });
    sinon.stub(lookupService(this, 'navigation-state'), 'changeRouteAspectOptions')
      .callsFake(function (newOptions) {
        this.set('aspectOptions', newOptions);
      });
  });

  it('has class "content-atm-inventories-lambdas"', function () {
    this.render(hbs `{{content-atm-inventories-lambdas}}`);

    expect(this.$().children()).to.have.class('content-atm-inventories-lambdas')
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
    const listView = listSlide.querySelector('.content-atm-inventories-lambdas-list-view');
    expect(listView).to.exist;
    expect(listView.innerText).to.contain('f0');
    expect(listView.innerText).to.contain('f1');
  });

  it('has new function form in "creator" slide', async function () {
    await render(this);

    const creatorSlide = getSlide('creator');
    expect(creatorSlide.querySelector('.content-atm-inventories-lambdas-creator-view'))
      .to.exist;
  });

  it('allows to add new function', async function () {
    const workflowActions = lookupService(this, 'workflow-actions');
    const createCreateAtmLambdaActionStub =
      sinon.stub(workflowActions, 'createCreateAtmLambdaAction')
      .returns({
        execute: () => resolve({ status: 'done' }),
      });
    await render(this);

    await click(getSlide('list').querySelector('.open-add-atm-lambda-trigger'));
    expect(isSlideActive('creator')).to.be.true;

    const creatorSlide = getSlide('creator');
    await fillIn(creatorSlide.querySelector('.name-field .form-control'), 'someName');
    await fillIn(creatorSlide.querySelector('.dockerImage-field .form-control'), 'someImage');
    await click(creatorSlide.querySelector('.btn-submit'));
    expect(createCreateAtmLambdaActionStub).to.be.calledOnce
      .and.to.be.calledWith(sinon.match({
        // Checking only if atmInventory is passed. Function creation is tested
        // in nested components.
        atmInventory: this.get('atmInventory'),
      }));
    expect(isSlideActive('list')).to.be.true;
  });

  it('allows to get back from "creator" slide', async function () {
    await render(this);

    await click(getSlide('list').querySelector('.open-add-atm-lambda-trigger'));
    expect(isSlideActive('creator')).to.be.true;

    await click(getSlide('creator').querySelector('.content-back-link'));
    expect(isSlideActive('list')).to.be.true;
  });
});

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-lambdas
    atmInventory=atmInventory
  }}`);
  await wait();
}
