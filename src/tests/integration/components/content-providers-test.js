import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, doubleClick } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import globals from 'onedata-gui-common/utils/globals';
import { clearStoreAfterEach } from '../../helpers/clear-store';

describe('Integration | Component | content-providers', function () {
  setupRenderingTest();

  clearStoreAfterEach();

  beforeEach(function () {
    sinon.stub(lookupService(this, '-routing'), 'transitionTo').returns(null);
  });

  it(
    'invokes transition to provider-redirect on double click if provider status is online',
    async function () {
      const router = lookupService(this, 'router');
      const store = lookupService(this, 'store');
      const exampleUrl = 'https://example.com';
      sinon.stub(router, 'urlFor').returns(exampleUrl);
      globals.mock('window', {
        open: sinon.stub(),
        on() {},
        dispatchEvent() {},
      });
      const space = await store.createRecord('space', {
        name: 'space one',
      }).save();
      const spaceList = await store.createRecord('spaceList', {
        list: [space],
      });
      const providerGri = 'provider.id1.instance:auto';
      const provider = await store.createRecord('provider', {
        name: 'provider one',
        id: providerGri,
        latitude: 10,
        longitude: 20,
        online: true,
        version: '19.02.1',
        spaceList,
      }).save();
      const providerList = await store.createRecord('providerList', {
        list: [provider],
      });
      const transitionToProviderRedirect = sinon.stub().resolves();
      this.setProperties({
        providerList,
        transitionToProviderRedirect,
      });

      await render(hbs `{{content-providers
        providerList=providerList
        transitionToProviderRedirect=transitionToProviderRedirect
      }}`);

      await doubleClick('.provider-place-id1');
      expect(globals.window.open).to.be.calledOnce;
      expect(globals.window.open).to.be.calledWith(exampleUrl);
    });
});
