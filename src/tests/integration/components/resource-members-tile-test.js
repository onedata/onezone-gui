import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | resource members tile', function () {
  setupRenderingTest();

  it('renders number of members', async function () {
    this.set('record', EmberObject.create({
      groupList: resolve({ length: 1 }),
      userList: resolve({ length: 2 }),
      effGroupList: resolve({ length: 3 }),
      effUserList: resolve({ length: 4 }),
    }));
    await render(hbs `{{resource-members-tile record=record}}`);
    return wait().then(() => {
      expect(this.$('.direct-groups-counter').text()).to.contain('1');
      expect(this.$('.direct-users-counter').text()).to.contain('2');
      expect(this.$('.effective-groups-counter').text()).to.contain('3');
      expect(this.$('.effective-users-counter').text()).to.contain('4');
    });
  });
});
