import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { Promise, resolve } from 'rsvp';
import { suppressRejections } from '../../../helpers/suppress-rejections';
import sinon from 'sinon';

describe('Integration | Component | content atm inventories workflows/loading view',
  function () {
    setupRenderingTest();

    it('has class "content-atm-inventories-workflows-loading-view"', async function () {
      await render(hbs `{{content-atm-inventories-workflows/loading-view}}`);

      expect(this.element.children).to.have.length(1);
      expect(this.element.children[0])
        .to.have.class('content-atm-inventories-workflows-loading-view');
    });

    it('calls "onBackSlide" callback on back link click', async function () {
      const backSlideSpy = this.set('backSlideSpy', sinon.spy());
      await renderComponent();

      expect(backSlideSpy).to.be.not.called;

      await click('.content-back-link');

      expect(backSlideSpy).to.be.calledOnce;
    });

    it('shows nothing when no proxy has been passed', async function () {
      await renderComponent();

      expectContentElementsCount(0);
      expectHeaderText('');
    });

    it('shows nothing when passed proxy resolved', async function () {
      this.set('loadingProxy', promiseObject(resolve()));

      await renderComponent();

      expectContentElementsCount(0);
      expectHeaderText('');
    });

    it('shows spinner when passed proxy is loading', async function () {
      this.set('loadingProxy', promiseObject(new Promise(() => {})));

      await renderComponent();

      expect(find('.spin-spinner')).to.exist;
      expectContentElementsCount(1);
      expectHeaderText('Loading workflow...');
    });

    it('shows "not found" page when passed proxy rejects with "notFound" error',
      async function () {
        suppressRejections();
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await renderComponent();
        rejectProxy({ id: 'notFound' });
        await settled();

        expect(find('.resource-not-found')).to.exist;
        expectContentElementsCount(1);
        expectHeaderText('Workflow not found');
      });

    it('shows "no permissions" page when passed proxy rejects with "forbidden" error',
      async function () {
        suppressRejections();
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await renderComponent();
        rejectProxy({ id: 'forbidden' });
        await settled();

        expect(find('.no-permissions')).to.exist;
        expectContentElementsCount(1);
        expectHeaderText('Workflow is not accessible');
      });

    it('shows resource loading error message, when proxy rejects with some non-standard error',
      async function () {
        suppressRejections();
        let rejectProxy;
        this.set('loadingProxy', promiseObject(
          new Promise((resolve, reject) => rejectProxy = reject)));

        await renderComponent();
        rejectProxy({ id: 'someError' });
        await settled();

        const errorContainer = find('.resource-load-error');
        expect(errorContainer).to.exist;
        expect(errorContainer).to.contain.text('someError');
        expectContentElementsCount(1);
        expectHeaderText('Workflow cannot be loaded');
      });
  });

async function renderComponent() {
  await render(hbs `{{content-atm-inventories-workflows/loading-view
    loadingProxy=loadingProxy
    onBackSlide=backSlideSpy
  }}`);
}

function expectHeaderText(headerText) {
  expect(find('.header-row .resource-name')).to.have.trimmed.text(headerText);
}

function expectContentElementsCount(expectedContentElementsCount) {
  expect(find('.content-atm-inventories-workflows-loading-view').children)
    // +1 for header
    .to.have.length(1 + expectedContentElementsCount);
}
