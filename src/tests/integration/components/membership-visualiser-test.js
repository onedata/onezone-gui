import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { get, setProperties } from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import _ from 'lodash';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';

const userEntityId = 'userEntityId';

const StoreStub = Service.extend({
  groups: Object.freeze({}),
  memberships: Object.freeze({}),

  findRecord(modelName, id) {
    return resolve(this.peekRecord(modelName, id));
  },

  peekRecord(modelName, id) {
    switch (modelName) {
      case 'group':
        return this.get('groups')[id];
      case 'membership':
        return this.get('memberships')[id];
    }
  },
});

function generateNGroups(context, n) {
  const store = lookupService(context, 'store');
  const groupsMap = {};
  const membershipsMap = {};
  const groups = _.times(n, index => {
    const group = EmberObject.create({
      gri: `group.group${index}EntityId.instance:private`,
      entityType: 'group',
      name: `groups${index}`,
    });
    groupsMap[get(group, 'gri')] = group;
    return group;
  });
  groups.forEach((group, index) => {
    const membership = EmberObject.create({
      gri: `group.group${index}EntityId.eff_user_membership,${userEntityId}:private`,
      directMembership: true,
      intermediaries: groups.filter(g => g !== group).mapBy('gri'),
    });
    membershipsMap[get(membership, 'gri')] = membership;
  });
  setProperties(store, {
    groups: groupsMap,
    memberships: membershipsMap,
  });
  context.setProperties({
    groups,
  });
}

describe('Integration | Component | membership visualiser', function () {
  setupComponentTest('membership-visualiser', {
    integration: true,
  });

  beforeEach(function () {
    registerService(this, 'store', StoreStub);
    const user = EmberObject.create({
      gri: `user.${userEntityId}.instance:private`,
      entityType: 'user',
      entityId: userEntityId,
      name: 'user1',
    });
    generateNGroups(this, 3);
    this.set('user', user);
  });

  it('renders all possible paths', function () {
    this.render(hbs `{{membership-visualiser
      contextRecord=user
      targetRecord=groups.[0]}}`);
    return wait().then(() => {
      expect(this.$('.membership')).to.have.length(5);
    });
  });

  it('renders limited number of possible paths and limit info message', function () {
    this.render(hbs `{{membership-visualiser
      maxPathsNumber=3
      contextRecord=user
      targetRecord=groups.[0]}}`);
    return wait().then(() => {
      expect(this.$('.membership')).to.have.length(3);
      expect(this.$('.limit-info')).to.exist;
    });
  });

  it('renders paths in growing-length order', function () {
    this.render(hbs `{{membership-visualiser
      contextRecord=user
      targetRecord=groups.[0]}}`);
    return wait().then(() => {
      let prevBlocksNumber = 2;
      this.$('.membership').each(function () {
        const blocksNumber = $(this).find('.membership-block').length;
        expect(blocksNumber).to.be.gte(prevBlocksNumber);
        prevBlocksNumber = blocksNumber;
      });
    });
  });
});
