import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject } from 'rsvp';
import {
  getModal,
  getModalHeader,
  getModalBody,
  getModalFooter,
} from '../../../helpers/modal';
import { suppressRejections } from '../../../helpers/suppress-rejections';

describe(
  'Integration | Utility | space-actions/remove-harvester-from-space-action',
  function () {
    const { afterEach } = setupRenderingTest();

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

    afterEach(function () {
      this.action?.destroy();
    });

    it('has correct className, icon and title', function () {
      this.action = RemoveHarvesterFromSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      const {
        className,
        icon,
        title,
      } = getProperties(this.action, 'className', 'icon', 'title');
      expect(className).to.equal('remove-harvester-from-space-trigger');
      expect(icon).to.equal('close');
      expect(String(title)).to.equal('Remove this harvester');
    });

    it('shows modal on execute', async function () {
      this.action = RemoveHarvesterFromSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      await render(hbs `{{global-modal-mounter}}`);
      this.action.execute();
      await settled();

      expect(getModal()).to.have.class('question-modal');
      expect(getModalHeader().querySelector('.oneicon-sign-warning-rounded')).to.exist;
      expect(getModalHeader().querySelector('h1'))
        .to.have.trimmed.text('Remove harvester from space');
      expect(getModalBody()).to.have.trimmed.text(
        'Are you sure you want to remove harvester "harvester1" from space "space1"?'
      );
      const yesButton = getModalFooter().querySelector('.question-yes');
      expect(yesButton).to.have.trimmed.text('Remove');
      expect(yesButton).to.have.class('btn-danger');
    });

    it(
      'returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        this.action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });

        await render(hbs `{{global-modal-mounter}}`);
        const resultPromise = this.action.execute();
        await settled();

        await click(getModalFooter().querySelector('.question-no'));
        const actionResult = await resultPromise;
        expect(get(actionResult, 'status')).to.equal('cancelled');
      }
    );

    it(
      'executes removing harvester from space on submit (success scenario)',
      async function () {
        this.action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this.owner,
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

        await render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = this.action.execute();
        await settled();

        await click(getModalFooter().querySelector('.question-yes'));
        const actionResult = await actionResultPromise;
        expect(removeHarvesterStub).to.be.calledOnce;
        expect(removeHarvesterStub).to.be.calledWith('harvesterId', 'spaceId');
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The harvester has been successfully removed from the space.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it(
      'executes removing harvester from space on submit (failure scenario)',
      async function () {
        suppressRejections();
        this.action = RemoveHarvesterFromSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });
        const harvesterManager = lookupService(this, 'harvester-manager');
        sinon.stub(harvesterManager, 'removeSpaceFromHarvester')
          .returns(reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );

        await render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = this.action.execute();
        await settled();

        await click(getModalFooter().querySelector('.question-yes'));
        const actionResult = await actionResultPromise;
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
      }
    );
  }
);
