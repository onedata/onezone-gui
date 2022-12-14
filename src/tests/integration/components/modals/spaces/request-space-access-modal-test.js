import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { assert } from '@ember/debug';
import { render } from '@ember/test-helpers';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { click, fillIn } from '@ember/test-helpers';

describe('Integration | Component | modals/spaces/request-space-access-modal', function () {
  setupRenderingTest();

  it('renders header and body explanation text with space name', async function () {
    const helper = new Helper(this);
    helper.setSpaceMarketplaceData({
      name: 'Foo bar',
    });

    await helper.showModal();

    expect(helper.header).to.contain.text('Request space access');
    expect(helper.body).to.contain.text(
      'You are about to request access to Foo bar space.'
    );
  });

  it('renders a textarea for message and email input', async function () {
    const helper = new Helper(this);

    await helper.showModal();

    console.log(helper.modal.outerHTML);

    expect(helper.emailInput, 'email').to.exist;
    expect(helper.messageTextarea, 'message').to.exist;
  });

  it('calls onSubmit with data from form and space marketplace data', async function () {
    const helper = new Helper(this);
    helper.setSpaceMarketplaceData({
      spaceId: 'space_id_1',
    });
    const submitSpy = sinon.spy();
    helper.modalOptions.onSubmit = submitSpy;

    await helper.showModal();
    await fillIn(helper.emailInput, 'user@example.com');
    await fillIn(helper.messageTextarea, 'Hello, this is dog.');
    await click(helper.proceedButton);

    expect(submitSpy).to.have.been.calledOnce;
    expect(submitSpy).to.have.been.calledWith(
      sinon.match({
        email: 'user@example.com',
        message: 'Hello, this is dog.',
        spaceId: 'space_id_1',
      })
    );
  });

  it('has proceed button disabled if message and email is not set', async function () {
    const helper = new Helper(this);
    const submitSpy = sinon.spy();
    helper.modalOptions.onSubmit = submitSpy;

    await helper.showModal();

    expect(helper.proceedButton).to.have.attr('disabled');
    await click(helper.proceedButton);
    expect(submitSpy).to.have.not.been.called;
  });

  it('has proceed button disabled if email is not in valid format', async function () {
    const helper = new Helper(this);
    const submitSpy = sinon.spy();
    helper.modalOptions.onSubmit = submitSpy;

    await helper.showModal();
    await fillIn(helper.messageTextarea, 'hehe');
    await fillIn(helper.emailInput, 'haha');

    expect(helper.proceedButton).to.have.attr('disabled');
    await click(helper.proceedButton);
    expect(submitSpy).to.have.not.been.called;
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
    this.modalOptions = {};
    this.initDefaultSpaceMarketplaceData();
  }

  initDefaultSpaceMarketplaceData() {
    const defaultSpaceMarketplaceData = {
      name: 'Default space name',
      organizationName: 'Default Corporation',
      spaceId: 'default_space_id',
    };
    this.setSpaceMarketplaceData(defaultSpaceMarketplaceData);
  }
  setSpaceMarketplaceData(spaceMarketplaceData) {
    this.modalOptions.spaceMarketplaceData = spaceMarketplaceData;
  }

  /** @type {HTMLElement} */
  get modal() {
    return getModal();
  }
  /** @type {HTMLElement} */
  get body() {
    return getModalBody();
  }
  /** @type {HTMLElement} */
  get header() {
    return getModalHeader();
  }
  /** @type {HTMLElement} */
  get footer() {
    return getModalFooter();
  }
  /** @type {HTMLTextAreaElement} */
  get messageTextarea() {
    return this.body.querySelector('.message-field textarea');
  }
  /** @type {HTMLInputElement} */
  get emailInput() {
    return this.body.querySelector('.email-field input');
  }
  get cancelButton() {
    return this.footer.querySelector('.cancel-btn');
  }
  get proceedButton() {
    return this.footer.querySelector('.proceed-btn');
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
      .show('spaces/request-space-access-modal', this.modalOptions)
      .shownPromise;
  }
}
