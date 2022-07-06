import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { lookupService } from '../../../helpers/stub-service';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
  isModalOpened,
} from '../../../helpers/modal';
import sinon from 'sinon';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get } from '@ember/object';

describe('Integration | Component | modals/generate invite token modal', function () {
  setupRenderingTest();

  beforeEach(function () {
    sinon.stub(lookupService(this, 'token-manager'), 'createTemporaryInviteToken')
      .resolves('token');
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns(null);
    sinon.stub(lookupService(this, 'record-manager'), 'getCurrentUserRecord')
      .returns({});
    this.setProperties({
      modalManager: lookupService(this, 'modal-manager'),
      modalOptions: {
        inviteType: 'userJoinGroup',
        targetRecord: {
          entityId: 'group1',
        },
      },
    });
  });

  it(
    'renders modal with class "generate-invite-token-modal", generator in body and cancel button in footer',
    function () {
      return showModal(this)
        .then(() => {
          const modal = getModal();
          const modalBody = getModalBody();
          const modalFooter = getModalFooter();
          expect(modal).to.have.class('generate-invite-token-modal');
          expect(modalBody.querySelector('.invite-token-generator')).to.exist;
          expect(modalFooter.querySelector('.modal-close')).to.have.trimmed.text('Close');
        });
    }
  );

  const userHeader = 'Invite user using token';
  const groupHeader = 'Invite group using token';
  const spaceHeader = 'Invite space using token';
  const harvesterHeader = 'Invite harvester using token';
  [{
    inviteType: 'userJoinGroup',
    header: userHeader,
  }, {
    inviteType: 'groupJoinGroup',
    header: groupHeader,
  }, {
    inviteType: 'userJoinSpace',
    header: userHeader,
  }, {
    inviteType: 'groupJoinSpace',
    header: groupHeader,
  }, {
    inviteType: 'harvesterJoinSpace',
    header: harvesterHeader,
  }, {
    inviteType: 'userJoinCluster',
    header: userHeader,
  }, {
    inviteType: 'groupJoinCluster',
    header: groupHeader,
  }, {
    inviteType: 'userJoinHarvester',
    header: userHeader,
  }, {
    inviteType: 'groupJoinHarvester',
    header: groupHeader,
  }, {
    inviteType: 'spaceJoinHarvester',
    header: spaceHeader,
  }, {
    inviteType: 'userJoinAtmInventory',
    header: userHeader,
  }, {
    inviteType: 'groupJoinAtmInventory',
    header: groupHeader,
  }].forEach(({ inviteType, header }) => {
    it(
      `shows correct header for ${inviteType} invite type`,
      function () {
        this.set('modalOptions.inviteType', inviteType);

        return showModal(this)
          .then(() =>
            expect(getModalHeader().querySelector('h1'))
            .to.have.trimmed.text(header)
          );
      }
    );
  });

  it(
    'closes modal on cancel click',
    function () {
      return showModal(this)
        .then(() => click(getModalFooter().querySelector('.modal-close')))
        .then(() => expect(isModalOpened()).to.be.false);
    }
  );

  it(
    'passes inviteType and targetRecord to invite-token-generator',
    function () {
      this.set('modalOptions.inviteType', 'userJoinSpace');
      this.set('modalOptions.targetRecord', {
        entityId: 'sth',
      });
      this.owner.register('component:invite-token-generator', TestComponent);

      return showModal(this)
        .then(() => {
          const testComponent =
            getModalBody().querySelector('.test-component').componentInstance;
          expect(get(testComponent, 'inviteType')).to.equal('userJoinSpace');
          expect(get(testComponent, 'targetRecord.entityId')).to.equal('sth');
        });
    }
  );

  it(
    'closes modal on "custom token" click',
    function () {
      return showModal(this)
        .then(() => click(getModalBody().querySelector('.custom-token-action')))
        .then(() => expect(isModalOpened()).to.be.false);
    }
  );
});

async function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  await render(hbs `{{global-modal-mounter}}`);

  await modalManager
    .show('generate-invite-token-modal', modalOptions).shownPromise;
}
