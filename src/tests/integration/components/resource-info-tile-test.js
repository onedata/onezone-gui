import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import EmberObject, { get } from '@ember/object';
import { resolve } from 'rsvp';
import { registerService } from '../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';

describe('Integration | Component | resource info tile', function () {
  setupComponentTest('resource-info-tile', {
    integration: true,
  });

  beforeEach(function () {
    const exampleUser = EmberObject.create({
      name: 'user1',
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

  it('renders record info', function () {
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
    this.render(hbs `{{resource-info-tile record=record}}`);
    return wait().then(() => {
      expect(this.$('.resource-name')).to.contain(get(record, 'name'));
      expect(this.$('.id input')).to.have.value(get(record, 'entityId'));
      expect(this.$('.creator .one-icon')).to.have.class('oneicon-user');
      expect(this.$('.creator')).to.contain('user1');
    });
  });
});
