import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { assert } from '@ember/debug';
import { render } from '@ember/test-helpers';
import createSpace from '../../../../helpers/create-space';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { suppressRejections } from '../../../../helpers/suppress-rejections';

describe('Integration | Component | modals/spaces/confirm-join-request-modal', function () {
  setupRenderingTest();

  it('renders header and close button if space join request is invalid', async function () {
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      joinRequestId,
    };
    const checkSpaceAccessRequest = sinon.stub(
      helper.spaceManager,
      'checkSpaceAccessRequest'
    );
    checkSpaceAccessRequest.resolves({ isValid: false });

    await helper.showModal();

    expect(helper.header).to.contain.text('Invalid join space request');
    expect(helper.cancelButton).to.exist;
    expect(helper.cancelButton).to.contain.text('Close');
  });

  it('renders header, confirm and cancel button if space join request is valid', async function () {
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      joinRequestId,
    };
    const checkSpaceAccessRequest = sinon.stub(
      helper.spaceManager,
      'checkSpaceAccessRequest'
    );
    checkSpaceAccessRequest.resolves({ isValid: false });
    checkSpaceAccessRequest.withArgs(sinon.match({ joinRequestId })).resolves({
      isValid: true,
    });

    await helper.showModal();

    expect(helper.header).to.contain.text('Add user to space');
    expect(helper.body).to.contain.text(
      'An access to space has been requested using spaces marketplace.'
    );
    expect(helper.cancelButton).to.exist;
    expect(helper.cancelButton).to.contain.text('Cancel');
    expect(helper.proceedButton).to.exist;
    expect(helper.proceedButton).to.contain.text('Confirm');
  });

  it('renders header and close button if space join request is invalid', async function () {
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      joinRequestId,
    };
    const checkSpaceAccessRequest = sinon.stub(
      helper.spaceManager,
      'checkSpaceAccessRequest'
    );
    checkSpaceAccessRequest.resolves({ isValid: false });
    checkSpaceAccessRequest.withArgs(sinon.match({ joinRequestId })).resolves({
      isValid: false,
    });

    await helper.showModal();

    expect(helper.header).to.contain.text('Invalid join space request');
    expect(helper.body).to.contain.text(
      'The space join request is either not valid or has expired.'
    );
    expect(helper.cancelButton).to.exist;
    expect(helper.cancelButton).to.contain.text('Close');
    expect(helper.proceedButton).to.not.exist;
  });

  it('renders header, error info and close button if space join request is rejected', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      joinRequestId,
    };
    const checkSpaceAccessRequest = sinon.stub(
      helper.spaceManager,
      'checkSpaceAccessRequest'
    );
    checkSpaceAccessRequest.rejects(new Error('test error'));

    await helper.showModal();

    expect(helper.header).to.contain.text('Request verification failed');
    expect(helper.body).to.contain.text('This resource could not be loaded.');
    expect(helper.cancelButton).to.exist;
    expect(helper.cancelButton).to.contain.text('Close');
    expect(helper.proceedButton).to.not.exist;
  });

  it('renders loading header and spinner only when verification request is being made', async function () {
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      joinRequestId,
    };
    const checkSpaceAccessRequest = sinon.stub(
      helper.spaceManager,
      'checkSpaceAccessRequest'
    );
    checkSpaceAccessRequest.returns(new Promise(() => {}));

    await helper.showModal();

    expect(helper.header).to.contain.text('Verifying add user request...');
    expect(helper.body).to.contain('.spin-spinner-block');
    expect(helper.cancelButton).to.not.exist;
    expect(helper.proceedButton).to.not.exist;
  });

});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
    this.modalOptions = {};
  }

  async createSpace(data) {
    return await createSpace(this.store, data);
  }

  get modal() {
    return getModal();
  }
  /** @type {HTMLElement} */
  get body() {
    return getModalBody();
  }
  get header() {
    return getModalHeader();
  }
  get footer() {
    return getModalFooter();
  }
  get cancelButton() {
    return this.footer?.querySelector('.cancel-btn');
  }
  get proceedButton() {
    return this.footer?.querySelector('.proceed-btn');
  }

  get modalManager() {
    return lookupService(this.mochaContext, 'modalManager');
  }
  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
  }

  async showModal() {
    await render(hbs`{{global-modal-mounter}}`);
    return await this.modalManager
      .show('spaces/confirm-join-request-modal', this.modalOptions)
      .shownPromise;
  }
}
