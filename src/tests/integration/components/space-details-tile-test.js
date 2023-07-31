import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import createSpace from '../../helpers/create-space';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import CurrentUserHelper from '../../helpers/mixins/current-user';

describe('Integration | Component | space-details-tile', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders "Space details" in title', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('Space details');
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;

    this.space = null;
    this.showResourceMembershipTile = false;
    this.currentUserHelper = new CurrentUserHelper(this.mochaContext);
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  /** @returns {HTMLElement|null} */
  get element() {
    return find('.space-details-tile');
  }
  get moreLink() {
    return this.element.querySelector('.more-link');
  }

  async setSpace(spaceData = {}) {
    if (!this.user) {
      await this.setUser();
    }
    /** @type {Models.Space} */
    this.space = await createSpace(this.store, spaceData, this.user);
    return this.space;
  }
  async setUser(userData = {}) {
    const user = await this.currentUserHelper.stubCurrentUser(userData);
    this.user = user;
    return user;
  }
  async render() {
    if (!this.space) {
      await this.setSpace();
    }
    this.mochaContext.setProperties({
      space: this.space,
    });
    await render(hbs `{{space-details-tile
      space=space
    }}`);
  }
}
