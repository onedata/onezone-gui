import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
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
import { click } from 'ember-native-dom-helpers';
import TestComponent from 'onedata-gui-common/components/test-component';
import { get } from '@ember/object';

describe('Integration | Component | modals/generate invite token modal', function () {
  setupComponentTest('modals/generate-invite-token-modal', {
    integration: true,
  });

  beforeEach(function () {
    sinon.stub(lookupService(this, 'token-manager'), 'createTemporaryInviteToken')
      .resolves('token');
    sinon.stub(lookupService(this, 'router'), 'urlFor').returns('');
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
    'renders modal with class "clean-obsolete-tokens-modal", generator in body and cancel button in footer',
    function () {
      return showModal(this)
        .then(() => {
          const $modal = getModal();
          const $modalBody = getModalBody();
          const $modalFooter = getModalFooter();
          expect($modal).to.have.class('generate-invite-token-modal');
          expect($modalBody.find('.invite-token-generator')).to.exist;
          expect($modalFooter.find('.modal-cancel').text().trim()).to.equal('Cancel');
        });
    }
  );

  const userHeader = 'Invite user using token';
  const groupHeader = 'Invite group using token';
  const spaceHeader = 'Invite space using token';
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
  }].forEach(({ inviteType, header }) => {
    it(
      `shows correct header for ${inviteType} invite type`,
      function () {
        this.set('modalOptions.inviteType', inviteType);

        return showModal(this)
          .then(() => expect(getModalHeader().find('h1').text().trim()).to.equal(header));
      }
    );
  });

  it(
    'closes modal on cancel click',
    function () {
      return showModal(this)
        .then(() => click(getModalFooter().find('.modal-cancel')[0]))
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
      this.register('component:invite-token-generator', TestComponent);

      return showModal(this)
        .then(() => {
          const testComponent =
            getModalBody().find('.test-component')[0].componentInstance;
          expect(get(testComponent, 'inviteType')).to.equal('userJoinSpace');
          expect(get(testComponent, 'targetRecord.entityId')).to.equal('sth');
        });
    }
  );
});

function showModal(testCase) {
  const {
    modalManager,
    modalOptions,
  } = testCase.getProperties('modalManager', 'modalOptions');

  testCase.render(hbs `{{global-modal-mounter}}`);

  return modalManager
    .show('generate-invite-token-modal', modalOptions).shownPromise;
}
