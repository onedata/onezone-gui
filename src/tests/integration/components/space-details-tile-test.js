import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import UserSpaceHelper from '../../helpers/user-space-helper';

describe('Integration | Component | space-details-tile', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders "Space details" in title', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('Space details');
  });

  it('renders "No details provided" if there are no details', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('No details provided');
  });

  it('does not render "No details provided" if there are some details', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      description: 'hello world',
    });

    await helper.render();

    expect(helper.element.textContent).to.not.contain('No details provided');
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.showResourceMembershipTile = false;
    this.userSpaceHelper = new UserSpaceHelper(this.mochaContext);
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  /** @returns {HTMLElement|null} */
  get element() {
    return find('.space-details-tile');
  }
  get space() {
    return this.userSpaceHelper.space;
  }
  get user() {
    return this.userSpaceHelper.user;
  }
  setUser() {
    return this.userSpaceHelper.setUser(...arguments);
  }
  setSpace() {
    return this.userSpaceHelper.setSpace(...arguments);
  }
  async beforeRender() {
    await this.userSpaceHelper.ensureData();
    this.mochaContext.setProperties({
      space: this.space,
    });
  }
  async render() {
    await this.beforeRender();
    await render(hbs `{{space-details-tile
      space=space
    }}`);
  }
}
