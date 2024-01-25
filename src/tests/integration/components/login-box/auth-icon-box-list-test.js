import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { resolve } from 'rsvp';
import { find } from '@ember/test-helpers';

describe('Integration | Component | login-box/auth-icon-box-list', function () {
  setupRenderingTest();

  it('shows spinner when loading', async function () {
    await render(hbs `{{login-box/auth-icon-box-list isLoading=true}}`);
    expect(find('.spin-spinner')).to.exist;
  });

  it('shows error message if occurred', async function () {
    const errorMsg = 'some really bad error';
    this.set('errorMsg', errorMsg);
    await render(hbs `{{login-box/auth-icon-box-list errorMessage=errorMsg}}`);
    expect(this.element).to.contain.text(errorMsg);
  });

  it('shows clickable "show more" button', async function () {
    const showMoreSpy = sinon.spy();
    this.set('showMoreSpy', showMoreSpy);
    await render(hbs `{{login-box/auth-icon-box-list
      showMoreButton=true
      showMoreClick=(action showMoreSpy)}}
    `);
    expect(find('.login-icon-box.more')).to.exist;
    await click('.login-icon-box.more');
    expect(showMoreSpy).to.be.calledOnce;
  });

  it('shows clickable basicAuth', async function () {
    const basicAuthSpy = sinon.spy();
    this.set('basicAuthSpy', basicAuthSpy);
    this.set('supportedAuthorizers', [{
      id: 'basicAuth',
      iconPath: '/custom/basicauth.svg',
    }]);
    await render(hbs `{{login-box/auth-icon-box-list
      supportedAuthorizers=supportedAuthorizers
      usernameLoginClick=(action basicAuthSpy)}}
    `);
    expect(find('.login-icon-box.basicAuth')).to.exist;
    await click('.login-icon-box.basicAuth');
    expect(basicAuthSpy).to.be.calledOnce;
  });

  it('shows clickable custom auth providers', async function () {
    const authenticateSpy = sinon.spy(() => resolve());
    this.set('authenticateSpy', authenticateSpy);
    this.set('supportedAuthorizers', [{
      id: 'provider1',
    }, {
      id: 'provider2',
    }]);
    await render(hbs `{{login-box/auth-icon-box-list
      supportedAuthorizers=supportedAuthorizers
      authenticate=(action authenticateSpy)}}
    `);
    expect(find('.login-icon-box.provider1')).to.exist;
    expect(find('.login-icon-box.provider2')).to.exist;
    await click('.login-icon-box.provider1');
    expect(authenticateSpy).to.be.calledWith('provider1');
  });
});
