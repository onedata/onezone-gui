import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { reject } from 'rsvp';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../helpers/modal';
import suppressRejections from '../../../helpers/suppress-rejections';

describe(
  'Integration | Util | space actions/remove harvester from space action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

    suppressRejections();

    beforeEach(function () {
      this.set('context', {
        space: {
          name: 'space1',
          entityId: 'spaceId',
        },
        harvester: {
          name: 'harvester1',
          entityId: 'harvesterId',
        },
      });
    });

    it('has correct className, icon and title', function () {
      const action = RemoveHarvesterFromSpaceAction.create({
        ownerSource: this,
        context: this.get('context'),
      });

      const {
        className,
        icon,
        title,
      } = getProperties(action, 'className', 'icon', 'title');
      expect(className).to.equal('remove-harvester-from-space-trigger');
      expect(icon).to.equal('close');
      expect(String(title)).to.equal('Remove this harvester');
    });

    it('shows modal on execute', function () {
      const action = RemoveHarvesterFromSpaceAction.create({
        ownerSource: this,
        context: this.get('context'),
      });

      this.render(hbs `{{global-modal-mounter}}`);
      action.execute();

      return wait().then(() => {
        expect(getModal()).to.have.class('question-modal');
        expect(getModalHeader().find('.oneicon-sign-warning-rounded')).to.exist;
        expect(getModalHeader().find('h1').text().trim())
          .to.equal('Remove harvester from space');
        expect(getModalBody().text().trim()).to.equal(
          'Are you sure you want to remove harvester "harvester1" from space "space1"?'
        );
        const $yesButton = getModalFooter().find('.question-yes');
        expect($yesButton.text().trim()).to.equal('Remove');
        expect($yesButton).to.have.class('btn-danger');
      });
    });

    it(
      'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      function () {
        const action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this,
          context: this.get('context'),
        });

        this.render(hbs `{{global-modal-mounter}}`);
        const resultPromise = action.execute();

        return wait()
          .then(() => click(getModalFooter().find('.question-no')[0]))
          .then(() => resultPromise)
          .then(actionResult =>
            expect(get(actionResult, 'status')).to.equal('cancelled')
          );
      }
    );

    it(
      'executes removing harvester from space tokens on submit (success scenario)',
      function () {
        const action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this,
          context: this.get('context'),
        });
        const harvesterManager = lookupService(this, 'harvester-manager');
        const removeHarvesterStub = sinon
          .stub(harvesterManager, 'removeSpaceFromHarvester')
          .resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );

        this.render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();

        return wait()
          .then(() => click(getModalFooter().find('.question-yes')[0]))
          .then(() => actionResultPromise)
          .then(actionResult => {
            expect(removeHarvesterStub).to.be.calledOnce;
            expect(removeHarvesterStub).to.be.calledWith('harvesterId', 'spaceId');
            expect(successNotifySpy).to.be.calledWith(sinon.match.has(
              'string',
              'The harvester has been sucessfully removed from the space.'
            ));
            expect(get(actionResult, 'status')).to.equal('done');
          });
      }
    );

    it(
      'executes removing harvester from space tokens on submit (failure scenario)',
      function () {
        const action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this,
          context: this.get('context'),
        });
        const harvesterManager = lookupService(this, 'harvester-manager');
        sinon.stub(harvesterManager, 'removeSpaceFromHarvester')
          .returns(reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );

        this.render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();

        return wait()
          .then(() => click(getModalFooter().find('.question-yes')[0]))
          .then(() => actionResultPromise)
          .then(actionResult => {
            expect(failureNotifySpy).to.be.calledWith(
              sinon.match.has('string', 'removing the harvester from the space'),
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
  });
