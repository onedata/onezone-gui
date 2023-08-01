import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import UserSpaceHelper from '../../helpers/user-space-helper';

describe('Integration | Component | space-marketplace-tile', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders "Marketplace" in title', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('Marketplace');
  });

  it('renders enabled cart image if space is advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: true,
    });

    await helper.render();

    expect(helper.mainImage).to.have.attribute('src', 'assets/images/cart-checked.svg');
  });

  it('renders disabled cart image if space is not advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: false,
    });

    await helper.render();

    expect(helper.mainImage).to.have.attribute('src', 'assets/images/cart-disabled.svg');
  });

  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.userSpaceHelper = new UserSpaceHelper(this.mochaContext);
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  /** @returns {HTMLElement|null} */
  get element() {
    return find('.space-marketplace-tile');
  }
  get space() {
    return this.userSpaceHelper.space;
  }
  get user() {
    return this.userSpaceHelper.user;
  }
  get mainImage() {
    return this.element.querySelector('.main-image');
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
    await render(hbs `{{space-marketplace-tile
      space=space
    }}`);
  }
}
