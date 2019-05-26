import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';

describe('Integration | Component | login box/social box list', function () {
  setupComponentTest('login-box/social-box-list', {
    integration: true,
  });

  it('shows spinner when loading', function () {
    this.render(hbs `{{login-box/social-box-list isLoading=true}}`);
    expect(this.$('.spin-spinner')).to.exist;
  });

  it('shows error message if occurred', function () {
    const errorMsg = 'some really bad error';
    this.set('errorMsg', errorMsg);
    this.render(hbs `{{login-box/social-box-list errorMessage=errorMsg}}`);
    expect(this.$().text()).to.contain(errorMsg);
  });

  it('shows clickable "show more" button', function (done) {
    const showMoreSpy = sinon.spy();
    this.on('showMoreSpy', showMoreSpy);
    this.render(hbs `{{login-box/social-box-list
      showMoreButton=true
      showMoreClick=(action "showMoreSpy")}}
    `);
    expect(this.$('.login-icon-box.more')).to.exist;
    click('.login-icon-box.more').then(() => {
      expect(showMoreSpy).to.be.calledOnce;
      done();
    });
  });

  it('shows clickable basicAuth', function (done) {
    const basicAuthSpy = sinon.spy();
    this.on('basicAuthSpy', basicAuthSpy);
    this.set('supportedAuthorizers', [{
      id: 'basicAuth',
      iconPath: '/custom/basicauth.svg',
    }]);
    this.render(hbs `{{login-box/social-box-list
      supportedAuthorizers=supportedAuthorizers
      usernameLoginClick=(action "basicAuthSpy")}}
    `);
    expect(this.$('.login-icon-box.basicAuth')).to.exist;
    click('.login-icon-box.basicAuth').then(() => {
      expect(basicAuthSpy).to.be.calledOnce;
      done();
    });
  });

  it('shows clickable custom auth providers', function (done) {
    const authenticateSpy = sinon.spy(() => resolve());
    this.on('authenticateSpy', authenticateSpy);
    this.set('supportedAuthorizers', [{
      id: 'provider1',
    }, {
      id: 'provider2',
    }]);
    this.render(hbs `{{login-box/social-box-list
      supportedAuthorizers=supportedAuthorizers
      authenticate=(action "authenticateSpy")}}
    `);
    expect(this.$('.login-icon-box.provider1')).to.exist;
    expect(this.$('.login-icon-box.provider2')).to.exist;
    click('.login-icon-box.provider1').then(() => {
      expect(authenticateSpy).to.be.calledWith('provider1');
      done();
    });
  });
});
