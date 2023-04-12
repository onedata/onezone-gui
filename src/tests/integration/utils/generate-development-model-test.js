import { expect } from 'chai';
import { describe, it } from 'mocha';
import generateDevelopmentModel from 'onezone-gui/utils/generate-development-model';
import sinon from 'sinon';
import { lookupService } from '../../helpers/stub-service';
import { setupTest } from 'ember-mocha';
import { clearStoreAfterEach } from '../../helpers/clear-store';

describe('Integration | Utility | generate-development-model', function () {
  setupTest();
  clearStoreAfterEach();

  it('creates and saves records', async function () {
    const modelNames = [
      'atmInventory',
      'atmLambda',
      'atmWorkflowSchema',
      'cluster',
      'guiMessage',
      'group',
      'groupList',
      'guiMessage',
      'harvester',
      'harvesterGuiPluginConfig',
      'harvesterList',
      'index',
      'indexList',
      'indexStat',
      'linkedAccount',
      'linkedAccountList',
      'membership',
      'privilege',
      'provider',
      'providerList',
      'share',
      'shareList',
      'space',
      'spaceList',
      'token',
      'tokenList',
      'user',
    ];
    const store = lookupService(this, 'store');
    const createRecordSpy = sinon.spy(store, 'createRecord');

    await generateDevelopmentModel(store);

    for (const modelName of modelNames) {
      expect(createRecordSpy, `createRecord for ${modelName}`)
        .to.be.calledWith(modelName, sinon.match.object);
      const allModelRecords = store.peekAll(modelName).content;
      for (const record of allModelRecords) {
        expect(record.currentState === 'root.lodaded.saved');
      }
    }
  });
});
