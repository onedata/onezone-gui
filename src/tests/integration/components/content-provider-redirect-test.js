import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { resolve } from 'rsvp';
import { oneproviderAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import gri from 'onedata-gui-websocket-client/utils/gri';

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
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'onezone-server', OnezoneServerStub);
    registerService(this, 'i18n', I18nStub);
    registerService(this, 'alert', AlertStub);
  });

  it(
    'redirects to Oneprovider hosted in Onezone URL',
    async function () {
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
      const url = `/${oneproviderAbbrev}/${clusterEntityId}/i`;
      const fakeLocation = {
        replace() {},
      };
      const locationReplace = sinon.spy(fakeLocation, 'replace');
      const checkIsProviderAvailable = sinon.stub().resolves(true);

      this.setProperties({ provider, fakeLocation, checkIsProviderAvailable });

      await render(hbs `{{content-provider-redirect
        checkIsProviderAvailable=checkIsProviderAvailable
        provider=provider
        _location=fakeLocation
      }}`);

      const $contentProviderRedirect = this.$('.content-provider-redirect');
      expect($contentProviderRedirect).to.exist;

      return wait().then(() => {
        expect(locationReplace).to.be.calledOnce;
        expect(locationReplace).to.be.calledWith(url);
      });
    }
  );

  it('redirects to data index and invokes alert then provider is not available',
    async function () {
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

      await render(hbs `{{content-provider-redirect
        checkIsProviderAvailable=checkIsProviderAvailable
        showEndpointErrorModal=showEndpointErrorModal
        transitionToProviderOnMap=transitionToProviderOnMap
        throwEndpointError=throwEndpointError
        provider=provider
      }}`);

      return wait().then(() => {
        expect(checkIsProviderAvailable).to.be.calledOnce;
        expect(showEndpointErrorModal).to.be.calledOnce;
        expect(transitionToProviderOnMap).to.be.calledOnce;
        expect(throwEndpointError).to.be.calledOnce;
      });
    }
  );
});
