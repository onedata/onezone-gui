import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { onezoneDefaultRootPath } from 'onedata-gui-common/utils/onedata-urls';
import globals from 'onedata-gui-common/utils/globals';

describe('Integration | Component | login-box/social-box-list/social-box',
  function () {
    setupRenderingTest();

    it('renders as box with svg image', async function () {
      const iconPath = this.set(
        'iconPath',
        `${onezoneDefaultRootPath}/assets/images/auth-providers/example.svg`
      );
      await render(hbs `{{login-box/social-box-list/social-box
        authId="example"
        iconPath=iconPath
      }}
      `);
      expect(find('.social-icon-image').getAttribute('style'))
        .to.contain(iconPath);
    });

    it('renders spinner in active state', async function () {
      await render(hbs `{{login-box/social-box-list/social-box active=true}}`);
      expect(find('.spin-spinner')).to.exist;
    });

    it('adds authorizer type as a class to box', async function () {
      await render(hbs `{{login-box/social-box-list/social-box authId="example"}}`);
      expect(find('.login-icon-box.example')).to.exist;
    });

    it('handles click like a standard anchor if link property is specified',
      async function () {
        const link = 'http://test.com';
        globals.mock('window', {
          location: undefined,
        });
        this.set('link', link);
        await render(hbs `{{login-box/social-box-list/social-box
          link="http://test.com"
        }}`);
        await click('.login-icon-box');
        expect(globals.window.location).to.be.equal(link);
      }
    );

    it('calls action on click', async function () {
      const clickSpy = sinon.spy();
      this.set('clickSpy', clickSpy);

      await render(hbs `{{login-box/social-box-list/social-box
        action=(action clickSpy)}}`);
      await click('.login-icon-box');
      expect(clickSpy).to.be.calledOnce;
    });
  }
);
