import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, find, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject, { get, setProperties } from '@ember/object';
import { registerService, lookupService } from '../../helpers/stub-service';
import _ from 'lodash';
import { resolve, reject } from 'rsvp';
import Service from '@ember/service';
import { suppressRejections } from '../../helpers/suppress-rejections';

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
      name: `groups${index}`,
      entityType: 'group',
      constructor: {
        modelName: 'group',
      },
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
  setupRenderingTest();

  beforeEach(function () {
    registerService(this, 'store', StoreStub);
    const user = EmberObject.create({
      gri: `user.${userEntityId}.instance:private`,
      entityType: 'user',
      entityId: userEntityId,
      name: 'user1',
      constructor: {
        modelName: 'user',
      },
    });
    generateNGroups(this, 3);
    this.set('user', user);
    suppressRejections();
  });

  it('renders all possible paths', async function () {
    await render(hbs `{{membership-visualiser
      contextRecord=user
      targetRecord=groups.[0]}}`);

    expect(findAll('.membership')).to.have.length(4);
  });

  it('renders limited number of possible paths and limit info message', async function () {
    await render(hbs `{{membership-visualiser
      maxPathsNumber=3
      contextRecord=user
      targetRecord=groups.[0]}}`);

    expect(findAll('.membership')).to.have.length(3);
    expect(find('.limit-info')).to.exist;
  });

  it('renders paths in growing-length order', async function () {
    await render(hbs `{{membership-visualiser
      contextRecord=user
      targetRecord=groups.[0]}}`);

    let prevBlocksNumber = 2;
    findAll('.membership').forEach((membership) => {
      const blocksNumber = membership.querySelectorAll('.membership-block').length;
      expect(blocksNumber).to.be.gte(prevBlocksNumber);
      prevBlocksNumber = blocksNumber;
    });
  });

  it('renders all possible paths when visibleBlocks equals 2', async function () {
    await render(hbs `{{membership-visualiser
      contextRecord=user
      visibleBlocks=2
      targetRecord=groups.[0]}}`);

    expect(findAll('.membership')).to.have.length(4);
  });
});
