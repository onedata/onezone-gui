import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import sinon from 'sinon';
import wait from 'ember-test-helpers/wait';
import { Promise } from 'rsvp';

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
    const provider = { entityId: 'test1' };
    const onezoneServer = lookupService(this, 'onezone-server');
    const url = 'http://example.com';
    const getProviderRedirectUrl = sinon.stub(
      onezoneServer,
      'getProviderRedirectUrl'
    ).returns(Promise.resolve({ url }));
    const fakeWindow = {};
    this.setProperties({ provider, fakeWindow });

    this.render(hbs `{{content-provider-redirect 
      provider=provider
      _window=fakeWindow
    }}`);

    const $contentProviderRedirect = this.$('.content-provider-redirect');
    expect($contentProviderRedirect).to.exist;

    wait().then(() => {
      expect(getProviderRedirectUrl).to.be.invokedOnce;
      expect(fakeWindow.location).to.equal(url);
      done();
    });
  });
});
