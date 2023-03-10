import { expect } from 'chai';
import { describe, it, beforeEach, context } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render, click, fillIn, settled } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import DuplicateAtmRecordRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-record-revision-action';
import { getProperties, get } from '@ember/object';
import { getModal } from '../../../helpers/modal';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { resolve, reject } from 'rsvp';
import generateAtmLambdaDump from '../../../helpers/workflows/generate-atm-lambda-dump';
import generateAtmWorkflowSchemaDump from '../../../helpers/workflows/generate-atm-workflow-schema-dump';
import { lookupService } from '../../../helpers/stub-service';
import sinon from 'sinon';
import { suppressRejections } from '../../../helpers/suppress-rejections';
import { dasherize } from '@ember/string';
import _ from 'lodash';

const atmInventoryId = 'invid';

describe(
  'Integration | Utility | workflow-actions/duplicate-atm-record-revision-action',
  function () {
    setupRenderingTest();

    context('when atmModelName is "atmLambda"', function () {
      beforeEach(function () {
        const atmModelName = 'atmLambda';
        const atmLambda = {
          entityId: 'someid',
        };
        const atmRecordDump = generateAtmLambdaDump();

        const atmLambdas = [{
          entityId: 'lm1id',
          originalAtmLambdaId: 'l1id',
          revisionRegistry: {
            1: {
              name: 'lm1',
            },
          },
        }];
        const atmInventory = {
          entityId: atmInventoryId,
          atmLambdaList: promiseObject(resolve({
            list: promiseArray(resolve(atmLambdas)),
          })),
        };
        sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
          .resolves({ list: promiseArray(resolve([atmInventory])) });
        const workflowManager = lookupService(this, 'workflow-manager');
        sinon.stub(workflowManager, 'getAtmLambdaDump')
          .withArgs('someid', 1).resolves(atmRecordDump);
        const mergeStub =
          sinon.stub(workflowManager, 'mergeAtmLambdaDumpToExistingLambda');
        const createStub = sinon.stub(workflowManager, 'createAtmLambda');
        this.setProperties({
          atmModelName,
          action: DuplicateAtmRecordRevisionAction.create({
            ownerSource: this.owner,
            context: {
              atmModelName,
              atmRecord: atmLambda,
              revisionNumber: 1,
              atmInventory,
            },
          }),
          atmInventory,
          atmRecordDump,
          mergeStub,
          createStub,
        });
      });

      itHasCorrectBasicProperties();
      itShowsModalOnExecute();
      itExecutesMergingOnSubmitWithSuccess();
      itExecutesCreatingOnSubmitWithSuccess();
      itExecutesMergingOnSubmitWithFailure();
      itExecutesCreatingOnSubmitWithFailure();
    });

    context('when atmModelName is "atmWorkflowSchema"', function () {
      beforeEach(function () {
        const atmModelName = 'atmWorkflowSchema';
        const atmWorkflowSchema = {
          entityId: 'someid',
        };
        const atmRecordDump = generateAtmWorkflowSchemaDump();

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
        };
        atmWorkflowSchema.atmInventory = promiseObject(resolve(atmInventory));
        sinon.stub(lookupService(this, 'record-manager'), 'getUserRecordList')
          .resolves({ list: promiseArray(resolve([atmInventory])) });
        const workflowManager = lookupService(this, 'workflow-manager');
        sinon.stub(workflowManager, 'getAtmWorkflowSchemaDump')
          .withArgs('someid', 1).resolves(atmRecordDump);
        const mergeStub =
          sinon.stub(workflowManager, 'mergeAtmWorkflowSchemaDumpToExistingSchema');
        const createStub = sinon.stub(workflowManager, 'createAtmWorkflowSchema');
        this.setProperties({
          atmModelName,
          action: DuplicateAtmRecordRevisionAction.create({
            ownerSource: this.owner,
            context: {
              atmModelName,
              atmRecord: atmWorkflowSchema,
              revisionNumber: 1,
              atmInventory,
            },
          }),
          atmInventory,
          atmRecordDump,
          mergeStub,
          createStub,
        });
      });

      itHasCorrectBasicProperties();
      itShowsModalOnExecute();
      itExecutesMergingOnSubmitWithSuccess();
      itExecutesCreatingOnSubmitWithSuccess();
      itExecutesMergingOnSubmitWithFailure();
      itExecutesCreatingOnSubmitWithFailure();
    });
  }
);

function itHasCorrectBasicProperties() {
  it('has correct className, icon and title', function () {
    const atmModelName = this.get('atmModelName');
    const {
      className,
      icon,
      title,
    } = getProperties(this.get('action'), 'className', 'icon', 'title');
    expect(className).to.equal(
      `duplicate-atm-record-revision-action-trigger duplicate-${dasherize(atmModelName)}-revision-action-trigger`);
    expect(icon).to.equal('browser-copy');
    expect(String(title)).to.equal('Duplicate to...');
  });
}

function itShowsModalOnExecute() {
  it('shows modal on execute', async function () {
    await render(hbs`{{global-modal-mounter}}`);
    this.get('action').execute();
    await settled();

    expect(getModal()).to.have.class('apply-atm-record-dump-modal');
    const recordName = this.get('atmModelName') === 'atmLambda' ?
      this.get('atmRecordDump.revision.atmLambdaRevision.name') :
      this.get('atmRecordDump.name');
    expect(getModal().querySelector('.dump-details'))
      .to.contain.text(recordName);
  });
}

function itExecutesMergingOnSubmitWithSuccess() {
  it('executes merging records on submit - notification on success',
    async function () {
      const {
        atmRecordDump,
        atmModelName,
        mergeStub,
        action,
      } = this.getProperties('atmRecordDump', 'atmModelName', 'mergeStub', 'action');
      const resultAtmRecord = { entityId: '123456' };
      mergeStub.resolves(atmModelName === 'atmLambda' ? {
        atmLambda: resultAtmRecord,
        revisionNumber: atmRecordDump.revision.originalRevisionNumber,
      } : resultAtmRecord);
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );
      await render(hbs`{{global-modal-mounter}}`);

      const actionResultPromise = action.execute();
      await settled();
      await click('.submit-btn');
      const actionResult = await actionResultPromise;

      expect(mergeStub).to.be.calledOnce
        .and.to.be.calledWith(atmModelName === 'atmLambda' ? 'lm1id' : 'wf1id', atmRecordDump);
      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        `The ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'} has been merged successfully.`
      ));
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.deep.equal({
        atmRecord: resultAtmRecord,
        revisionNumber: atmRecordDump.revision.originalRevisionNumber,
      });
    }
  );
}

function itExecutesCreatingOnSubmitWithSuccess() {
  it('executes creating new record on submit - notification on success',
    async function () {
      const {
        atmRecordDump,
        atmModelName,
        createStub,
        action,
      } = this.getProperties('atmRecordDump', 'atmModelName', 'createStub', 'action');
      const resultAtmRecord = { entityId: '123456' };
      createStub.resolves(resultAtmRecord);
      const successNotifySpy = sinon.spy(
        lookupService(this, 'global-notify'),
        'success'
      );
      const expectedRecordContent = _.cloneDeep(atmRecordDump);
      if (atmModelName === 'atmLambda') {
        expectedRecordContent.revision.atmLambdaRevision.name = 'abcd';
      } else {
        expectedRecordContent.name = 'abcd';
      }
      await render(hbs`{{global-modal-mounter}}`);

      const actionResultPromise = action.execute();
      await settled();
      await click('.option-create');
      await fillIn('.newAtmRecordName-field .form-control', 'abcd');
      await click('.submit-btn');
      const actionResult = await actionResultPromise;

      expect(createStub).to.be.calledOnce
        .and.to.be.calledWith(atmInventoryId, expectedRecordContent);
      expect(successNotifySpy).to.be.calledWith(sinon.match.has(
        'string',
        `The ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'} has been created successfully.`
      ));
      expect(get(actionResult, 'status')).to.equal('done');
      expect(get(actionResult, 'result')).to.deep.equal({
        atmRecord: resultAtmRecord,
        revisionNumber: atmRecordDump.revision.originalRevisionNumber,
      });
    }
  );
}

function itExecutesMergingOnSubmitWithFailure() {
  it('executes merging record dump on submit - notification on failure',
    async function () {
      suppressRejections();
      const {
        atmModelName,
        mergeStub,
        action,
      } = this.getProperties('atmModelName', 'mergeStub', 'action');
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
        sinon.match.has('string', `merging ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'}`),
        'someError'
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
    }
  );
}

function itExecutesCreatingOnSubmitWithFailure() {
  it('executes creating new workflow on submit - notification on failure',
    async function () {
      suppressRejections();
      const {
        atmModelName,
        createStub,
        action,
      } = this.getProperties('atmModelName', 'createStub', 'action');
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
        sinon.match.has('string', `creating ${atmModelName === 'atmLambda' ? 'lambda' : 'workflow'}`),
        'someError'
      );
      expect(get(actionResult, 'status')).to.equal('failed');
      expect(get(actionResult, 'error')).to.equal('someError');
    }
  );
}
