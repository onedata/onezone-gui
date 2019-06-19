import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { resolve } from 'rsvp';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';

function po(val) {
  return PromiseObject.create({ promise: resolve(val) });
}

describe('Integration | Component | content providers', function () {
  setupComponentTest('content-providers', {
    integration: true,
  });

  it(
    'invokes transition to provider-redirect on double click if provider status is online',
    function () {
      const providerId = 'id1';
      const list = [
        po({
          id: providerId,
          latitude: 10,
          longitude: 20,
          online: true,
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

      this.render(hbs `{{content-providers
        providerList=providerList
        transitionToProviderRedirect=transitionToProviderRedirect
      }}`);

      return wait().then(() => {
        this.$('.provider-place-id1').dblclick();
        return wait().then(() => {
          expect(transitionToProviderRedirect).to.be.calledOnce;
        });
      });
    });
});
