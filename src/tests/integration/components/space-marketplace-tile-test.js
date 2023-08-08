import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { lookupService } from '../../helpers/stub-service';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import UserSpaceHelper from '../../helpers/user-space-helper';
import sinon from 'sinon';

describe('Integration | Component | space-marketplace-tile', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders "Marketplace" in title', async function () {
    const helper = new Helper(this);

    await helper.render();

    expect(helper.element.textContent).to.contain('Marketplace');
  });

  it('renders enabled cart image with text if space is advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: true,
    });

    await helper.render();

    expect(helper.mainImage).to.have.attribute('src', 'assets/images/cart-checked.svg');
    expect(helper.element).to.contain.text('Space advertised');
  });

  it('renders disabled cart image with text if space is not advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: false,
    });

    await helper.render();

    expect(helper.mainImage).to.have.attribute('src', 'assets/images/cart-disabled.svg');
    expect(helper.element).to.contain.text('Not advertised');
  });

  it('renders configure button if user has proper privileges', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      privileges: {
        view: true,
        update: true,
        manageInMarketplace: true,
      },
    });

    await helper.render();

    expect(helper.element.textContent).to.contain('Configure advertisement');
  });

  it('does not render configure button if user does not have proper privileges', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      privileges: {
        view: true,
        update: true,
        manageInMarketplace: false,
      },
    });

    await helper.render();

    expect(helper.element.textContent).to.not.contain('Configure advertisement');
  });

  it('renders "Show" link if space is advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: true,
      privileges: {
        view: true,
      },
    });

    await helper.render();

    expect(helper.moreLink).to.exist;
    expect(helper.moreLink).to.contain.text('Show');
  });

  it('does not render "Show" link if space is not advertised', async function () {
    const helper = new Helper(this);
    await helper.setSpace({
      advertisedInMarketplace: false,
      privileges: {
        view: true,
        update: true,
        manageInMarketplace: true,
      },
    });

    await helper.render();

    expect(helper.moreLink).to.not.exist;
  });
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.userSpaceHelper = new UserSpaceHelper(this.mochaContext);
    sinon.stub(lookupService(this.mochaContext, 'router'), 'urlFor').returns('#/url');
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
  get moreLink() {
    return this.element.querySelector('.more-link');
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
