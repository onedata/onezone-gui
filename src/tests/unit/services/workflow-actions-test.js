import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import DuplicateAtmRecordRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-record-revision-action';
import UploadAtmRecordAction from 'onezone-gui/utils/workflow-actions/upload-atm-record-action';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import DumpAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-lambda-revision-action';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';
import UnlinkAtmLambdaAction from 'onezone-gui/utils/workflow-actions/unlink-atm-lambda-action';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';
import CreateAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-action';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import ModifyAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import { get } from '@ember/object';

describe('Unit | Service | workflow-actions', function () {
  const { afterEach } = setupTest();

  afterEach(function () {
    this.action?.destroy();
  });

  it('creates OpenCreateAtmInventoryViewAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    this.action = service.createOpenCreateAtmInventoryViewAction();

    expect(this.action).to.be.instanceOf(OpenCreateAtmInventoryViewAction);
  });

  it('creates CreateAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const rawAtmInventory = { name: 'someName' };
    this.action = service.createCreateAtmInventoryAction({
      rawAtmInventory,
    });

    expect(this.action).to.be.instanceOf(CreateAtmInventoryAction);
    expect(get(this.action, 'rawAtmInventory')).to.equal(rawAtmInventory);
  });

  it('creates ModifyAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const atmInventoryDiff = {};
    this.action = service.createModifyAtmInventoryAction({
      atmInventory,
      atmInventoryDiff,
    });

    expect(this.action).to.be.instanceOf(ModifyAtmInventoryAction);
    expect(get(this.action, 'atmInventory')).to.equal(atmInventory);
    expect(get(this.action, 'atmInventoryDiff'))
      .to.equal(atmInventoryDiff);
  });

  it('creates RemoveAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    this.action = service.createRemoveAtmInventoryAction({
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(RemoveAtmInventoryAction);
    expect(get(this.action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates DuplicateAtmRecordRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const atmInventory = {};
    this.action = service.createDuplicateAtmRecordRevisionAction({
      atmModelName: 'atmWorkflowSchema',
      atmRecord: atmWorkflowSchema,
      revisionNumber: 3,
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(DuplicateAtmRecordRevisionAction);
    expect(this.action.atmModelName).to.equal('atmWorkflowSchema');
    expect(this.action.atmRecord).to.equal(atmWorkflowSchema);
    expect(this.action.atmInventory).to.equal(atmInventory);
    expect(this.action.revisionNumber).to.equal(3);
  });

  it('creates UploadAtmRecordAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    this.action = service.createUploadAtmRecordAction({
      atmModelName: 'atmWorkflowSchema',
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(UploadAtmRecordAction);
    expect(this.action.atmModelName).to.equal('atmWorkflowSchema');
    expect(this.action.atmInventory).to.equal(atmInventory);
  });

  it('creates CreateAtmLambdaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const initialRevision = {};
    this.action = service.createCreateAtmLambdaAction({
      initialRevision,
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(CreateAtmLambdaAction);
    expect(get(this.action, 'initialRevision')).to.equal(initialRevision);
    expect(get(this.action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates DumpAtmLambdaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    this.action = service.createDumpAtmLambdaRevisionAction({
      atmLambda,
      revisionNumber: 3,
    });

    expect(this.action).to.be.instanceOf(DumpAtmLambdaRevisionAction);
    expect(get(this.action, 'atmLambda')).to.equal(atmLambda);
    expect(get(this.action, 'revisionNumber')).to.equal(3);
  });

  it('creates CreateAtmLambdaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const revisionContent = {};
    this.action = service.createCreateAtmLambdaRevisionAction({
      atmLambda,
      revisionContent,
    });

    expect(this.action).to.be.instanceOf(CreateAtmLambdaRevisionAction);
    expect(get(this.action, 'atmLambda')).to.equal(atmLambda);
    expect(get(this.action, 'revisionContent')).to.equal(revisionContent);
  });

  it('creates ModifyAtmLambdaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const revisionNumber = 2;
    const revisionDiff = {};
    this.action = service.createModifyAtmLambdaRevisionAction({
      atmLambda,
      revisionNumber,
      revisionDiff,
    });

    expect(this.action).to.be.instanceOf(ModifyAtmLambdaRevisionAction);
    expect(get(this.action, 'atmLambda')).to.equal(atmLambda);
    expect(get(this.action, 'revisionNumber')).to.equal(revisionNumber);
    expect(get(this.action, 'revisionDiff')).to.equal(revisionDiff);
  });

  it('creates UnlinkAtmLambdaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const atmInventory = {};
    this.action = service.createUnlinkAtmLambdaAction({
      atmLambda,
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(UnlinkAtmLambdaAction);
    expect(get(this.action, 'atmLambda')).to.equal(atmLambda);
    expect(get(this.action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates ModifyAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const atmWorkflowSchemaDiff = {};
    this.action = service.createModifyAtmWorkflowSchemaAction({
      atmWorkflowSchema,
      atmWorkflowSchemaDiff,
    });

    expect(this.action).to.be.instanceOf(ModifyAtmWorkflowSchemaAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(this.action, 'atmWorkflowSchemaDiff'))
      .to.equal(atmWorkflowSchemaDiff);
  });

  it('creates RemoveAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    this.action = service.createRemoveAtmWorkflowSchemaAction({
      atmWorkflowSchema,
    });

    expect(this.action).to.be.instanceOf(RemoveAtmWorkflowSchemaAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
  });

  it('creates CreateAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const rawAtmWorkflowSchema = {};
    this.action = service.createCreateAtmWorkflowSchemaAction({
      rawAtmWorkflowSchema,
      atmInventory,
    });

    expect(this.action).to.be.instanceOf(CreateAtmWorkflowSchemaAction);
    expect(get(this.action, 'rawAtmWorkflowSchema')).to.equal(rawAtmWorkflowSchema);
    expect(get(this.action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates DumpAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    this.action = service.createDumpAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
    });

    expect(this.action).to.be.instanceOf(DumpAtmWorkflowSchemaRevisionAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(this.action, 'revisionNumber')).to.equal(3);
  });

  it('creates ModifyAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const revisionDiff = {};
    this.action = service.createModifyAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
      revisionDiff,
    });

    expect(this.action).to.be.instanceOf(ModifyAtmWorkflowSchemaRevisionAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(this.action, 'revisionNumber')).to.equal(3);
    expect(get(this.action, 'revisionDiff')).to.equal(revisionDiff);
  });

  it('creates CreateAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    this.action = service.createCreateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      originRevisionNumber: 3,
    });

    expect(this.action).to.be.instanceOf(CreateAtmWorkflowSchemaRevisionAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(this.action, 'originRevisionNumber')).to.equal(3);
  });

  it('creates RemoveAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    this.action = service.createRemoveAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
    });

    expect(this.action).to.be.instanceOf(RemoveAtmWorkflowSchemaRevisionAction);
    expect(get(this.action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(this.action, 'revisionNumber')).to.equal(3);
  });
});
