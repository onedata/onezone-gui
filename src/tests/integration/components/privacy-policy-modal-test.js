import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import { registerService, lookupService } from '../../helpers/stub-service';
import { get, set, setProperties } from '@ember/object';
import $ from 'jquery';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';

const PrivacyPolicyManagerStub = Service.extend({
  isPrivacyPolicyInfoVisible: false,
  privacyPolicy: '<h1>Privacy policy</h1> <p>something</p>',

  hidePrivacyPolicyInfo() {
    this.set('isPrivacyPolicyInfoVisible', false);
  },
});

describe('Integration | Component | privacy policy modal', function() {
  setupComponentTest('privacy-policy-modal', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'privacyPolicyManager', PrivacyPolicyManagerStub);
  });

  it('can be opened', function () {
    set(lookupService(this, 'privacyPolicyManager'), 'isPrivacyPolicyInfoVisible', true);

    this.render(hbs`{{privacy-policy-modal}}`);

    expect($('.modal.in')).to.exist;
  });

  it('cannot be opened if content is empty', function () {
    setProperties(lookupService(this, 'privacyPolicyManager'), {
      isPrivacyPolicyInfoVisible: true,
      privacyPolicy: undefined,
    });

    this.render(hbs`{{privacy-policy-modal}}`);

    expect($('.modal.in')).to.not.exist;
  });

  it('shows privacy policy content', function () {
    set(lookupService(this, 'privacyPolicyManager'), 'isPrivacyPolicyInfoVisible', true);

    this.render(hbs`{{privacy-policy-modal}}`);

    expect($('.modal.in h1').text()).to.contain('Privacy policy');
    expect($('.modal.in p')).to.exist;
  });

  it('can be closed', function () {
    const privacyPolicyManager = lookupService(this, 'privacyPolicyManager');
    set(privacyPolicyManager, 'isPrivacyPolicyInfoVisible', true);

    this.render(hbs`{{privacy-policy-modal}}`);

    return wait()
      .then(() => {
        const button = $('.modal.in .close-privacy-policy')[0];
        return click(button);
      })
      .then(() => {
        expect($('.modal.in')).to.not.exist;
        expect(get(privacyPolicyManager, 'isPrivacyPolicyInfoVisible')).to.be.false;
      });
  });
});
