import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import sinon from 'sinon';
import { resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get } from '@ember/object';

describe(
  'Integration | Utility | workflow-actions/modify-atm-inventory-action',
  function () {
    setupRenderingTest();

    it('executes modifying automation inventory (success scenario)', function () {
      const atmInventoryDiff = {
        name: 'inventory2',
      };
      const atmInventory = {
        name: 'inventory1',
        save: sinon.stub().callsFake(() => {
          if (atmInventory.name === atmInventoryDiff.name) {
            return resolve();
          }
        }),
      };
      const action = ModifyAtmInventoryAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          atmInventoryDiff,
        },
      });
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );

      return action.execute()
        .then(actionResult => {
          expect(atmInventory.save).to.be.calledOnce;
          expect(atmInventory.name).to.equal('inventory2');
          expect(successNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'Automation inventory has been modified successfully.')
          );
          expect(get(actionResult, 'status')).to.equal('done');
          expect(get(actionResult, 'result')).to.equal(atmInventory);
        });
    });

    it('executes modifying automation inventory (failure scenario)', function () {
      const atmInventoryDiff = {
        name: 'inventory2',
      };
      const atmInventory = {
        name: 'inventory1',
        save: sinon.stub().callsFake(() => {
          if (atmInventory.name === atmInventoryDiff.name) {
            return reject('error');
          }
        }),
        rollbackAttributes() {
          atmInventory.name = 'inventory1';
        },
      };
      const action = ModifyAtmInventoryAction.create({
        ownerSource: this.owner,
        context: {
          atmInventory,
          atmInventoryDiff,
        },
      });
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      return action.execute()
        .then(actionResult => {
          expect(atmInventory.name).to.equal('inventory1');
          expect(failureNotifySpy).to.be.calledWith(
            sinon.match.has('string', 'modifying automation inventory'),
            'error'
          );
          expect(get(actionResult, 'status')).to.equal('failed');
          expect(get(actionResult, 'error')).to.equal('error');
        });
    });
  }
);
