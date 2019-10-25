import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import { setProperties } from '@ember/object';
import { registerService } from '../../helpers/stub-service';
import Service from '@ember/service';
import moment from 'moment';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import wait from 'ember-test-helpers/wait';
import { resolve, reject } from 'rsvp';
import { click } from 'ember-native-dom-helpers';

const datetimeFormat = 'YYYY-MM-DD [at] H:mm ([UTC]Z)';

describe('Integration | Component | content tokens', function () {
  setupComponentTest('content-tokens', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'globalNotify', Service.extend({}));

    this.set('token', {
      name: 'token name',
      token: 'sometokenstringsometokenstring',
      revoked: true,
      metadata: {},
      tokenTargetProxy: PromiseObject.create({ promise: resolve() }),
    });
  });

  it('has class content-tokens', function () {
    this.render(hbs `{{content-tokens}}`);

    expect(this.$('.content-tokens')).to.exist;
  });

  it('shows token name in header', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    expect(this.$('h1 .token-name').text().trim()).to.equal(this.get('token.name'));
  });

  it('shows token name', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-name-property');
      expect($tokenPropertyRow.find('.token-name-label').text().trim()).to.equal('Name:');
      expect($tokenPropertyRow.find('.token-name').text().trim()).to.equal(this.get('token.name'));
    });
  });

  it('shows token "revoked" state', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-revoked-property');
      expect($tokenPropertyRow.find('.token-revoked-label').text().trim()).to.equal('Revoked:');
      expect($tokenPropertyRow.find('.token-revoked-toggle')).to.have.class('checked');
    });
  });

  it('shows type for access token', function () {
    this.set('token.typeName', 'access');

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-type-property');
      expect($tokenPropertyRow.find('.token-type-label').text().trim()).to.equal('Type:');
      expect($tokenPropertyRow.find('.token-type .type-name').text().trim()).to.equal('Access');
      expect($tokenPropertyRow.find('.token-type .subtype')).to.not.exist;
    });
  });

  it('shows type for invite token', function () {
    setProperties(this.get('token'), {
      typeName: 'invite',
      subtype: 'sth',
    });

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-type-property');
      expect($tokenPropertyRow.find('.token-type-label').text().trim()).to.equal('Type:');
      expect($tokenPropertyRow.find('.token-type .type-name').text().trim()).to.equal('Invite');
      expect($tokenPropertyRow.find('.token-type .subtype')).to.exist;
    });
  });

  [
    { subtype: 'userJoinGroup', subtypeTranslation: 'join user to group' },
    { subtype: 'groupJoinGroup', subtypeTranslation: 'join group to group' },
    { subtype: 'userJoinSpace', subtypeTranslation: 'join user to space' },
    { subtype: 'groupJoinSpace', subtypeTranslation: 'join group to space' },
    { subtype: 'supportSpace', subtypeTranslation: 'support space' },
    { subtype: 'registerOneprovider', subtypeTranslation: 'register Oneprovider' },
    { subtype: 'userJoinCluster', subtypeTranslation: 'join user to cluster' },
    { subtype: 'groupJoinCluster', subtypeTranslation: 'join group to cluster' },
    { subtype: 'userJoinHarvester', subtypeTranslation: 'join user to harvester' },
    { subtype: 'groupJoinHarvester', subtypeTranslation: 'join group to harvester' },
    { subtype: 'spaceJoinHarvester', subtypeTranslation: 'join space to harvester' },
  ].forEach(({ subtype, subtypeTranslation }) => {
    it(`shows "${subtypeTranslation}" for "${subtype}" invite token`, function () {
      setProperties(this.get('token'), {
        typeName: 'invite',
        subtype,
      });
  
      this.render(hbs `{{content-tokens token=token}}`);
  
      return wait().then(() => {
        const $tokenPropertyRow = this.$('.token-type-property');
        expect($tokenPropertyRow.find('.token-type .subtype').text().trim()).to.equal(subtypeTranslation);
      });
    });
  });

  it('shows creation time', function () {
    const now = moment();
    this.set('token.metadata.creationTime', now.unix());

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-creation-time-property');
      expect($tokenPropertyRow.find('.token-creation-time-label').text().trim()).to.equal('Creation time:');
      expect($tokenPropertyRow.find('.token-creation-time').text().trim()).to.equal(now.format(datetimeFormat));
    });
  });

  it('shows info about expiration time if it is specified', function () {
    const now = moment();
    this.set('token.validUntil', now.unix());
    
    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-expiration-time-property');
      expect($tokenPropertyRow.find('.token-expiration-time-label').text().trim()).to.equal('Expiration time:');
      expect($tokenPropertyRow.find('.token-expiration-time').text().trim()).to.equal(now.format(datetimeFormat));
    });
  });

  it('does not shows info about expiration time when it is not specified', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    expect(this.$('.token-expiration-time-property')).to.not.exist;
  });

  it('shows invite token target', function () {
    setProperties(this.get('token'), {
      typeName: 'invite',
      subtype: 'userJoinGroup',
      tokenTargetProxy: PromiseObject.create({
        promise: resolve({
          name: 'user1',
        }),
      }),
    });

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-target-property');
      expect($tokenPropertyRow.find('.token-target-label').text().trim()).to.equal('Target:');
      expect($tokenPropertyRow.find('.token-target').text().trim()).to.equal('user1');
    });
  });

  it('shows info about not found token target', function () {
    setProperties(this.get('token'), {
      typeName: 'invite',
      subtype: 'userJoinGroup',
      tokenTargetProxy: PromiseObject.create({
        promise: reject({ id: 'notFound' }),
      }),
    });

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-target-property');
      expect($tokenPropertyRow.find('.token-target').text().trim()).to.equal('Not found');
    });
  });

  it('shows info about token target fetch error due to "forbidden"', function () {
    setProperties(this.get('token'), {
      typeName: 'invite',
      subtype: 'userJoinGroup',
      tokenTargetProxy: PromiseObject.create({
        promise: reject({ id: 'forbidden' }),
      }),
    });

    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-target-property');
      expect($tokenPropertyRow.find('.token-target').text().trim()).to.equal('Forbidden');
    });
  });

  it('shows info about token target fetch error due to non-standard error', function () {
    const errorId = 'badGRI';
    setProperties(this.get('token'), {
      typeName: 'invite',
      subtype: 'userJoinGroup',
      tokenTargetProxy: PromiseObject.create({
        promise: reject({ id: errorId }),
      }),
    });

    this.render(hbs `{{content-tokens token=token}}`);

    let $tokenPropertyRow;
    return wait()
      .then(() => {
        $tokenPropertyRow = this.$('.token-target-property');
        expect($tokenPropertyRow.find('.resource-load-error')).to.exist;
        return click($tokenPropertyRow.find('.promise-error-show-details')[0]);
      })
      .then(() => {
        expect($tokenPropertyRow.find('.error-json')).to.contain(errorId);
      });
  });

  [
    { subtype: 'userJoinGroup', model: 'group', icon: 'group' },
    { subtype: 'groupJoinGroup', model: 'group', icon: 'group' },
    { subtype: 'userJoinSpace', model: 'space', icon: 'space' },
    { subtype: 'groupJoinSpace', model: 'space', icon: 'space' },
    { subtype: 'supportSpace', model: 'space', icon: 'space' },
    { subtype: 'registerOneprovider', model: 'user', icon: 'user' },
    { subtype: 'userJoinCluster', model: 'cluster', icon: 'cluster' },
    { subtype: 'groupJoinCluster', model: 'cluster', icon: 'cluster' },
    { subtype: 'userJoinHarvester', model: 'harvester', icon: 'light-bulb' },
    { subtype: 'groupJoinHarvester', model: 'harvester', icon: 'light-bulb' },
    { subtype: 'spaceJoinHarvester', model: 'harvester', icon: 'light-bulb' },
  ].forEach(({ subtype, model, icon }) => {
    it(`shows "${icon}" icon in token target for "${subtype}" invite token`, function () {
      setProperties(this.get('token'), {
        typeName: 'invite',
        subtype: 'userJoinGroup',
        tokenTargetProxy: PromiseObject.create({
          promise: resolve({
            constructor: {
              modelName: model,
            },
            name: 'somemodel name',
          }),
        }),
      });
  
      this.render(hbs `{{content-tokens token=token}}`);
  
      return wait().then(() => {
        const $tokenPropertyRow = this.$('.token-target-property');
        expect($tokenPropertyRow.find('.model-icon')).to.have.class('oneicon-' + icon);
      });
    });
  });

  it('shows token string', function () {
    this.render(hbs `{{content-tokens token=token}}`);

    return wait().then(() => {
      const $tokenPropertyRow = this.$('.token-token-property');
      expect($tokenPropertyRow.find('.token-token-label').text().trim()).to.equal('Token:');
      expect($tokenPropertyRow.find('.token-string').text().trim()).to.equal(this.get('token.token'));
    });
  });
});
