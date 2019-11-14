import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject, { get, setProperties } from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import _ from 'lodash';
import { resolve, reject } from 'rsvp';
import Service from '@ember/service';
import wait from 'ember-test-helpers/wait';
import $ from 'jquery';
import TestAdapter from '@ember/test/adapter';
import Ember from 'ember';

const userEntityId = 'userEntityId';

function groupGri(gropuNo) {
  return `group.group${gropuNo}EntityId.instance:private`;
}

function membershipGri(groupNo) {
  return `group.group${groupNo}EntityId.eff_user_membership,${userEntityId}:private`;
}

const StoreStub = Service.extend({
  groups: Object.freeze({}),
  memberships: Object.freeze({}),

  findRecord(modelName, id) {
    // Testing edge case when cannot fetch full membership path
    if (id == membershipGri(2)) {
      return reject({ id: 'forbidden' });
    }
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
      gri: groupGri(index),
      entityType: 'group',
      name: `groups${index}`,
    });
    groupsMap[get(group, 'gri')] = group;
    return group;
  });
  groups.forEach((group, index) => {
    const membership = EmberObject.create({
      gri: membershipGri(index),
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

    // Hack: changing default error handling in tests, due to the Ember bug:
    // rejected, not caught promises with some error inside (not empty) marks
    // tests as failed. So e.g. `reject({ id: 'forbidden' })` in store.findRecord,
    // crashes tests even if it's a correct behaviour of findRecord.
    this.originalLoggerError = Ember.Logger.error;
    this.originalTestAdapterException = TestAdapter.exception;
    Ember.Logger.error = function() {};
    Ember.Test.adapter.exception = function() {};
  });

  afterEach(function () {
    Ember.Logger.error = this.originalLoggerError;
    Ember.Test.adapter.exception = this.originalTestAdapterException;
  });

  it('renders all possible paths', function () {
    this.render(hbs `{{membership-visualiser
      contextRecord=user
      targetRecord=groups.[0]}}`);
    return wait().then(() => {
      expect(this.$('.membership')).to.have.length(4);
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

  it('renders all possible paths when visibleBlocks equals 2', function () {
    this.render(hbs `{{membership-visualiser
      contextRecord=user
      visibleBlocks=2
      targetRecord=groups.[0]}}`);
    return wait().then(() => {
      expect(this.$('.membership')).to.have.length(4);
    });
  });
});
