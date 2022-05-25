import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | record name', function () {
  setupRenderingTest();

  it('renders only name for user without username', async function () {
    const mockedUser = EmberObject.create({
      name: 'user_name',
    });
    this.set('user', mockedUser);

    await render(hbs `{{record-name record=user}}`);

    expect(this.$('.record-name').text().trim()).to.equal('user_name');
  });

  it('renders name and username for user', async function () {
    const mockedUserWithUsername = EmberObject.create({
      name: 'user_name',
      username: 'username',
    });
    this.set('user', mockedUserWithUsername);

    await render(hbs `{{record-name record=user}}`);

    expect(this.$('.record-name-general').text().trim()).to.equal('user_name');
    expect(this.$('.record-username').text().trim()).to.equal('(username)');
  });
});
