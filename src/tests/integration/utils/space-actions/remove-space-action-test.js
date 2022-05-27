import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RemoveSpaceAction from 'onezone-gui/utils/space-actions/remove-space-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { Promise } from 'rsvp';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../helpers/modal';
import $ from 'jquery';

describe(
  'Integration | Util | space actions/remove space action',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      this.set('context', {
        space: {
          name: 'space1',
          entityId: 'spaceId',
        },
      });
    });

    it('has correct className, icon and title', function () {
      const action = RemoveSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      const {
        className,
        icon,
        title,
      } = getProperties(action, 'className', 'icon', 'title');
      expect(className).to.equal('remove-space-trigger');
      expect(icon).to.equal('remove');
      expect(String(title)).to.equal('Remove');
    });

    it('shows modal on execute', async function () {
      const action = RemoveSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      await render(hbs `{{global-modal-mounter}}`);
      action.execute();

      return wait().then(() => {
        expect($(getModal())).to.have.class('question-modal');
        expect($(getModalHeader()).find('.oneicon-sign-warning-rounded')).to.exist;
        expect($(getModalHeader()).find('h1').text().trim())
          .to.equal('Remove space');
        expect($(getModalBody()).text().trim()).to.contain(
          'You are about to delete the space space1.'
        );
        expect($(getModalBody()).find('.one-checkbox')).to.exist;
        const $yesButton = $(getModalFooter()).find('.question-yes');
        expect($yesButton.text().trim()).to.equal('Remove');
        expect($yesButton).to.have.class('btn-danger');
      });
    });

    it(
      'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        const action = RemoveSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });

        await render(hbs `{{global-modal-mounter}}`);
        const resultPromise = action.execute();

        return wait()
          .then(() => click($(getModalFooter()).find('.question-no')[0]))
          .then(() => resultPromise)
          .then(actionResult =>
            expect(get(actionResult, 'status')).to.equal('cancelled')
          );
      }
    );

    it(
      'executes removing space on submit - success status and notification on success',
      async function () {
        const action = RemoveSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });
        const removeSpaceStub = sinon
          .stub(lookupService(this, 'space-manager'), 'removeSpace')
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
        const actionResultPromise = action.execute();

        return wait()
          .then(() => click($(getModalBody()).find('.one-checkbox')[0]))
          .then(() => click($(getModalFooter()).find('.question-yes')[0]))
          .then(() => actionResultPromise)
          .then(actionResult => {
            expect(removeSpaceStub).to.be.calledOnce;
            expect(removeSpaceStub).to.be.calledWith('spaceId');
            expect(successNotifySpy).to.be.calledWith(sinon.match.has(
              'string',
              'The space has been successfully removed.'
            ));
            expect(get(actionResult, 'status')).to.equal('done');
            expect(redirectToCollectionIfResourceNotExistSpy).to.be.calledOnce;
          });
      }
    );

    it(
      'executes removing space on submit - error status and notification on failure',
      async function () {
        const action = RemoveSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });
        let rejectRemove;
        sinon.stub(lookupService(this, 'space-manager'), 'removeSpace')
          .returns(new Promise((resolve, reject) => rejectRemove = reject));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );

        await render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();

        return wait()
          .then(() => click($(getModalBody()).find('.one-checkbox')[0]))
          .then(() => click($(getModalFooter()).find('.question-yes')[0]))
          .then(() => {
            rejectRemove('someError');
            return wait();
          })
          .then(() => actionResultPromise)
          .then(actionResult => {
            expect(failureNotifySpy).to.be.calledWith(
              sinon.match.has('string', 'removing the space'),
              'someError'
            );
            const {
              status,
              error,
            } = getProperties(actionResult, 'status', 'error');
            expect(status).to.equal('failed');
            expect(error).to.equal('someError');
          });
      }
    );
  }
);
