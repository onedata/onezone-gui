import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../helpers/modal';

describe(
  'Integration | Utility | workflow actions/remove atm inventory action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

    beforeEach(function () {
      const context = {
        atmInventory: {
          name: 'inventory1',
          entityId: 'inventoryId',
        },
      };
      this.setProperties({
        action: RemoveAtmInventoryAction.create({
          ownerSource: this,
          context,
        }),
        atmInventory: context.atmInventory,
      });
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('remove-atm-inventory-action-trigger');
      expect(icon).to.equal('remove');
      expect(String(title)).to.equal('Remove');
    });

    it('shows modal on execute', async function () {
      this.render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await wait();

      expect(getModal()).to.have.class('question-modal');
      expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
      expect(getModalHeader().find('h1').text().trim())
        .to.equal('Remove automation inventory');
      expect(getModalBody().text().trim()).to.contain(
        'You are about to delete the automation inventory inventory1.'
      );
      const $yesButton = getModalFooter().find('.question-yes');
      expect($yesButton.text().trim()).to.equal('Remove');
      expect($yesButton).to.have.class('btn-danger');
    });

    it(
      'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        this.render(hbs `{{global-modal-mounter}}`);

        const resultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.question-no')[0]);
        const actionResult = await resultPromise;

        expect(get(actionResult, 'status')).to.equal('cancelled');
      }
    );

    it(
      'executes removing automation inventory on submit - success status and notification on success',
      async function () {
        const removeRecordStub = sinon
          .stub(lookupService(this, 'record-manager'), 'removeRecord')
          .resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        const redirectToCollectionIfResourceNotExistSpy = sinon.spy(
          lookupService(this, 'navigation-state'),
          'redirectToCollectionIfResourceNotExist'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.question-yes')[0]);
        const actionResult = await actionResultPromise;

        expect(removeRecordStub).to.be.calledOnce;
        expect(removeRecordStub).to.be.calledWith(this.get('atmInventory'));
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The automation inventory has been sucessfully removed.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
        expect(redirectToCollectionIfResourceNotExistSpy).to.be.calledOnce;
      }
    );

    it(
      'executes removing automation inventory on submit - error status and notification on failure',
      async function () {
        let rejectRemove;
        sinon.stub(lookupService(this, 'record-manager'), 'removeRecord')
          .returns(new Promise((resolve, reject) => rejectRemove = reject));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.question-yes')[0]);
        rejectRemove('someError');
        await wait();
        const actionResult = await actionResultPromise;

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'removing the automation inventory'),
          'someError'
        );
        const {
          status,
          error,
        } = getProperties(actionResult, 'status', 'error');
        expect(status).to.equal('failed');
        expect(error).to.equal('someError');
      }
    );
  }
);
