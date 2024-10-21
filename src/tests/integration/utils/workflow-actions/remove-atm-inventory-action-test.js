import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { Promise } from 'rsvp';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';

describe(
  'Integration | Utility | workflow-actions/remove-atm-inventory-action',
  function () {
    const { afterEach } = setupRenderingTest();

    beforeEach(function () {
      const context = {
        atmInventory: {
          name: 'inventory1',
          entityId: 'inventoryId',
        },
      };
      this.setProperties({
        action: RemoveAtmInventoryAction.create({
          ownerSource: this.owner,
          context,
        }),
        atmInventory: context.atmInventory,
      });
    });

    afterEach(function () {
      this.action?.destroy();
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('remove-atm-inventory-action-trigger');
      expect(icon).to.equal('browser-delete');
      expect(String(title)).to.equal('Remove');
    });

    it('shows modal on execute', async function () {
      await render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await settled();

      expect(getModal()).to.have.class('question-modal');
      expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
      expect(getModalHeader().querySelector('h1'))
        .to.have.trimmed.text('Remove automation inventory');
      expect(getModalBody()).to.contain.text(
        'You are about to delete the automation inventory inventory1.'
      );
      const yesButton = getModalFooter().querySelector('.question-yes');
      expect(yesButton).to.have.trimmed.text('Remove');
      expect(yesButton).to.have.class('btn-danger');
    });

    it(
      'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        await render(hbs `{{global-modal-mounter}}`);

        const resultPromise = this.get('action').execute();
        await settled();
        await click(getModalFooter().querySelector('.question-no'));
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
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = this.get('action').execute();
        await settled();
        await click(getModalFooter().querySelector('.question-yes'));
        const actionResult = await actionResultPromise;

        expect(removeRecordStub).to.be.calledOnce;
        expect(removeRecordStub).to.be.calledWith(this.get('atmInventory'));
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The automation inventory has been successfully removed.'
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
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = this.get('action').execute();
        await settled();
        await click(getModalFooter().querySelector('.question-yes'));
        rejectRemove('someError');
        await settled();
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
