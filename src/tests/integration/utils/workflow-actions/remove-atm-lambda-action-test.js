import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RemoveAtmLambdaAction from 'onezone-gui/utils/workflow-actions/remove-atm-lambda-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, getProperties } from '@ember/object';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';

describe(
  'Integration | Utility | workflow actions/remove atm lambda action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

    beforeEach(function () {
      const context = {
        atmLambda: {
          name: 'lambda1',
          entityId: 'lambda1Id',
        },
        atmInventory: {
          name: 'inventory1',
          entityId: 'inventory1Id',
        },
      };
      this.setProperties(Object.assign({
        action: RemoveAtmLambdaAction.create({
          ownerSource: this,
          context,
        }),
      }, context));
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('remove-atm-lambda-action-trigger');
      expect(icon).to.equal('x');
      expect(String(title)).to.equal('Remove');
    });

    it('shows modal on execute', async function () {
      this.render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await wait();

      expect(getModal()).to.have.class('question-modal');
      expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
      expect(getModalHeader().find('h1').text().trim()).to.equal('Remove lambda');
      expect(getModalBody().text().trim()).to.contain(
        'You are about to remove the lambda lambda1 from inventory inventory1.'
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
      'executes removing lambda on submit - success status and notification on success',
      async function () {
        const {
          atmLambda,
          atmInventory,
        } = this.getProperties('atmLambda', 'atmInventory');
        const removeRelationStub = sinon
          .stub(lookupService(this, 'record-manager'), 'removeRelation')
          .resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.question-yes')[0]);
        const actionResult = await actionResultPromise;

        expect(removeRelationStub).to.be.calledOnce;
        expect(removeRelationStub).to.be.calledWith(atmInventory, atmLambda);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The lambda has been removed sucessfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it(
      'executes removing lambda on submit - error status and notification on failure',
      async function () {
        let rejectRemove;
        sinon.stub(lookupService(this, 'record-manager'), 'removeRelation')
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
          sinon.match.has('string', 'removing the lambda'),
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
