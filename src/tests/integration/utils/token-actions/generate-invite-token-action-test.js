import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import GenerateInviteTokenAction from 'onezone-gui/utils/token-actions/generate-invite-token-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import TestComponent from 'onedata-gui-common/components/test-component';

describe('Integration | Utility | token actions/generate invite token action', function () {
  setupRenderingTest();

  beforeEach(function () {
    sinon.stub(lookupService(this, 'token-manager'), 'createTemporaryInviteToken')
      .resolves('token');
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('');
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserRecord')
      .returns({});
    this.setProperties({
      context: {
        inviteType: 'userJoinGroup',
        targetRecord: {
          entityId: 'sth',
        },
      },
    });
  });

  const userTitle = 'Invite user using token';
  const groupTitle = 'Invite group using token';
  const spaceTitle = 'Invite space using token';
  const harvesterTitle = 'Invite harvester using token';
  [{
    inviteType: 'userJoinGroup',
    title: userTitle,
  }, {
    inviteType: 'groupJoinGroup',
    title: groupTitle,
  }, {
    inviteType: 'userJoinSpace',
    title: userTitle,
  }, {
    inviteType: 'groupJoinSpace',
    title: groupTitle,
  }, {
    inviteType: 'harvesterJoinSpace',
    title: harvesterTitle,
  }, {
    inviteType: 'userJoinCluster',
    title: userTitle,
  }, {
    inviteType: 'groupJoinCluster',
    title: groupTitle,
  }, {
    inviteType: 'userJoinHarvester',
    title: userTitle,
  }, {
    inviteType: 'groupJoinHarvester',
    title: groupTitle,
  }, {
    inviteType: 'spaceJoinHarvester',
    title: spaceTitle,
  }, {
    inviteType: 'userJoinAtmInventory',
    title: userTitle,
  }, {
    inviteType: 'groupJoinAtmInventory',
    title: groupTitle,
  }].forEach(({ inviteType, title }) => {
    it(
      `has correct title for ${inviteType} invite type`,
      function () {
        this.set('context.inviteType', inviteType);
        const action = GenerateInviteTokenAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });

        expect(String(get(action, 'title'))).to.equal(title);
      }
    );
  });

  it(
    'has correct classNames, icon and is enabled',
    function () {
      const action = GenerateInviteTokenAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      expect(get(action, 'className')).to.equal('generate-invite-token-action');
      expect(get(action, 'icon')).to.equal('join-plug');
      expect(get(action, 'disabled')).to.be.false;
    }
  );

  [
    'inviteType',
    'targetRecord',
  ].forEach(fieldName => {
    it(
      `is disabled when ${fieldName} is not specified`,
      function () {
        this.set(`context.${fieldName}`, undefined);
        const action = GenerateInviteTokenAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });

        expect(get(action, 'disabled')).to.be.true;
      }
    );
  });

  it('shows modal on execute', async function () {
    const action = GenerateInviteTokenAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
    await settled();

    expect(getModal()).to.have.class('generate-invite-token-modal');
  });

  it('passess inviteType and tokenTarget to the modal', async function () {
    this.owner.register('component:invite-token-generator', TestComponent);
    const action = GenerateInviteTokenAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });

    await render(hbs `{{global-modal-mounter}}`);
    action.execute();
    await settled();

    const testComponent =
      getModalBody().querySelector('.test-component').componentInstance;
    expect(get(testComponent, 'inviteType')).to.equal('userJoinGroup');
    expect(get(testComponent, 'targetRecord.entityId')).to.equal('sth');
  });

  it('resolves returned promise when modal has been closed', async function () {
    const action = GenerateInviteTokenAction.create({
      ownerSource: this.owner,
      context: this.get('context'),
    });
    let promiseIsResolved = false;

    await render(hbs `{{global-modal-mounter}}`);
    action.execute().then(() => promiseIsResolved = true);

    await settled();
    expect(promiseIsResolved).to.be.false;
    await click(getModalFooter().querySelector('.modal-close'));
    expect(promiseIsResolved).to.be.true;
  });
});
