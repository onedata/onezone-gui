import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
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
import OneDropdownHelper from '../../../../helpers/one-dropdown';

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
    await click(helper.emailShareCheckbox);
    await click(helper.proceedButton);

    expect(submitSpy).to.have.been.calledOnce;
    expect(submitSpy).to.have.been.calledWith(
      sinon.match({
        contactEmail: 'user@example.com',
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

  it('renders emails dropdown with user emails and custom option if user has emails specified',
    async function () {
      const helper = new Helper(this);
      const emails = ['czesiek@example.com', 'janusz@example.com'];
      await helper.stubCurrentUser({
        emails,
      });

      await helper.showModal();
      const dropdownOptions = await helper.emailDropdown.getOptionsText();

      expect(dropdownOptions).to.deep.equal([
        ...emails,
        'Custom e-mail address...',
      ]);
    }
  );

  it('calls onSubmit with email from predefined email selector', async function () {
    const helper = new Helper(this);
    const emails = ['czesiek@example.com', 'janusz@example.com'];
    await helper.stubCurrentUser({
      emails,
    });
    const submitSpy = sinon.spy();
    helper.modalOptions.onSubmit = submitSpy;

    await helper.showModal();
    await helper.emailDropdown.selectOptionByText('janusz@example.com');
    await click(helper.emailShareCheckbox);
    await click(helper.proceedButton);

    expect(submitSpy).to.have.been.calledOnce;
    expect(submitSpy).to.have.been.calledWith(
      sinon.match({
        contactEmail: 'janusz@example.com',
      })
    );
  });

  it('calls onSubmit with custom email entered to custom value email selector', async function () {
    const helper = new Helper(this);
    const emails = ['czesiek@example.com'];
    await helper.stubCurrentUser({
      emails,
    });
    const submitSpy = sinon.spy();
    helper.modalOptions.onSubmit = submitSpy;

    await helper.showModal();
    await helper.emailDropdown.selectOptionByText('Custom e-mail address...');
    const customInput = helper.emailDropdown.getTrigger().querySelector('input');
    await fillIn(customInput, 'test@onedata.org');
    await click(helper.emailShareCheckbox);
    await click(helper.proceedButton);

    expect(submitSpy).to.have.been.calledOnce;
    expect(submitSpy).to.have.been.calledWith(
      sinon.match({
        contactEmail: 'test@onedata.org',
      })
    );
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.modalOptions = {};
    this.initDefaultSpaceMarketplaceData();

    /**
     * Use `stubCurrentUser` method to initialize manually.
     * Will be initialized before render with default data if was not initialzed manually.
     * @type {Models.User}
     */
    this.user = undefined;
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
  async stubCurrentUser(data) {
    if (data?.id) {
      throw new Error(
        'Providing "id" when stubbing current user is not supported - stub entityId instead'
      );
    }
    const effData = { ...data };
    const userId = effData.entityId ?? 'stub_user_id';
    const userGri = this.store.userGri(userId);
    const user = await this.store.createRecord('user', {
      id: userGri,
      // default data
      fullName: 'Stub user',
      username: 'stub_user',
      info: { creationTime: 1000000 },
      emails: [],

      ...effData,
    }).save();
    this.currentUserService.set('userId', userId);
    this.user = user;

    return user;
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  get currentUserService() {
    return lookupService(this.mochaContext, 'currentUser');
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
  /** @type {HTMLElement} */
  get emailDropdownFieldElement() {
    return this.body.querySelector('.email-field');
  }
  /** @type {OneDropdownHelper} */
  get emailDropdown() {
    return new OneDropdownHelper(this.emailDropdownFieldElement);
  }
  /** @type {HTMLInputElement} */
  get emailShareCheckbox() {
    return this.body.querySelector('.one-checkbox-understand');
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
    if (!this.user) {
      await this.stubCurrentUser();
    }
    await render(hbs`{{global-modal-mounter}}`);
    return await this.modalManager
      .show('spaces/request-space-access-modal', this.modalOptions)
      .shownPromise;
  }
}
