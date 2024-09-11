import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, settled, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../helpers/stub-service';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { defer } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';
import sleep from 'onedata-gui-common/utils/sleep';

function getStyle(element, styleName) {
  return globals.window.getComputedStyle(element)[styleName];
}

describe('Integration | Component | onezone-login', function () {
  setupRenderingTest();

  it('renders available authorizers icons on original login view', async function () {
    const authorizerManager = lookupService(this, 'authorizerManager');
    const getAuthorizersLock = defer();
    authorizerManager.getAvailableAuthorizers = () => {
      return promiseArray((async () => {
        try {
          return [{
            id: 'google',
            displayName: 'Google',
            iconPath: '/test/google.svg',
            iconBackgroundColor: '#fff',
          }];
        } finally {
          getAuthorizersLock.resolve();
        }
      })());
    };

    await render(hbs`
      <OnezoneLogin />
    `);
    await getAuthorizersLock.promise;
    await settled();

    /** @type {Array<HTMLElement>} */
    const loginIconBoxes = findAll('.login-icon-box');
    expect(loginIconBoxes.length).to.equal(1);
    const loginIconBox = loginIconBoxes[0];
    expect(loginIconBox).to.have.class('google');
    expect(getStyle(loginIconBox, 'backgroundColor')).to.equal('rgb(255, 255, 255)');
    const authIconImage = loginIconBox.querySelector('.auth-icon-image');
    expect(getStyle(authIconImage, 'backgroundImage')).to.contain('/test/google.svg');
  });

  it('renders sanitized sign-in notification with newlines on original login view', async function () {
    const authorizerManager = lookupService(this, 'authorizerManager');
    const guiMessageManager = lookupService(this, 'guiMessageManager');
    const getAuthorizersLock = defer();
    const getMessageLock = defer();
    authorizerManager.getAvailableAuthorizers = () => {
      return promiseArray((async () => {
        try {
          return [{
            id: 'google',
            displayName: 'Google',
            iconPath: '/test/google.svg',
            iconBackgroundColor: '#fff',
          }];
        } finally {
          getAuthorizersLock.resolve();
        }
      })());
    };
    guiMessageManager.getMessage = async (messageType) => {
      if (messageType === 'signin_notification') {
        try {
          return '<script>alert("hello");</script>hello\nworld';
        } finally {
          getMessageLock.resolve();
        }
      } else {
        return '';
      }
    };

    await render(hbs`
      <OnezoneLogin />
    `);
    await getAuthorizersLock.promise;
    await getMessageLock.promise;
    await settled();
    await sleep(1000);
    expect(find('.login-notification-admin-message').innerHTML)
      .to.match(/^\s*hello\s*<br>\s*world\s*$/);
  });
});
