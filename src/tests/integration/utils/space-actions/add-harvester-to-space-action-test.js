import { expect } from 'chai';
import { describe, context, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
import { get, getProperties } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { reject } from 'rsvp';
import { getModal, getModalHeader, getModalBody, getModalFooter } from '../../../helpers/modal';
import suppressRejections from '../../../helpers/suppress-rejections';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve } from 'rsvp';
import EmberPowerSelectHelper from '../../../helpers/ember-power-select-helper';

describe(
  'Integration | Util | space actions/add harvester to space action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

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
        ownerSource: this,
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

    it('shows modal with a list of harvesters on execute', function () {
      const action = AddHarvesterToSpaceAction.create({
        ownerSource: this,
        context: this.get('context'),
      });

      this.render(hbs `{{global-modal-mounter}}`);
      action.execute();

      const dropdownHelper = new RecordHelper();
      return wait()
        .then(() => {
          expect(getModal()).to.have.class('record-selector-modal');
          expect(getModalHeader().find('h1').text().trim())
            .to.equal('Add one of your harvesters');
          expect(getModalBody().find('p').text().trim()).to.equal(
            'Choose harvester which should consume metadata from space "space1":'
          );
          expect(getModalFooter().find('.record-selector-submit').text().trim())
            .to.equal('Add');
          return dropdownHelper.open();
        })
        .then(() => {
          expect(dropdownHelper.getNthOption(1).innerText.trim()).to.equal('harvester1');
          expect(dropdownHelper.getNthOption(1).querySelector('.oneicon-light-bulb'))
            .to.exist;
          expect(dropdownHelper.getNthOption(2)).to.not.exist;
        });
    });

    it(
      'executes adding harvester to space on submit (success scenario)',
      function () {
        const action = AddHarvesterToSpaceAction.create({
          ownerSource: this,
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

        this.render(hbs `{{global-modal-mounter}}`);
        const actionResultPromise = action.execute();

        const dropdownHelper = new RecordHelper();
        return wait()
          .then(() => dropdownHelper.selectOption(1))
          .then(() => click(getModalFooter().find('.record-selector-submit')[0]))
          .then(() => actionResultPromise)
          .then(actionResult => {
            expect(addHarvesterStub).to.be.calledOnce;
            expect(addHarvesterStub).to.be.calledWith('harvesterId', 'spaceId');
            expect(successNotifySpy).to.be.calledWith(sinon.match.has(
              'string',
              'The harvester has been sucessfully added to the space.'
            ));
            expect(get(actionResult, 'status')).to.equal('done');
          });
      }
    );

    context('handles errors', function () {
      suppressRejections();

      it(
        'executes adding harvester to space tokens on submit (failure scenario)',
        function () {
          const action = AddHarvesterToSpaceAction.create({
            ownerSource: this,
            context: this.get('context'),
          });
          const harvesterManager = lookupService(this, 'harvester-manager');
          sinon.stub(harvesterManager, 'addSpaceToHarvester')
            .returns(reject('someError'));
          const failureNotifySpy = sinon.spy(
            lookupService(this, 'global-notify'),
            'backendError'
          );

          this.render(hbs `{{global-modal-mounter}}`);
          const actionResultPromise = action.execute();

          const dropdownHelper = new RecordHelper();
          return wait()
            .then(() => dropdownHelper.selectOption(1))
            .then(() => click(getModalFooter().find('.record-selector-submit')[0]))
            .then(() => actionResultPromise)
            .then(actionResult => {
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
            });
        }
      );
    });
  }
);

class RecordHelper extends EmberPowerSelectHelper {
  constructor() {
    super('.modal-content', 'body .ember-basic-dropdown-content');
  }
}
