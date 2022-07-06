import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';
import UnlinkAtmLambdaAction from 'onezone-gui/utils/workflow-actions/unlink-atm-lambda-action';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';
import CreateAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-action';
import UploadAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/upload-atm-workflow-schema-action';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import ModifyAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import DuplicateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-workflow-schema-revision-action';
import { get } from '@ember/object';

describe('Unit | Service | workflow actions', function () {
  setupTest();

  it('creates OpenCreateAtmInventoryViewAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const action = service.createOpenCreateAtmInventoryViewAction();

    expect(action).to.be.instanceOf(OpenCreateAtmInventoryViewAction);
  });

  it('creates CreateAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const rawAtmInventory = { name: 'someName' };
    const action = service.createCreateAtmInventoryAction({
      rawAtmInventory,
    });

    expect(action).to.be.instanceOf(CreateAtmInventoryAction);
    expect(get(action, 'rawAtmInventory')).to.equal(rawAtmInventory);
  });

  it('creates ModifyAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const atmInventoryDiff = {};
    const action = service.createModifyAtmInventoryAction({
      atmInventory,
      atmInventoryDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmInventoryAction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
    expect(get(action, 'atmInventoryDiff'))
      .to.equal(atmInventoryDiff);
  });

  it('creates RemoveAtmInventoryAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const action = service.createRemoveAtmInventoryAction({
      atmInventory,
    });

    expect(action).to.be.instanceOf(RemoveAtmInventoryAction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates CreateAtmLambdaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const initialRevision = {};
    const action = service.createCreateAtmLambdaAction({
      initialRevision,
      atmInventory,
    });

    expect(action).to.be.instanceOf(CreateAtmLambdaAction);
    expect(get(action, 'initialRevision')).to.equal(initialRevision);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates CreateAtmLambdaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const revisionContent = {};
    const action = service.createCreateAtmLambdaRevisionAction({
      atmLambda,
      revisionContent,
    });

    expect(action).to.be.instanceOf(CreateAtmLambdaRevisionAction);
    expect(get(action, 'atmLambda')).to.equal(atmLambda);
    expect(get(action, 'revisionContent')).to.equal(revisionContent);
  });

  it('creates ModifyAtmLambdaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const revisionNumber = 2;
    const revisionDiff = {};
    const action = service.createModifyAtmLambdaRevisionAction({
      atmLambda,
      revisionNumber,
      revisionDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmLambdaRevisionAction);
    expect(get(action, 'atmLambda')).to.equal(atmLambda);
    expect(get(action, 'revisionNumber')).to.equal(revisionNumber);
    expect(get(action, 'revisionDiff')).to.equal(revisionDiff);
  });

  it('creates UnlinkAtmLambdaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmLambda = {};
    const atmInventory = {};
    const action = service.createUnlinkAtmLambdaAction({
      atmLambda,
      atmInventory,
    });

    expect(action).to.be.instanceOf(UnlinkAtmLambdaAction);
    expect(get(action, 'atmLambda')).to.equal(atmLambda);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates ModifyAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const atmWorkflowSchemaDiff = {};
    const action = service.createModifyAtmWorkflowSchemaAction({
      atmWorkflowSchema,
      atmWorkflowSchemaDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmWorkflowSchemaAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'atmWorkflowSchemaDiff'))
      .to.equal(atmWorkflowSchemaDiff);
  });

  it('creates RemoveAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const action = service.createRemoveAtmWorkflowSchemaAction({
      atmWorkflowSchema,
    });

    expect(action).to.be.instanceOf(RemoveAtmWorkflowSchemaAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
  });

  it('creates CreateAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const rawAtmWorkflowSchema = {};
    const action = service.createCreateAtmWorkflowSchemaAction({
      rawAtmWorkflowSchema,
      atmInventory,
    });

    expect(action).to.be.instanceOf(CreateAtmWorkflowSchemaAction);
    expect(get(action, 'rawAtmWorkflowSchema')).to.equal(rawAtmWorkflowSchema);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates UploadAtmWorkflowSchemaAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmInventory = {};
    const action = service.createUploadAtmWorkflowSchemaAction({
      atmInventory,
    });

    expect(action).to.be.instanceOf(UploadAtmWorkflowSchemaAction);
    expect(get(action, 'atmInventory')).to.equal(atmInventory);
  });

  it('creates DumpAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const action = service.createDumpAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
    });

    expect(action).to.be.instanceOf(DumpAtmWorkflowSchemaRevisionAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'revisionNumber')).to.equal(3);
  });

  it('creates ModifyAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const revisionDiff = {};
    const action = service.createModifyAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
      revisionDiff,
    });

    expect(action).to.be.instanceOf(ModifyAtmWorkflowSchemaRevisionAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'revisionNumber')).to.equal(3);
    expect(get(action, 'revisionDiff')).to.equal(revisionDiff);
  });

  it('creates CreateAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const action = service.createCreateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      originRevisionNumber: 3,
    });

    expect(action).to.be.instanceOf(CreateAtmWorkflowSchemaRevisionAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'originRevisionNumber')).to.equal(3);
  });

  it('creates RemoveAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const action = service.createRemoveAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
    });

    expect(action).to.be.instanceOf(RemoveAtmWorkflowSchemaRevisionAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'revisionNumber')).to.equal(3);
  });

  it('creates DuplicateAtmWorkflowSchemaRevisionAction instance', function () {
    const service = this.owner.lookup('service:workflow-actions');

    const atmWorkflowSchema = {};
    const action = service.createDuplicateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber: 3,
    });

    expect(action).to.be.instanceOf(DuplicateAtmWorkflowSchemaRevisionAction);
    expect(get(action, 'atmWorkflowSchema')).to.equal(atmWorkflowSchema);
    expect(get(action, 'revisionNumber')).to.equal(3);
  });
});
