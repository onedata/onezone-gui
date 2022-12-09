// FIXME: jsdoc

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
import { all as allFulfilled } from 'rsvp';

describe('Integration | Component | modals/spaces/request-space-access-modal', function () {
  setupRenderingTest();

  it('renders header and body explanation text with space name', async function () {
    const helper = new Helper(this);
    helper.setSpaceMarketplaceData({
      name: 'Foo bar',
      organizationName: 'The Corporation',
      spaceId: 'dummy_space_id',
    });

    await helper.showModal();

    expect(helper.header).to.contain.text('Request space access');
    expect(helper.body).to.contain.text(
      'You are about to request access to Foo bar space.'
    );
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

  async setSpaceMarketplaceData(spaceMarketplaceData) {
    this.modalOptions = {
      spaceMarketplaceData: {
        ...spaceMarketplaceData,
      },
    };
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
