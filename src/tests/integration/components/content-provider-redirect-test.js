import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import { registerService } from '../../helpers/stub-service';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { oneproviderAbbrev } from 'onedata-gui-common/utils/onedata-urls';
import gri from 'onedata-gui-websocket-client/utils/gri';
import globals from 'onedata-gui-common/utils/globals';

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

describe('Integration | Component | content-provider-redirect', function () {
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
      globals.mock('location', {
        replace: sinon.spy(),
      });
      const checkIsProviderAvailable = sinon.stub().resolves(true);

      this.setProperties({ provider, checkIsProviderAvailable });

      await render(hbs `{{content-provider-redirect
        checkIsProviderAvailable=checkIsProviderAvailable
        provider=provider
      }}`);

      const contentProviderRedirect = find('.content-provider-redirect');
      expect(contentProviderRedirect).to.exist;

      expect(globals.location.replace).to.be.calledOnce;
      expect(globals.location.replace).to.be.calledWith(url);
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

      expect(checkIsProviderAvailable).to.be.calledOnce;
      expect(showEndpointErrorModal).to.be.calledOnce;
      expect(transitionToProviderOnMap).to.be.calledOnce;
      expect(throwEndpointError).to.be.calledOnce;
    }
  );
});
