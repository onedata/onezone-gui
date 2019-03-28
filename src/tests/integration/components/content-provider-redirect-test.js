import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { Promise, resolve } from 'rsvp';

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

describe('Integration | Component | content provider redirect', function () {
  setupComponentTest('content-provider-redirect', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'onezone-server', OnezoneServerStub);
    registerService(this, 'i18n', I18nStub);
  });

  it('fetches provider redirect URL immediately and uses it', function (done) {
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
    const onezoneServer = lookupService(this, 'onezone-server');
    const url = '/opw/12345/i#/';
    const getProviderRedirectUrl = sinon.stub(
      onezoneServer,
      'getProviderRedirectUrl'
    ).returns(Promise.resolve({ url }));
    let locationUrl;
    const fakeWindow = {
      location: {
        replace(url) {
          locationUrl = url;
        },
      },
    };
    this.setProperties({ provider, fakeWindow });
    this.on(
      'checkIsProviderAvailable', () => resolve(true));

    this.render(hbs `{{content-provider-redirect
      checkIsProviderAvailable=(action "checkIsProviderAvailable")
      provider=provider
      _window=fakeWindow
    }}`);

    const $contentProviderRedirect = this.$('.content-provider-redirect');
    expect($contentProviderRedirect).to.exist;

    wait().then(() => {
      expect(getProviderRedirectUrl).to.be.invokedOnce;
      expect(locationUrl).to.equal(url);
      done();
    });
  });
});
