import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { hbs } from 'ember-cli-htmlbars';
import { assert } from '@ember/debug';
import { render, click } from '@ember/test-helpers';
import createSpace from '../../../../helpers/create-space';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
  isModalOpened,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { suppressRejections } from '../../../../helpers/suppress-rejections';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | modals/spaces/confirm-join-request-modal', function () {
  setupRenderingTest();

  it('renders header and close button only if space join requester info fetch fails', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'space_id';
    const joinRequestId = 'join_request_id';
    await helper.stubSpace({ entityId: spaceId });
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    sinon.stub(
      helper.spaceManager,
      'getSpaceMembershipRequesterInfo'
    ).rejects(new Error('mocked error'));

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.closeButton).to.exist;
    expect(helper.closeButton).to.contain.text('Close');
  });

  it('renders generic error info when space request fails with non-supported error', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'not_existing_space_id';
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    sinon.stub(
      helper.spaceManager,
      'getRecordById'
    ).rejects({ id: 'other_error' });

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.body.querySelector('.resource-load-error')).to.exist;
  });

  it('renders "space not found" info when space request fails with notFound', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'not_existing_space_id';
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    sinon.stub(
      helper.spaceManager,
      'getRecordById'
    ).rejects({ id: 'notFound' });

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.body).to.contain.text(
      'The space concerned by this membership request does not exist. It may have been deleted or the link is invalid.'
    );
  });

  it('renders "forbidden space" info when space request fails with forbidden', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'not_existing_space_id';
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    sinon.stub(
      helper.spaceManager,
      'getRecordById'
    ).rejects({ id: 'forbidden' });

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.body).to.contain.text(
      'You don\'t have access to the space concerned by this membership request.'
    );
  });

  it('renders "request not found" info when requesterInfo request fails with notFound', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'not_existing_space_id';
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    await helper.stubSpace({ entityId: spaceId });
    sinon.stub(
      helper.spaceManager,
      'getSpaceMembershipRequesterInfo'
    ).rejects({ id: 'notFound' });

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.body).to.contain.text(
      'This is not a valid membership request. It may have been already resolved or the link is invalid.'
    );
  });

  it('renders "request forbidden" info when requesterInfo request fails with forbidden', async function () {
    suppressRejections();
    const helper = new Helper(this);
    const spaceId = 'not_existing_space_id';
    const joinRequestId = 'join_request_id';
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };
    await helper.stubSpace({ entityId: spaceId });
    sinon.stub(
      helper.spaceManager,
      'getSpaceMembershipRequesterInfo'
    ).rejects({ id: 'forbidden' });

    await helper.showModal();

    helper.expectInvalidRequestHeader();
    helper.expectActionButtonsToNotExist();
    expect(helper.body).to.contain.text(
      'You have insufficient privileges to view this membership request.'
    );
  });

  it('renders "membership already exist" info when requesterInfo request fails with relationAlreadyExists',
    async function () {
      suppressRejections();
      const helper = new Helper(this);
      const spaceId = 'not_existing_space_id';
      const joinRequestId = 'join_request_id';
      helper.modalOptions = {
        spaceId,
        joinRequestId,
      };
      await helper.stubSpace({ entityId: spaceId });
      sinon.stub(
        helper.spaceManager,
        'getSpaceMembershipRequesterInfo'
      ).rejects({ id: 'relationAlreadyExists' });

      await helper.showModal();

      helper.expectInvalidRequestHeader();
      helper.expectActionButtonsToNotExist();
      expect(helper.body).to.contain.text(
        'This membership request is obsolete; the user is already a member of this space.'
      );
    });

  it('renders header, grant and reject button if space and requester info is successfully fetched',
    async function () {
      const helper = new Helper(this);
      const requestId = 'join_request_id';
      const userId = 'user_id';
      const spaceId = 'not_existing_space_id';
      const spaceName = 'Stub space name';
      const fullName = 'Zenek';
      const username = 'mock_username';
      const contactEmail = 'zenek@polo.pl';
      helper.modalOptions = {
        spaceId,
        joinRequestId: requestId,
      };
      await helper.stubSpace({ name: spaceName, entityId: spaceId });
      const getRequesterInfo = sinon.stub(
        helper.spaceManager,
        'getSpaceMembershipRequesterInfo'
      );
      getRequesterInfo.withArgs(sinon.match(spaceId, requestId)).resolves({
        userId,
        fullName,
        username,
        contactEmail,
      });
      getRequesterInfo.rejects(new Error('mocked error'));

      await helper.showModal();

      expect(getRequesterInfo).to.have.been.calledWith(spaceId, requestId);
      expect(helper.header).to.contain.text('Resolve membership request');
      expect(helper.body.textContent).to.match(new RegExp(
        `A membership request to space\\s+${spaceName}\\s+has been submitted by\\s+${fullName}\\s+\\(${contactEmail}\\)\\s+via the Space Marketplace\\.`
      ));
      expect(helper.grantButton, 'grant').to.exist;
      expect(helper.grantButton).to.contain.text('Grant');
      expect(helper.rejectButton, 'reject').to.exist;
      expect(helper.rejectButton).to.contain.text('Reject');
      expect(helper.closeButton).to.not.exist;
    }
  );

  it('invokes onGrant callback when clicking on grant button', async function () {
    const helper = new Helper(this);
    const requesterInfo = await helper.stubGetSpaceMembershipRequesterInfo();
    const joinRequestId = 'join_request_id';
    const spaceId = 'space_id';
    helper.stubSpace({ entityId: spaceId });
    const onGrant = sinon.stub();
    onGrant.resolves();
    helper.modalOptions = {
      spaceId,
      joinRequestId,
      onGrant,
    };

    await helper.showModal();
    await click(helper.grantButton);

    expect(onGrant).to.have.been.calledOnce;
    expect(onGrant).to.have.been.calledWith(requesterInfo.userId);
  });

  it('renders loading header and spinner only when verification request is being made', async function () {
    const helper = new Helper(this);
    const joinRequestId = 'join_request_id';
    const spaceId = 'space_id';
    helper.stubSpace({ entityId: spaceId });
    const getRequesterInfo = sinon.stub(
      helper.spaceManager,
      'getSpaceMembershipRequesterInfo'
    );
    getRequesterInfo.returns(new Promise(() => {}));
    helper.modalOptions = {
      spaceId,
      joinRequestId,
    };

    await helper.showModal();

    expect(helper.header).to.contain.text('Verifying the membership request...');
    expect(helper.body).to.contain('.spin-spinner-block');
    expect(helper.closeButton).to.not.exist;
    expect(helper.rejectButton).to.not.exist;
    expect(helper.grantButton).to.not.exist;
  });

  it('has "Decide later" button that closes the modal and opens "decide later" info modal',
    async function () {
      const helper = new Helper(this);
      const requestId = 'join_request_id';
      const userId = 'user_id';
      const spaceId = 'space_id';
      const spaceName = 'Stub space name';
      const fullName = 'Zenek';
      const username = 'mock_username';
      const contactEmail = 'zenek@polo.pl';
      helper.modalOptions = {
        spaceId,
        joinRequestId: requestId,
      };
      await helper.stubSpace({ name: spaceName, entityId: spaceId });
      const getRequesterInfo = sinon.stub(
        helper.spaceManager,
        'getSpaceMembershipRequesterInfo'
      );
      getRequesterInfo.withArgs(sinon.match(spaceId, requestId)).resolves({
        userId,
        fullName,
        username,
        contactEmail,
      });

      await helper.showModal();

      expect(helper.decideLaterButton).to.exist;
      expect(helper.decideLaterButton).to.have.class('btn-default');
      expect(helper.decideLaterButton).to.contain.text('Decide later');

      await click(helper.decideLaterButton);
      expect(helper.isOpened()).to.be.false;
      expect(helper.alertModal).to.exist;
      expect(helper.alertModal).to.contain.text(
        'You may go back to this request by visiting the same link. Please make your decision without undue delay.'
      );
    }
  );
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.modalOptions = {};
  }

  async createSpace(data) {
    return await createSpace(this.store, data);
  }
  async stubGetSpaceMembershipRequesterInfo(data = {}) {
    const finalData = {
      ...data,
      userId: 'stub_requester_id',
      fullName: 'Stub Requester',
      username: 'stub_requester',
      contactEmail: 'requester@example.com',
    };
    sinon.stub(this.spaceManager, 'getSpaceMembershipRequesterInfo').resolves(finalData);
    return finalData;
  }
  async stubSpace(data = {}) {
    this.space = await this.createSpace({
      name: 'Default mock space',
      entityId: 'default_mock_space_id',
      privileges: {
        manageInMarketplace: true,
        addUser: true,
      },
      ...data,
    });
    return this.space;
  }

  get modal() {
    return getModal('confirm-join-request-modal');
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
  get closeButton() {
    return this.footer?.querySelector('.close-btn');
  }
  get grantButton() {
    return this.footer?.querySelector('.grant-btn');
  }
  get rejectButton() {
    return this.footer?.querySelector('.reject-btn');
  }
  get decideLaterButton() {
    return this.footer?.querySelector('.decide-later-btn');
  }
  get alertModal() {
    return globals.document.querySelector('.alert-global .modal-dialog');
  }

  get modalManager() {
    return lookupService(this.mochaContext, 'modalManager');
  }
  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
  }
  get recordManager() {
    return lookupService(this.mochaContext, 'recordManager');
  }
  get store() {
    return lookupService(this.mochaContext, 'store');
  }

  isOpened() {
    return isModalOpened('confirm-join-request-modal');
  }

  expectInvalidRequestHeader() {
    expect(this.header).to.contain.text('Invalid membership request');
  }
  expectActionButtonsToNotExist() {
    expect(this.grantButton).to.not.exist;
    expect(this.rejectButton).to.not.exist;
    expect(this.decideLaterButton).to.not.exist;
  }

  async showModal() {
    await render(hbs`{{alert-global}}{{global-modal-mounter}}`);
    return await this.modalManager
      .show('spaces/confirm-join-request-modal', this.modalOptions)
      .shownPromise;
  }
}
