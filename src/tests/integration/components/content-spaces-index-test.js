import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import { registerService, lookupService } from '../../helpers/stub-service';
import CurrentUser from 'onedata-gui-websocket-client/services/current-user';
import sinon from 'sinon';
import globals from 'onedata-gui-common/utils/globals';
import createSpace from '../../helpers/create-space';
import { clearStoreAfterEach } from '../../helpers/clear-store';
import { assert } from '@ember/debug';
import CurrentUserHelper from '../../helpers/mixins/current-user';
import { get } from '@ember/object';

const TestCurrentUser = CurrentUser.extend({
  userProxy: promiseObject(resolve({
    id: 'user.user_id.instance:private',
    entityId: 'user_id',
  })),
});

describe('Integration | Component | content-spaces-index', function () {
  const { afterEach, beforeEach } = setupRenderingTest();

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

  it('renders a tile with space details', async function () {
    const helper = new Helper(this);
    await helper.setUser({
      name: 'Test user',
    });
    await helper.setSpace({
      name: 'Test space',
      privileges: {
        view: true,
      },
    });

    await helper.render();

    expect(helper.spaceDetailsTile).to.exist;
    expect(helper.spaceDetailsTile).to.contain.text('Space details');
  });

});

class Helper {
  constructor(mochaContext) {
    assert('mochaContext is mandatory', mochaContext);
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;

    /** @type {Models.User} */
    this.user = null;
    /** @type {Models.Space} */
    this.space = null;
    this.showResourceMembershipTile = false;
    this.currentUserHelper = new CurrentUserHelper(this.mochaContext);
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
      showResourceMembershipTile: this.showResourceMembershipTile,
    });
    await render(hbs `{{content-spaces-index
      space=space
    }}`);
  }
}
