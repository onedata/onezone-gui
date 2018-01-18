import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';

describe('Integration | Component | content tokens', function () {
  setupComponentTest('content-tokens', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'globalNotify', Service.extend({}));
    registerService(this, 'clientTokenManager', Service.extend({}));
    registerService(this, 'router', Service.extend({}));
  });

  it('renders textarea with token string', function () {
    const tokenString = 'abcdef';
    this.set('token', EmberObject.create({
      id: '1',
      token: tokenString,
    }));
    this.render(hbs `{{content-tokens selectedToken=token}}`);
    expect(this.$('textarea').text().trim()).to.equal(tokenString);
  });
});
