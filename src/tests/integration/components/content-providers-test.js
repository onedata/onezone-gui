import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';

function po(val) {
  return PromiseObject.create({ promise: resolve(val) });
}

const Router = Service.extend({
  urlFor() {
    return 'https://example.com';
  },
});

describe('Integration | Component | content providers', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'router', Router);
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
      const providerId = 'id1';
      const list = [
        po({
          id: providerId,
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

      return wait().then(() => {
        this.$('.provider-place-id1').dblclick();
        return wait().then(() => {
          expect(_window.open).to.be.calledOnce;
          expect(_window.open).to.be.calledWith(exampleUrl);
        });
      });
    });
});
