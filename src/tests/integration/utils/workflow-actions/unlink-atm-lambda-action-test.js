import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import UnlinkAtmLambdaAction from 'onezone-gui/utils/workflow-actions/unlink-atm-lambda-action';
import sinon from 'sinon';
import { defer, resolve, reject } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, getProperties } from '@ember/object';
import { getModal, getModalBody, getModalFooter } from '../../../helpers/modal';
import wait from 'ember-test-helpers/wait';
import { click } from 'ember-native-dom-helpers';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

describe('Integration | Utility | workflow actions/unlink atm lambda action',
  function () {
    setupComponentTest('global-modal-mounter', {
      integration: true,
    });

    beforeEach(function () {
      const atmInventory = {
        name: 'inventory1',
        entityId: 'inventory1Id',
        privileges: {
          manageLambdas: true,
        },
      };
      const atmInventories = [{
        entityId: 'inventory0Id',
        privileges: {
          manageLambdas: false,
        },
      }, atmInventory, {
        entityId: 'inventory2Id',
        privileges: {
          manageLambdas: true,
        },
      }, {
        entityId: 'inventory3Id',
        privileges: {
          manageLambdas: true,
        },
      }];
      const userAtmInventoriesList = promiseObject(resolve({
        list: promiseArray(resolve(atmInventories)),
      }));

      const recordManager = lookupService(this, 'record-manager');
      sinon.stub(recordManager, 'getUserRecordList')
        .withArgs('atmInventory').returns(resolve(userAtmInventoriesList));
      const removeRelationStub = sinon.stub(recordManager, 'removeRelation');

      const workflowManager = lookupService(this, 'workflow-manager');
      const usedAtmLambdasDefer = defer();
      sinon.stub(workflowManager, 'getAtmLambdasUsedByAtmInventory')
        .returns(promiseArray(usedAtmLambdasDefer.promise));

      const context = {
        atmLambda: {
          name: 'lambda1',
          entityId: 'lambda1Id',
        },
        atmInventory,
      };
      this.setProperties(Object.assign({
        action: UnlinkAtmLambdaAction.create({
          ownerSource: this,
          context,
        }),
        usedAtmLambdasDefer,
        atmInventories,
        removeRelationStub,
      }, context));
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('unlink-atm-lambda-action-trigger');
      expect(icon).to.equal('x');
      expect(String(title)).to.equal('Unlink');
    });

    it('is enabled, when user has "manageLambdas" privilege in inventory',
      function () {
        this.set('atmInventory.privileges.manageLambdas', true);

        expect(this.get('action.disabled')).to.be.false;
        expect(String(this.get('action.tip'))).to.be.empty;
      });

    it('is disabled, when user does not have "manageLambdas" privilege in inventory',
      function () {
        this.set('atmInventory.privileges.manageLambdas', false);

        expect(this.get('action.disabled')).to.be.true;
        expect(String(this.get('action.tip'))).to.equal(
          'Insufficient privileges (requires &quot;manage lambdas&quot; privilege in this automation inventory).'
        );
      });

    it('is enabled, when information about atmLambda usages is being acquired',
      async function () {
        await wait();
        expect(this.get('action.disabled')).to.be.false;
        expect(String(this.get('action.tip'))).to.be.empty;
      });

    it('is enabled, when information about atmLambda usages is not available',
      async function () {
        this.get('usedAtmLambdasDefer').reject();
        await wait();

        expect(this.get('action.disabled')).to.be.false;
        expect(String(this.get('action.tip'))).to.be.empty;
      });

    it('is enabled, when there are no atmLambda usages', async function () {
      this.get('usedAtmLambdasDefer').resolve([{}, {}]);
      await wait();

      expect(this.get('action.disabled')).to.be.false;
      expect(String(this.get('action.tip'))).to.be.empty;
    });

    it('is disabled, when there are some atmLambda usages', async function () {
      const {
        usedAtmLambdasDefer,
        atmLambda,
      } = this.getProperties('usedAtmLambdasDefer', 'atmLambda');

      usedAtmLambdasDefer.resolve([{}, atmLambda, {}]);
      await wait();

      expect(this.get('action.disabled')).to.be.true;
      expect(String(this.get('action.tip'))).to.equal(
        'This lambda cannot be unlinked because it is used by at least one workflow schema in this inventory.'
      );
    });

    it('shows modal on execute', async function () {
      this.render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await wait();

      expect(getModal()).to.have.class('unlink-atm-lambda-modal');
      expect(getModalBody().text()).to.contain('inventory1');
      expect(getModalBody().text()).to.contain('lambda1');
    });

    it('returns promise with cancelled ActionResult after execute() and modal close using "Cancel"',
      async function () {
        this.render(hbs `{{global-modal-mounter}}`);

        const resultPromise = this.get('action').execute();
        await wait();
        await click(getModalFooter().find('.cancel-btn')[0]);
        const actionResult = await resultPromise;

        expect(get(actionResult, 'status')).to.equal('cancelled');
      }
    );

    it('executes unlinking lambda on submit - success status and notification on success',
      async function () {
        const {
          atmLambda,
          atmInventory,
          removeRelationStub,
          action,
        } = this.getProperties(
          'atmLambda',
          'atmInventory',
          'removeRelationStub',
          'action'
        );
        removeRelationStub.resolves();
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await click(getModalFooter().find('.submit-btn')[0]);
        const actionResult = await actionResultPromise;

        expect(removeRelationStub).to.be.calledOnce;
        expect(removeRelationStub).to.be.calledWith(atmInventory, atmLambda);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The lambda has been unlinked sucessfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it(
      'executes unlinking lambda from all inventories on submit - success status and notification on success',
      async function () {
        const {
          atmLambda,
          atmInventories,
          removeRelationStub,
          action,
        } = this.getProperties(
          'atmLambda',
          'atmInventories',
          'removeRelationStub',
          'action'
        );
        removeRelationStub.callsFake((atmInventory) =>
          atmInventory === atmInventories[3] ? reject() : resolve()
        );
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await click(getModalBody().find('input[value="allInventories"]')[0]);
        await click(getModalFooter().find('.submit-btn')[0]);
        const actionResult = await actionResultPromise;

        expect(removeRelationStub).to.be.calledThrice;
        expect(removeRelationStub).to.be.calledWith(atmInventories[1], atmLambda);
        expect(removeRelationStub).to.be.calledWith(atmInventories[2], atmLambda);
        expect(removeRelationStub).to.be.calledWith(atmInventories[3], atmLambda);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The lambda has been unlinked sucessfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
      }
    );

    it(
      'executes unlinking lambda on submit - error status and notification on failure',
      async function () {
        const {
          removeRelationStub,
          action,
        } = this.getProperties(
          'removeRelationStub',
          'action'
        );
        removeRelationStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await click(getModalFooter().find('.submit-btn')[0]);
        await wait();
        const actionResult = await actionResultPromise;

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'unlinking the lambda'),
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

    it(
      'executes unlinking lambda from all inventories on submit - error status and notification on failure',
      async function () {
        const {
          atmInventories,
          removeRelationStub,
          action,
        } = this.getProperties(
          'atmInventories',
          'removeRelationStub',
          'action'
        );
        removeRelationStub.callsFake((atmInventory) =>
          (atmInventory === atmInventories[1] || atmInventory === atmInventories[3]) ?
          reject('someError') : resolve()
        );
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        this.render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await wait();
        await click(getModalBody().find('input[value="allInventories"]')[0]);
        await click(getModalFooter().find('.submit-btn')[0]);
        await wait();
        const actionResult = await actionResultPromise;

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'unlinking the lambda'),
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
