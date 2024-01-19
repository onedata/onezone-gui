import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import { registerService, lookupService } from '../../helpers/stub-service';
import CurrentUser from 'onedata-gui-websocket-client/services/current-user';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import UserSpaceHelper from '../../helpers/user-space-helper';
import { set } from '@ember/object';

const TestCurrentUser = CurrentUser.extend({
  userProxy: promiseObject(resolve({
    id: 'user.user_id.instance:private',
    entityId: 'user_id',
  })),
});

describe('Integration | Component | content-spaces-index', function () {
  setupRenderingTest();
  clearStoreAfterEach();

  it('renders a tile with resolved default Oneprovider', async function () {
    registerService(this, 'currentUser', TestCurrentUser);
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('#/xd');
    lookupService(this, 'store').findRecord = function findRecord(modelName, id) {
      throw new Error(`findRecord not stubbed: ${modelName}, ${id}`);
    };

    const provider1 = {
      id: 'provider.op1.instance:private',
      entityId: 'op1',
      name: 'Gamma',
      version: '20.02.1',
      online: true,
      onezoneHostedBaseUrl: 'https://op1.onedata.org',
    };
    const provider2 = {
      id: 'provider.op2.instance:private',
      entityId: 'op2',
      name: 'Beta',
      version: '20.02.1',
      online: true,
      onezoneHostedBaseUrl: 'https://op2.onedata.org',
    };
    const provider3 = {
      id: 'provider.op3.instance:private',
      entityId: 'op3',
      name: 'Alpha',
      version: '20.02.1',
      online: true,
      onezoneHostedBaseUrl: 'https://op3.onedata.org',
    };
    const user = {
      entityId: 'user_id',
      name: 'User name',
    };
    const space = {
      id: 'space.s1.instance:private',
      entityId: 's1',
      name: 'Hello world',
      providerList: promiseObject(resolve({
        list: promiseArray(resolve([provider1, provider2, provider3])),
      })),
      hasViewPrivilege: false,
      info: {
        creatorId: 'user_id',
        creatorType: 'user',
      },
    };
    sinon.stub(lookupService(this, 'store'), 'findRecord')
      .withArgs('user', sinon.match(/user_id/))
      .resolves(user);
    globals.mock('localStorage', {
      values: {},
      getItem(id) {
        return this.values[id];
      },
      setItem(id, value) {
        this.values[id] = value;
      },
    });
    this.set('space', space);

    await render(hbs `{{content-spaces-index
      space=space
      showResourceMembershipTile=false
    }}`);

    expect(
      find('.resource-browse-tile .main-figure .one-label').textContent,
      'browse files tile text'
    ).to.match(/Alpha/);
  });

  //#region space-details-tile

  it('renders a tile with space details, title and configuration link if user has view and update privileges and there is no space details',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        privileges: {
          view: true,
          update: true,
        },
      });

      await helper.render();

      expect(helper.spaceDetailsTile, 'tile').to.exist;
      const moreLink = helper.spaceDetailsTile.querySelector('.more-link');
      expect(moreLink, 'more-link').to.exist;
      expect(moreLink).to.contain.text('Configure');
      expect(helper.spaceDetailsTile).to.contain.text('Space details');
    }
  );

  it('does not render a tile with space details if all space details are missing and user has no update privileges',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        privileges: {
          view: true,
          update: false,
        },
      });

      await helper.render();

      expect(helper.spaceDetailsTile).to.not.exist;
    }
  );

  it('renders a tile with space details, but without configuration link if some space detail is present and user has no update privileges',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        description: 'hello world',
        privileges: {
          view: true,
          update: false,
        },
      });

      await helper.render();

      expect(helper.spaceDetailsTile).to.exist;
      const moreLink = helper.spaceDetailsTile.querySelector('.more-link');
      expect(moreLink).to.not.exist;
    }
  );

  it('renders a tile with space details, but without configuration link if some space detail is present and user has no update privileges',
    async function () {
      const helper = new Helper(this);
      await helper.setSpace({
        description: 'hello world',
        privileges: {
          view: true,
          update: false,
        },
      });

      await helper.render();

      expect(helper.spaceDetailsTile).to.exist;
      const moreLink = helper.spaceDetailsTile.querySelector('.more-link');
      expect(moreLink).to.not.exist;
    }
  );

  //#endregion

  //#region space-marketplace-tile

  it('renders a tile with space Marketplace info if Marketplace is enabled and user has space update privileges',
    async function () {
      const helper = new Helper(this);
      set(helper.spaceManager, 'marketplaceConfig', {
        enabled: true,
      });
      await helper.setSpace({
        advertisedInMarketplace: false,
        privileges: {
          view: true,
          update: true,
        },
      });

      await helper.render();

      expect(helper.spaceMarketplaceTile).to.exist;
    }
  );

  it('renders a tile with space Marketplace info if Marketplace is enabled, space is advertised and user has no space update privileges',
    async function () {
      const helper = new Helper(this);
      set(helper.spaceManager, 'marketplaceConfig', {
        enabled: true,
      });
      await helper.setSpace({
        advertisedInMarketplace: true,
        privileges: {
          view: true,
          update: false,
        },
      });

      await helper.render();

      expect(helper.spaceMarketplaceTile).to.exist;
    }
  );

  it('does not render a tile with space Marketplace info if Marketplace is enabled, space is not advertised and user has no space update privileges',
    async function () {
      const helper = new Helper(this);
      set(helper.spaceManager, 'marketplaceConfig', {
        enabled: true,
      });
      await helper.setSpace({
        advertisedInMarketplace: false,
        privileges: {
          view: true,
          update: false,
        },
      });

      await helper.render();

      expect(helper.spaceMarketplaceTile).to.not.exist;
    }
  );

  it('does not render a tile with space Marketplace info if Marketplace is disabled',
    async function () {
      const helper = new Helper(this);
      set(helper.spaceManager, 'marketplaceConfig', {
        enabled: false,
      });
      await helper.setSpace({
        advertisedInMarketplace: true,
        privileges: {
          view: true,
          update: true,
        },
      });

      await helper.render();

      expect(helper.spaceMarketplaceTile).to.not.exist;
    }
  );

  it('closes tile with unadvertised space Marketplace info after dismiss button is clicked',
    async function () {
      const helper = new Helper(this);
      set(helper.spaceManager, 'marketplaceConfig', {
        enabled: true,
      });
      await helper.setSpace({
        advertisedInMarketplace: false,
        privileges: {
          view: true,
          update: true,
        },
      });

      await helper.render();
      expect(helper.spaceMarketplaceTile).to.exist;
      const dismissButton = helper.spaceMarketplaceTile.querySelector('.dismiss-button');
      await click(dismissButton);

      expect(helper.spaceMarketplaceTile).to.not.exist;
    }
  );

  //#endregion
});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
    this.showResourceMembershipTile = false;
    this.userSpaceHelper = new UserSpaceHelper(this.mochaContext);
    sinon.stub(lookupService(this.mochaContext, 'router'), 'urlFor').returns('#/url');
  }

  get store() {
    return lookupService(this.mochaContext, 'store');
  }
  /** @returns {HTMLElement|null} */
  get element() {
    return find('.content-spaces-index');
  }
  get spaceDetailsTile() {
    return this.element.querySelector('.space-details-tile');
  }
  get spaceMarketplaceTile() {
    return this.element.querySelector('.space-marketplace-tile');
  }
  get space() {
    return this.userSpaceHelper.space;
  }
  get user() {
    return this.userSpaceHelper.user;
  }
  get spaceManager() {
    return lookupService(this.mochaContext, 'spaceManager');
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
      showResourceMembershipTile: this.showResourceMembershipTile,
    });
  }
  async render() {
    await this.beforeRender();
    await render(hbs `{{content-spaces-index
      space=space
    }}`);
  }
}
