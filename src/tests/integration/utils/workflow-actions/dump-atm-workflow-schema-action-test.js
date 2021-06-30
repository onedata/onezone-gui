import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import DumpAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-action';
import sinon from 'sinon';
import { Promise } from 'rsvp';
import { lookupService } from '../../../helpers/stub-service';
import { get, getProperties } from '@ember/object';
import wait from 'ember-test-helpers/wait';
import suppressRejections from '../../../helpers/suppress-rejections';

const atmWorkflowSchemaId = 'wfkId';

describe(
  'Integration | Utility | workflow actions/dump atm workflow schema action',
  function () {
    setupComponentTest('test-component', {
      integration: true,
    });

    suppressRejections();

    beforeEach(function () {
        const workflowManager = lookupService(this, 'workflow-manager');
        this.setProperties({
          action: DumpAtmWorkflowSchemaAction.create({
            ownerSource: this,
            context: {
              atmWorkflowSchema: {
                entityId: atmWorkflowSchemaId,
              },
            },
          }),
          getAtmWorkflowSchemaDumpStub: sinon.stub(workflowManager, 'getAtmWorkflowSchemaDump'),
        });
      }),

      it('has correct className, icon and title', function () {
        const {
          className,
          icon,
          title,
        } = getProperties(this.get('action'), 'className', 'icon', 'title');
        expect(className).to.equal('dump-atm-inventory-action-trigger');
        expect(icon).to.equal('browser-download');
        expect(String(title)).to.equal('Download (json)');
      });

    it('executes dumping workflow (failure scenario)', async function () {
      const {
        getAtmWorkflowSchemaDumpStub,
        action,
      } = this.getProperties('action', 'getAtmWorkflowSchemaDumpStub');
      let rejectDump;
      getAtmWorkflowSchemaDumpStub.callsFake(id =>
        id === atmWorkflowSchemaId &&
        new Promise((resolve, reject) => rejectDump = reject)
      );
      const failureNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'backendError'
      );

      const actionResultPromise = action.execute();
      rejectDump('someError');
      await wait();
      const actionResult = await actionResultPromise;

      expect(failureNotifySpy).to.be.calledWith(
        sinon.match.has('string', 'dumping workflow'),
        'someError'
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
    });
  }
);
