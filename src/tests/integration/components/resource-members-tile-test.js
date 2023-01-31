import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

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

    expect(find('.direct-groups-counter')).to.contain.text('1');
    expect(find('.direct-users-counter')).to.contain.text('2');
    expect(find('.effective-groups-counter')).to.contain.text('3');
    expect(find('.effective-users-counter')).to.contain.text('4');
  });
});
