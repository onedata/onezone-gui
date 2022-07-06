import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, doubleClick } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';

function po(val) {
  return PromiseObject.create({ promise: resolve(val) });
}

describe('Integration | Component | content providers', function () {
  setupRenderingTest();

  beforeEach(function () {
    sinon.stub(lookupService(this, '-routing'), 'transitionTo').returns(null);
  });

  it(
    'invokes transition to provider-redirect on double click if provider status is online',
    async function () {
      const router = lookupService(this, 'router');
      const exampleUrl = 'https://example.com';
      sinon.stub(router, 'urlFor').returns(exampleUrl);
      const _window = {
        open: sinon.stub(),
        on() {},
        dispatchEvent() {},
      };
      this.set('_window', _window);
      const providerGri = 'provider.id1.instance:auto';
      const list = [
        po({
          id: providerGri,
          latitude: 10,
          longitude: 20,
          online: true,
          versionProxy: po('19.02.1'),
          spaceList: po({
            list: po([
              po({
                name: 'space one',
              }),
            ]),
          }),
        }),
      ];
      const providerList = {
        list: po(list),
      };
      const transitionToProviderRedirect = sinon.stub().resolves();
      this.setProperties({
        providerList,
        transitionToProviderRedirect,
      });

      await render(hbs `{{content-providers
        _window=_window
        providerList=providerList
        transitionToProviderRedirect=transitionToProviderRedirect
      }}`);

      await doubleClick('.provider-place-id1');
      expect(_window.open).to.be.calledOnce;
      expect(_window.open).to.be.calledWith(exampleUrl);
    });
});
