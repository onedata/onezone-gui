import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
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
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';

describe(
  'Integration | Utility | space actions/add harvester to space action',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const recordManager = lookupService(this, 'record-manager');
      const harvesters = [{
        entityId: 'harvesterId',
        name: 'harvester1',
        constructor: {
          modelName: 'harvester',
        },
      }];
      sinon.stub(recordManager, 'getUserRecordList')
        .withArgs('harvester')
        .resolves({
          list: promiseArray(resolve(harvesters)),
        });
      this.set('context', {
        space: {
          name: 'space1',
          entityId: 'spaceId',
        },
      });
    });

    it('has correct className, icon and title', function () {
      const action = AddHarvesterToSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      const {
        className,
        icon,
        title,
      } = getProperties(action, 'className', 'icon', 'title');
      expect(className).to.equal('add-harvester-to-space-trigger');
      expect(icon).to.equal('plus');
      expect(String(title)).to.equal('Add one of your harvesters');
    });

    it('shows modal with a list of harvesters on execute', async function () {
      const action = AddHarvesterToSpaceAction.create({
        ownerSource: this.owner,
        context: this.get('context'),
      });

      await render(hbs `{{global-modal-mounter}}`);
      action.execute();
      await settled();

      const dropdownHelper = new RecordHelper();
      expect(getModal()).to.have.class('record-selector-modal');
      expect(getModalHeader().querySelector('h1'))
        .to.have.trimmed.text('Add one of your harvesters');
      expect(getModalBody().querySelector('p')).to.have.trimmed.text(
        'Choose harvester which should consume metadata from space "space1":'
      );
      expect(getModalFooter().querySelector('.record-selector-submit'))
        .to.have.trimmed.text('Add');
      await dropdownHelper.open();
      expect(dropdownHelper.getNthOption(1)).to.have.trimmed.text('harvester1');
      expect(dropdownHelper.getNthOption(1).querySelector('.oneicon-light-bulb'))
        .to.exist;
      expect(dropdownHelper.getNthOption(2)).to.not.exist;
    });

    it(
      'executes adding harvester to space on submit (success scenario)',
      async function () {
        const action = AddHarvesterToSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });
        const harvesterManager = lookupService(this, 'harvester-manager');
        const addHarvesterStub = sinon
          .stub(harvesterManager, 'addSpaceToHarvester')
          .resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );

        await render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();
        await settled();

        const dropdownHelper = new RecordHelper();
        await dropdownHelper.selectOption(1);
        await click(getModalFooter().querySelector('.record-selector-submit'));
        const actionResult = await actionResultPromise;
        expect(addHarvesterStub).to.be.calledOnce;
        expect(addHarvesterStub).to.be.calledWith('harvesterId', 'spaceId');
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The harvester has been successfully added to the space.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it(
      'executes adding harvester to space tokens on submit (failure scenario)',
      async function () {
        suppressRejections();
        const action = AddHarvesterToSpaceAction.create({
          ownerSource: this.owner,
          context: this.get('context'),
        });
        const harvesterManager = lookupService(this, 'harvester-manager');
        sinon.stub(harvesterManager, 'addSpaceToHarvester')
          .returns(reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );

        await render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();
        await settled();

        const dropdownHelper = new RecordHelper();
        await dropdownHelper.selectOption(1);
        await click(getModalFooter().querySelector('.record-selector-submit'));
        const actionResult = await actionResultPromise;
        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'adding the harvester to the space'),
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

class RecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.modal-content', 'body .ember-basic-dropdown-content');
  }
}
