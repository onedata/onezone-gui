import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import DuplicateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-workflow-schema-revision-action';
import { getProperties, get } from '@ember/object';
import { getModal } from '../../../helpers/modal';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject } from 'rsvp';
import generateAtmWorkflowSchemaDump from '../../../helpers/workflows/generate-atm-workflow-schema-dump';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { suppressRejections } from '../../../helpers/suppress-rejections';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow-actions/duplicate-atm-workflow-schema-revision-action',
  function () {
    setupRenderingTest();

    beforeEach(function () {
      const atmWorkflowSchema = {
        entityId: 'someid',
      };
      const atmWorkflowSchemaDump = generateAtmWorkflowSchemaDump();

      const atmWorkflowSchemas = [{
        entityId: 'wf1id',
        name: 'wf1',
        originalAtmWorkflowSchemaId: 'w1id',
        revisionRegistry: {
          1: {},
        },
      }];
      const atmInventory = {
        entityId: atmInventoryId,
        atmWorkflowSchemaList: promiseObject(resolve({
          list: promiseArray(resolve(atmWorkflowSchemas)),
        })),
        privileges: {
          manageWorkflowSchemas: true,
        },
      };
      atmWorkflowSchema.atmInventory = promiseObject(resolve(atmInventory));
      sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
        .resolves({ list: promiseArray(resolve([atmInventory])) });
      const workflowManager = lookupService(this, 'workflow-manager');
      sinon.stub(workflowManager, 'getAtmWorkflowSchemaDump')
        .withArgs('someid', 1).resolves(atmWorkflowSchemaDump);
      const mergeStub =
        sinon.stub(workflowManager, 'mergeAtmWorkflowSchemaDumpToExistingSchema');
      const createStub = sinon.stub(workflowManager, 'createAtmWorkflowSchema');
      this.setProperties({
        action: DuplicateAtmWorkflowSchemaRevisionAction.create({
          ownerSource: this.owner,
          context: {
            atmWorkflowSchema,
            revisionNumber: 1,
          },
        }),
        atmInventory,
        atmWorkflowSchemaDump,
        mergeStub,
        createStub,
      });
    });

    it('has correct className, icon and title', function () {
      const {
        className,
        icon,
        title,
      } = getProperties(this.get('action'), 'className', 'icon', 'title');
      expect(className).to.equal('duplicate-atm-workflow-schema-revision-action-trigger');
      expect(icon).to.equal('browser-copy');
      expect(String(title)).to.equal('Duplicate to...');
    });

    it('shows modal on execute', async function () {
      await render(hbs `{{global-modal-mounter}}`);
      this.get('action').execute();
      await settled();

      expect(getModal()).to.have.class('apply-atm-workflow-schema-dump-modal');
      expect(getModal().querySelector('.dump-details'))
        .to.contain.text(this.get('atmWorkflowSchemaDump.name'));
    });

    it('executes merging workflows on submit (success scenario)',
      async function () {
        const {
          atmWorkflowSchemaDump,
          mergeStub,
          action,
        } = this.getProperties('atmWorkflowSchemaDump', 'mergeStub', 'action');
        const resultAtmWorkflowSchema = { entityId: '123456' };
        mergeStub.resolves(resultAtmWorkflowSchema);
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await settled();
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        expect(mergeStub).to.be.calledOnce
          .and.to.be.calledWith('wf1id', atmWorkflowSchemaDump);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been merged successfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
        expect(get(actionResult, 'result')).to.deep.equal({
          atmWorkflowSchema: resultAtmWorkflowSchema,
          revisionNumber: atmWorkflowSchemaDump.revision.originalRevisionNumber,
        });
      });

    it('executes creating new workflow on submit - notification on success',
      async function () {
        const {
          atmWorkflowSchemaDump,
          createStub,
          action,
        } = this.getProperties('atmWorkflowSchemaDump', 'createStub', 'action');
        const resultAtmWorkflowSchema = { entityId: '123456' };
        createStub.resolves(resultAtmWorkflowSchema);
        const successNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'success'
        );
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await settled();
        await click('.option-create');
        await fillIn('.newWorkflowName-field .form-control', 'abcd');
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        const expectedWorkflowContent =
          Object.assign({}, atmWorkflowSchemaDump, { name: 'abcd' });
        expect(createStub).to.be.calledOnce
          .and.to.be.calledWith(atmInventoryId, expectedWorkflowContent);
        expect(successNotifySpy).to.be.calledWith(sinon.match.has(
          'string',
          'The workflow has been created successfully.'
        ));
        expect(get(actionResult, 'status')).to.equal('done');
        expect(get(actionResult, 'result')).to.deep.equal({
          atmWorkflowSchema: resultAtmWorkflowSchema,
          revisionNumber: atmWorkflowSchemaDump.revision.originalRevisionNumber,
        });
      });

    it('executes merging workflow dump on submit - notification on failure',
      async function () {
        suppressRejections();
        const {
          mergeStub,
          action,
        } = this.getProperties('mergeStub', 'action');
        mergeStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await settled();
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'merging workflow'),
          'someError'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
        expect(get(actionResult, 'error')).to.equal('someError');
      }
    );

    it('executes creating new workflow on submit - notification on failure',
      async function () {
        suppressRejections();
        const {
          createStub,
          action,
        } = this.getProperties('createStub', 'action');
        createStub.callsFake(() => reject('someError'));
        const failureNotifySpy = sinon.spy(
          lookupService(this, 'global-notify'),
          'backendError'
        );
        await render(hbs `{{global-modal-mounter}}`);

        const actionResultPromise = action.execute();
        await settled();
        await click('.option-create');
        await click('.submit-btn');
        const actionResult = await actionResultPromise;

        expect(failureNotifySpy).to.be.calledWith(
          sinon.match.has('string', 'creating workflow'),
          'someError'
        );
        expect(get(actionResult, 'status')).to.equal('failed');
        expect(get(actionResult, 'error')).to.equal('someError');
      }
    );
  }
);
