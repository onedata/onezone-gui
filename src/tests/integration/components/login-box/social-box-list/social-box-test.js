import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import { onezoneDefaultRootPath } from 'onedata-gui-common/utils/onedata-urls';

describe('Integration | Component | login box/social box list/social box',
  function () {
    setupComponentTest('login-box/social-box-list/social-box', {
      integration: true,
    });

    it('renders as box with svg image', function () {
      const iconPath = this.set(
        'iconPath',
        `${onezoneDefaultRootPath}/assets/images/auth-providers/example.svg`
      );
      this.render(hbs `{{login-box/social-box-list/social-box
        authId="example"
        iconPath=iconPath
      }}
      `);
      expect(this.$('.social-icon-image').attr('style'))
        .to.contain(iconPath);
    });

    it('renders spinner in active state', function () {
      this.render(hbs `{{login-box/social-box-list/social-box active=true}}`);
      expect(this.$('.spin-spinner')).to.exist;
    });

    it('adds authorizer type as a class to box', function () {
      this.render(hbs `{{login-box/social-box-list/social-box authId="example"}}`);
      expect(this.$('.login-icon-box.example')).to.exist;
    });

    it('handles click like a standard anchor if link property is specified',
      function (done) {
        const link = 'http://test.com';
        const windowMock = {
          location: undefined,
        };
        this.setProperties({
          link,
          windowMock,
        });
        this.render(hbs `{{login-box/social-box-list/social-box
          link="http://test.com"
          _window=windowMock}}
        `);
        click('.login-icon-box').then(() => {
          expect(windowMock.location).to.be.equal(link);
          done();
        });
      }
    );

    it('calls action on click', function (done) {
      const clickSpy = sinon.spy();
      this.on('clickSpy', clickSpy);

      this.render(hbs `{{login-box/social-box-list/social-box
        action=(action "clickSpy")}}`);
      click('.login-icon-box').then(() => {
        expect(clickSpy).to.be.calledOnce;
        done();
      });
    });
  }
);
