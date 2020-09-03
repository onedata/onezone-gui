import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import EmberObject from '@ember/object';

describe('Integration | Component | content member record', function () {
  setupComponentTest('member-record', {
    integration: true,
  });

  const mockedUser = EmberObject.create({
    name: 'user_name',
  });

  const mockedUserWithUsername = EmberObject.create({
    name: 'user_name',
    username: 'username',
  });

  it('renders only name for user without username', function () {
    this.set('user', mockedUser);

    this.render(hbs `{{member-record member=user}}`);
    wait().then(() => {
      expect(this.$('.item-name').text().trim())
        .to.equal(this.get('user.name'));
    });
  });

  it('renders name and username for user', function () {
    this.set('user', mockedUserWithUsername);

    this.render(hbs `{{member-record member=user}}`);
    wait().then(() => {
      expect(this.$('.item-name').text().replace(/\s/g, '').trim())
        .to.equal(this.get('user.name') + '(' + this.get('user.username') + ')');
    });
  });
});
