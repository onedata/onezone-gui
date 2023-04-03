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
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { suppressRejections } from '../../../../helpers/suppress-rejections';

describe('Integration | Component | modals/spaces/confirm-join-request-modal', function () {
  setupRenderingTest();

  it('renders header and close button if space join requester info fetch fails', async function () {
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

    expect(helper.header).to.contain.text('Invalid membership request');
    expect(helper.closeButton).to.exist;
    expect(helper.closeButton).to.contain.text('Close');
    expect(helper.grantButton).to.not.exist;
    expect(helper.rejectButton).to.not.exist;
  });

  it('renders header, grant and reject button if space and requester info is successfully fetched',
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
      getRequesterInfo.rejects(new Error('mocked error'));

      await helper.showModal();

      expect(getRequesterInfo).to.have.been.calledWith(spaceId, requestId);
      expect(helper.header).to.contain.text('Resolve membership request');
      expect(helper.body.textContent).to.match(new RegExp(
        `A membership request to space\\s+${spaceName}\\s+has been submitted by\\s+${fullName}\\s+\\(${contactEmail}\\)\\s+via the Space Marketplace\\.`
      ));
      expect(helper.grantButton).to.exist;
      expect(helper.grantButton).to.contain.text('Grant');
      expect(helper.rejectButton).to.exist;
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
      ...data,
    });
    return this.space;
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
  get closeButton() {
    return this.footer?.querySelector('.close-btn');
  }
  get grantButton() {
    return this.footer?.querySelector('.grant-btn');
  }
  get rejectButton() {
    return this.footer?.querySelector('.reject-btn');
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

  async showModal() {
    await render(hbs`{{global-modal-mounter}}`);
    return await this.modalManager
      .show('spaces/confirm-join-request-modal', this.modalOptions)
      .shownPromise;
  }
}
