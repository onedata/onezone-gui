import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { onezoneDefaultRootPath } from 'onedata-gui-common/utils/onedata-urls';

describe('Integration | Component | login box/social box list/social box',
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
      expect(this.$('.social-icon-image').attr('style'))
        .to.contain(iconPath);
    });

    it('renders spinner in active state', async function () {
      await render(hbs `{{login-box/social-box-list/social-box active=true}}`);
      expect(this.$('.spin-spinner')).to.exist;
    });

    it('adds authorizer type as a class to box', async function () {
      await render(hbs `{{login-box/social-box-list/social-box authId="example"}}`);
      expect(this.$('.login-icon-box.example')).to.exist;
    });

    it('handles click like a standard anchor if link property is specified',
      async function (done) {
        const link = 'http://test.com';
        const windowMock = {
          location: undefined,
        };
        this.setProperties({
          link,
          windowMock,
        });
        await render(hbs `{{login-box/social-box-list/social-box
          link="http://test.com"
          _window=windowMock}}
        `);
        click('.login-icon-box').then(() => {
          expect(windowMock.location).to.be.equal(link);
          done();
        });
      }
    );

    it('calls action on click', async function (done) {
      const clickSpy = sinon.spy();
      this.set('clickSpy', clickSpy);

      await render(hbs `{{login-box/social-box-list/social-box
        action=(action clickSpy)}}`);
      click('.login-icon-box').then(() => {
        expect(clickSpy).to.be.calledOnce;
        done();
      });
    });
  }
);
