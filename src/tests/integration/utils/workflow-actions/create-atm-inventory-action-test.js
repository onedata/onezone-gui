import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import { get } from '@ember/object';
import sinon from 'sinon';
import { lookupService } from '../../../helpers/stub-service';
import { reject, Promise } from 'rsvp';
import { next } from '@ember/runloop';

describe('Integration | Utility | workflow actions/create atm inventory action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

    beforeEach(function () {
      this.set('context', {
        rawAtmInventory: { name: 'inventory1' },
      });
    });

    it('executes creating automation inventory (success scenario)', function () {
      const action = CreateAtmInventoryAction.create({
        ownerSource: this,
        context: this.get('context'),
      });
      const workflowManager = lookupService(this, 'workflow-manager');
      const router = lookupService(this, 'router');
      const rawAtmInventory = this.get('context.rawAtmInventory');
      const createdAtmInventory = {
        id: 'atm_inventory.newAtmId.instance:private',
      };
      const createAtmInventoryStub = sinon
        .stub(workflowManager, 'createAtmInventory')
        .withArgs(rawAtmInventory)
        .resolves(createdAtmInventory);
      const transitionToStub = sinon.stub(router, 'transitionTo')
        .resolves();
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return action.execute()
        .then(actionResult => {
          expect(createAtmInventoryStub).to.be.calledOnce;
          expect(createAtmInventoryStub).to.be.calledWith(rawAtmInventory);
          expect(successNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'Automation inventory has been created successfully.')
          );
          expect(get(actionResult, 'status')).to.equal('done');
          expect(get(actionResult, 'result')).to.equal(createdAtmInventory);
          return new Promise(resolve => next(resolve));
        })
        .then(() => expect(transitionToStub).to.be.calledWith(
          'onedata.sidebar.content',
          'atm-inventories',
          'newAtmId'
        ));
    });

    it('executes creating automation inventory (failure scenario)', function () {
      const action = CreateAtmInventoryAction.create({
        ownerSource: this,
        context: this.get('context'),
      });
      const workflowManager = lookupService(this, 'workflow-manager');
      sinon
        .stub(workflowManager, 'createAtmInventory')
        .returns(reject('error'));
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return action.execute()
        .then(actionResult => {
          expect(failureNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'creating automation inventory'),
            'error'
          );
          expect(get(actionResult, 'status')).to.equal('failed');
          expect(get(actionResult, 'error')).to.equal('error');
        });
    });
  });
