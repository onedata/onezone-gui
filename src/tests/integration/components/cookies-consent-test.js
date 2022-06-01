import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerService, lookupService } from '../../helpers/stub-service';
import Service from '@ember/service';
import { set, get } from '@ember/object';
import { resolve } from 'rsvp';

const GuiMessageManagerStub = Service.extend({
  cookieConsentNotification: 'Cookie consent content <a class="clickable privacy-policy-link">privacy policy</a>.',
  areCookiesAccepted: false,
  cookieConsentNotificationProxy: resolve(),

  acceptCookies() {
    this.set('areCookiesAccepted', true);
  },
  showPrivacyPolicyInfo() {},
});

describe('Integration | Component | cookies consent', function () {
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'guiMessageManager', GuiMessageManagerStub);
  });

  it('renders cookie consent notification', async function () {
    await render(hbs `{{cookies-consent}}`);

    expect(find('.cookies-consent')).to.contain.text('consent content');
  });

  it(
    'does not render cookie consent notification when cookies are accepted',
    async function () {
      set(lookupService(this, 'guiMessageManager'), 'areCookiesAccepted', true);
      await render(hbs `{{cookies-consent}}`);

      expect(find('.cookies-consent')).to.not.exist;
    }
  );

  it('allows to accepts cookies', async function () {
    await render(hbs `{{cookies-consent}}`);

    return click('.accept-cookies').then(() => {
      expect(find('.cookies-consent')).to.not.exist;
      expect(
        get(lookupService(this, 'guiMessageManager'),
          'areCookiesAccepted')
      ).to.be.true;
    });
  });
});
