import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { resolve } from 'rsvp';
import { oneproviderAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import gri from 'onedata-gui-websocket-client/utils/gri';

class FakeWindow {
  constructor() {
    this.location = {
      _str: '',
      replace(val) {
        this._str = val;
      },
      toString() {
        return this._str;
      },
    };
  }
}

const OnezoneServerStub = Service.extend({
  getProviderRedirectUrl() {
    throw new Error('not implemented');
  },
});

const I18nStub = Service.extend({
  t() {
    return '_';
  },
});

const AlertStub = Service.extend({
  error() {},
});

describe('Integration | Component | content provider redirect', function () {
  setupComponentTest('content-provider-redirect', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onezone-server', OnezoneServerStub);
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'alert', AlertStub);
  });

  it('redirects to Oneprovider hosted in Onezone URL',
    function () {
      const clusterEntityId = '12345';
      const provider = {
        entityId: 'test1',
        onezoneHostedBaseUrl: '/opw/12345/i',
        cluster: resolve({
          workerVersion: {
            release: '19.02',
          },
        }),
        belongsTo() {
          return {
            id() {
              return gri({
                entityType: 'provider',
                entityId: '12345',
                aspect: 'instance',
                scope: 'protected',
              });
            },
          };
        },
      };
      const onezoneServer = lookupService(this, 'onezone-server');
      const url = `/${oneproviderAbbrev}/${clusterEntityId}/i#/`;
      const legacyUrl = 'https://test-test-provider-1.com';
      const getProviderRedirectUrl = sinon.stub(
        onezoneServer,
        'getProviderRedirectUrl'
      ).resolves({ url: legacyUrl });
      const fakeWindow = new FakeWindow();
      const checkIsProviderAvailable = sinon.stub().resolves(true);

      this.setProperties({ provider, fakeWindow, checkIsProviderAvailable });

      this.render(hbs `{{content-provider-redirect
        checkIsProviderAvailable=checkIsProviderAvailable
        provider=provider
        _window=fakeWindow
      }}`);

      const $contentProviderRedirect = this.$('.content-provider-redirect');
      expect($contentProviderRedirect).to.exist;

      return wait().then(() => {
        expect(getProviderRedirectUrl).to.be.invokedOnce;
        expect(fakeWindow.location.toString()).to.equal(url);
      });
    });

  it('fetches and uses provider redirect URL for legacy Oneproviders',
    function (done) {
      const provider = {
        entityId: 'test1',
        belongsTo(relName) {
          if (relName === 'cluster') {
            return {
              id: () => 'clusters.123.instance:protected',
            };
          }
        },
        cluster: resolve({
          workerVersion: {
            release: '18.02.*',
          },
        }),
      };
      const onezoneServer = lookupService(this, 'onezone-server');
      const legacyUrl = 'https://test-test-provider-1.com';
      const getProviderRedirectUrl = sinon.stub(
        onezoneServer,
        'getProviderRedirectUrl'
      ).resolves({ url: legacyUrl });

      const fakeWindow = new FakeWindow();
      const checkIsProviderAvailable = sinon.stub().resolves(false);

      this.setProperties({ provider, fakeWindow, checkIsProviderAvailable });

      this.render(hbs `{{content-provider-redirect
        checkIsProviderAvailable=checkIsProviderAvailable
        provider=provider
        _window=fakeWindow
      }}`);

      wait().then(() => {
        expect(checkIsProviderAvailable).to.be.notCalled;
        expect(getProviderRedirectUrl).to.be.invokedOnce;
        expect(fakeWindow.location.toString()).to.equal(legacyUrl);
        done();
      });
    });

  it('redirects to data index and invokes alert then provider is not available',
    function () {
      const provider = {
        entityId: 'test1',
        belongsTo(relName) {
          if (relName === 'cluster') {
            return {
              id: () => 'clusters.12345.instance:protected',
            };
          } else {
            throw new Error('mock error - only cluster is supported');
          }
        },
        cluster: resolve({
          workerVersion: {
            release: '19.02',
          },
        }),
      };
      const checkIsProviderAvailable = sinon.stub().resolves(false);
      const showEndpointErrorModal = sinon.spy();
      const transitionToProviderOnMap = sinon.spy();
      const throwEndpointError = sinon.spy();
      this.setProperties({
        provider,
        checkIsProviderAvailable,
        showEndpointErrorModal,
        transitionToProviderOnMap,
        throwEndpointError,
      });

      this.render(hbs `{{content-provider-redirect
      checkIsProviderAvailable=checkIsProviderAvailable
      showEndpointErrorModal=showEndpointErrorModal
      transitionToProviderOnMap=transitionToProviderOnMap
      throwEndpointError=throwEndpointError
      provider=provider
    }}`);

      wait().then(() => {
        expect(checkIsProviderAvailable).to.be.invokedOnce;
        expect(showEndpointErrorModal).to.be.invokedOnce;
        expect(transitionToProviderOnMap).to.be.invokedOnce;
        expect(throwEndpointError).to.be.invokedOnce;
      });
    });
});
