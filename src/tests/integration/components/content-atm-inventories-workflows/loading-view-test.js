import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, resolve } from 'rsvp';
import suppressRejections from '../../../helpers/suppress-rejections';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';

describe('Integration | Component | content atm inventories workflows/loading view',
  function () {
    setupComponentTest('content-atm-inventories-workflows/loading-view', {
      integration: true,
    });

    suppressRejections();

    it('has class "content-atm-inventories-workflows-loading-view"', function () {
      this.render(hbs `{{content-atm-inventories-workflows/loading-view}}`);

      expect(this.$().children()).to.have.class('content-atm-inventories-workflows-loading-view')
        .and.to.have.length(1);
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      const backSlideSpy = this.set('backSlideSpy', sinon.spy());
      await render(this);

      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('shows nothing when no proxy has been passed', async function () {
      await render(this);

      expectContentElementsCount(this, 0);
      expectHeaderText(this, '');
    });

    it('shows nothing when passed proxy resolved', async function () {
      this.set('loadingProxy', promiseObject(resolve()));

      await render(this);

      expectContentElementsCount(this, 0);
      expectHeaderText(this, '');
    });

    it('shows spinner when passed proxy is loading', async function () {
      this.set('loadingProxy', promiseObject(new Promise(() => {})));

      await render(this);

      expect(this.$('.spin-spinner')).to.exist;
      expectContentElementsCount(this, 1);
      expectHeaderText(this, 'Loading workflow...');
    });

    it('shows "not found" page when passed proxy rejects with "notFound" error',
      async function () {
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await render(this);
        rejectProxy({ id: 'notFound' });
        await wait();

        expect(this.$('.resource-not-found')).to.exist;
        expectContentElementsCount(this, 1);
        expectHeaderText(this, 'Workflow not found');
      });

    it('shows "no permissions" page when passed proxy rejects with "forbidden" error',
      async function () {
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await render(this);
        rejectProxy({ id: 'forbidden' });
        await wait();

        expect(this.$('.no-permissions')).to.exist;
        expectContentElementsCount(this, 1);
        expectHeaderText(this, 'Workflow is not accessible');
      });

    it('shows resource loading error message, when proxy rejects with some non-standard error',
      async function () {
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await render(this);
        rejectProxy({ id: 'someError' });
        await wait();

        const $errorContainer = this.$('.resource-load-error');
        expect($errorContainer).to.exist;
        expect($errorContainer.text()).to.contain('someError');
        expectContentElementsCount(this, 1);
        expectHeaderText(this, 'Workflow cannot be loaded');
      });
  });

async function render(testCase) {
  testCase.render(hbs `{{content-atm-inventories-workflows/loading-view
    loadingProxy=loadingProxy
    onBackSlide=backSlideSpy
  }}`);
  await wait();
}

function expectHeaderText(testCase, headerText) {
  expect(testCase.$('.header-row .resource-name').text().trim()).to.equal(headerText);
}

function expectContentElementsCount(testCase, expectedContentElementsCount) {
  expect(testCase.$('.content-atm-inventories-workflows-loading-view').children())
    // +1 for header
    .to.have.length(1 + expectedContentElementsCount);
}
