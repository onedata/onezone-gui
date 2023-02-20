import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import EmberObject, { get } from '@ember/object';
import { resolve } from 'rsvp';
import { registerService } from '../../helpers/stub-service';

describe('Integration | Component | resource info tile', function () {
  setupRenderingTest();

  beforeEach(function () {
    const exampleUser = EmberObject.create({
      name: 'user1',
      fullName: 'user1_fullname',
      username: 'user1_username',
      entityId: 'user1_id',
      constructor: {
        modelName: 'user',
      },
    });

    const storeStub = Service.extend({
      findRecord(modelType, id) {
        if (id === 'user.abc.instance:shared') {
          return resolve(exampleUser);
        }
      },
    });
    registerService(this, 'store', storeStub);
  });

  it('renders record info', async function () {
    const record = EmberObject.create({
      entityId: 'recordId',
      name: 'recordName',
      info: {
        creatorType: 'user',
        creatorId: 'abc',
        creationTime: 1540163240,
      },
    });
    this.set('record', record);
    await render(hbs `{{resource-info-tile record=record}}`);

    expect(find('.resource-name')).to.contain.text(get(record, 'name'));
    expect(find('.id input')).to.have.value(get(record, 'entityId'));
    expect(find('.record-with-icon .flippable-front.one-icon')).to.have.class('oneicon-user');
    expect(find('.user-fullname')).to.contain.text('user1_fullname');
    expect(find('.user-username')).to.contain.text('user1_username');
  });
});
