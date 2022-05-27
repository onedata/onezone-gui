import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';
import { click } from 'ember-native-dom-helpers';
import { resolve } from 'rsvp';

describe('Integration | Component | login box/social box list', function () {
  setupRenderingTest();

  it('shows spinner when loading', async function () {
    await render(hbs `{{login-box/social-box-list isLoading=true}}`);
    expect(this.$('.spin-spinner')).to.exist;
  });

  it('shows error message if occurred', async function () {
    const errorMsg = 'some really bad error';
    this.set('errorMsg', errorMsg);
    await render(hbs `{{login-box/social-box-list errorMessage=errorMsg}}`);
    expect(this.$().text()).to.contain(errorMsg);
  });

  it('shows clickable "show more" button', async function (done) {
    const showMoreSpy = sinon.spy();
    this.set('showMoreSpy', showMoreSpy);
    await render(hbs `{{login-box/social-box-list
      showMoreButton=true
      showMoreClick=(action showMoreSpy)}}
    `);
    expect(this.$('.login-icon-box.more')).to.exist;
    click('.login-icon-box.more').then(() => {
      expect(showMoreSpy).to.be.calledOnce;
      done();
    });
  });

  it('shows clickable basicAuth', async function (done) {
    const basicAuthSpy = sinon.spy();
    this.set('basicAuthSpy', basicAuthSpy);
    this.set('supportedAuthorizers', [{
      id: 'basicAuth',
      iconPath: '/custom/basicauth.svg',
    }]);
    await render(hbs `{{login-box/social-box-list
      supportedAuthorizers=supportedAuthorizers
      usernameLoginClick=(action basicAuthSpy)}}
    `);
    expect(this.$('.login-icon-box.basicAuth')).to.exist;
    click('.login-icon-box.basicAuth').then(() => {
      expect(basicAuthSpy).to.be.calledOnce;
      done();
    });
  });

  it('shows clickable custom auth providers', async function (done) {
    const authenticateSpy = sinon.spy(() => resolve());
    this.set('authenticateSpy', authenticateSpy);
    this.set('supportedAuthorizers', [{
      id: 'provider1',
    }, {
      id: 'provider2',
    }]);
    await render(hbs `{{login-box/social-box-list
      supportedAuthorizers=supportedAuthorizers
      authenticate=(action authenticateSpy)}}
    `);
    expect(this.$('.login-icon-box.provider1')).to.exist;
    expect(this.$('.login-icon-box.provider2')).to.exist;
    click('.login-icon-box.provider1').then(() => {
      expect(authenticateSpy).to.be.calledWith('provider1');
      done();
    });
  });
});
