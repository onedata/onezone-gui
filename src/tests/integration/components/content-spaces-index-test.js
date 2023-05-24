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

const TestCurrentUser = CurrentUser.extend({
  userProxy: promiseObject(resolve({
    id: 'user.user_id.instance:private',
    entityId: 'user_id',
  })),
});

describe('Integration | Component | content-spaces-index', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'currentUser', TestCurrentUser);
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('#/xd');
    lookupService(this, 'store').findRecord = function findRecord(modelName, id) {
      throw new Error(`findRecord not stubbed: ${modelName}, ${id}`);
    };
  });

  it('renders a tile with resolved default Oneprovider', async function () {
    const provider1 = {
      id: 'provider.p1.instance:private',
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
});
