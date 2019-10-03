import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { set, get } from '@ember/object';
import { click } from 'ember-native-dom-helpers';
import sinon from 'sinon';
import { resolve } from 'rsvp';

const PrivacyPolicyManagerStub = Service.extend({
  cookieConsentNotification: 'Cookie consent content <a class="clickable privacy-policy-link">privacy policy</a>.',
  areCookiesAccepted: false,
  cookieConsentNotificationProxy: resolve(),

  acceptCookies() {
    this.set('areCookiesAccepted', true);
  },
  showPrivacyPolicyInfo() {},
});

describe('Integration | Component | cookies consent', function () {
  setupComponentTest('cookies-consent', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'privacyPolicyManager', PrivacyPolicyManagerStub);
  });

  it('renders cookie consent notification', function () {
    this.render(hbs`{{cookies-consent}}`);

    expect(this.$('.cookies-consent').text()).to.contain('consent content');
  });

  it('does not render cookie consent notification when cookies are accepted', function () {
    set(lookupService(this, 'privacyPolicyManager'), 'areCookiesAccepted', true);
    this.render(hbs`{{cookies-consent}}`);

    expect(this.$('.cookies-consent')).to.not.exist;
  });

  it('allows to accepts cookies', function () {
    this.render(hbs`{{cookies-consent}}`);

    return click('.accept-cookies').then(() => {
      expect(this.$('.cookies-consent')).to.not.exist;
      expect(get(lookupService(this, 'privacyPolicyManager'), 'areCookiesAccepted')).to.be.true;
    });
  });

  it('makes "privacy policy" link clickable', function () {
    const showPrivacyPolicySpy = sinon.spy(
      lookupService(this, 'privacyPolicyManager'),
      'showPrivacyPolicyInfo'
    );
    
    this.render(hbs`{{cookies-consent}}`);

    return click('.privacy-policy-link').then(() => 
      expect(showPrivacyPolicySpy).to.be.calledOnce
    );
  });
});
