import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { get } from '@ember/object';

describe('Integration | Component | resource info tile', function() {
  setupComponentTest('resource-info-tile', {
    integration: true,
  });

  it('renders record info', function() {
    const record = EmberObject.create({
      entityId: 'recordId',
      name: 'recordName',
      info: {
        creatorType: 'user',
        creatorName: 'Victor Warren',
        createdAt: 1540163240,
      },
    });
    this.set('record', record);
    this.render(hbs`{{resource-info-tile record=record}}`);
    expect(this.$('.name')).to.contain(get(record, 'name'));
    expect(this.$('.id input')).to.have.value(get(record, 'entityId'));
    expect(this.$('.creator .one-icon')).to.have.class('oneicon-user');
    expect(this.$('.creator')).to.contain(get(record, 'info.creatorName'));
    expect(this.$('.creation-time')).to.contain('22 Oct 2018 1:07:20');
  });
});
