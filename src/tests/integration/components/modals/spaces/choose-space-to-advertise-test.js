import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { assert } from '@ember/debug';
import { render, find } from '@ember/test-helpers';
import createSpace from '../../../../helpers/create-space';
import { lookupService } from '../../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../../helpers/modal';
import sinon from 'sinon';
import { all as allFulfilled } from 'rsvp';
import { get } from '@ember/object';

describe('Integration | Component | modals/spaces/choose-space-to-advertise', function () {
  setupRenderingTest();

  /**
   * @param {Helper} helper
   */
  function expectGenericHeader(helper) {
    expect(helper.header).to.contain.text('Advertise space');
  }

  it('renders header, "no spaces" text and close button if user does not have any space', async function () {
    const helper = new Helper(this);

    await helper.showModal();

    expectGenericHeader(helper);
    expect(helper.body).to.contain.text('You do not belong to any space.');
    expect(helper.cancelButton).to.exist;
    expect(helper.cancelButton).to.contain.text('Close');
  });

  it('renders header, "all advertised" text and close button if all of user spaces are advertised',
    async function () {
      const helper = new Helper(this);
      helper.setSpaces([{
        name: 'Dummy space',
        advertisedInMarketplace: true,
      }]);

      await helper.showModal();

      expectGenericHeader(helper);
      expect(helper.body).to.contain.text('All your spaces are already advertised.');
      expect(helper.cancelButton).to.exist;
      expect(helper.cancelButton).to.contain.text('Close');
    }
  );

  it('renders header, "choose space" text, cancel and proceed button if some user spaces are not advertised',
    async function () {
      const helper = new Helper(this);
      helper.setSpaces([{
          name: 'Not-advertised space',
          advertisedInMarketplace: false,
        },
        {
          name: 'Advertised space',
          advertisedInMarketplace: true,
        },
      ]);

      await helper.showModal();

      expectGenericHeader(helper);
      expect(helper.body).to.contain.text(
        'Choose space to configure its advertising settings from selector below.'
      );
      expect(helper.cancelButton).to.exist;
      expect(helper.cancelButton).to.contain.text('Cancel');
    }
  );
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.store = lookupService(this.mochaContext, 'store');
    this.modalOptions = {};
    this.spaceList = this.store.createRecord('space-list', {
      list: [],
    });
    sinon.stub(this.spaceManager, 'getSpaces')
      .callsFake(async () => this.spaceList);
  }

  async createSpace(data) {
    return await createSpace(this.store, data);
  }
  async setSpaces(spacesData) {
    const spaces = await allFulfilled(spacesData.map(data => this.createSpace(data)));
    this.spaceList.set('list', spaces);
    await this.spaceList.save();
  }

  get modal() {
    return getModal();
  }
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
    return this.footer.querySelector('.cancel-btn');
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
      .show('spaces/choose-space-to-advertise', this.modalOptions)
      .shownPromise;
  }
}
