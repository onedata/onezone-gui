import { allSettled } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import {
  entityType as spaceEntityType,
} from 'onezone-gui/models/space';

export default async function createSpace(store, data = {}) {
  const listRecords = {
    effUserList: store.createRecord('user-list', { list: [] }),
    effGroupList: store.createRecord('group-list', { list: [] }),
    providerList: store.createRecord('provider-list', { list: [] }),
  };
  await allSettled(Object.values(listRecords).map(r => r.save()));
  const recordData = {
    name: 'test space',
    ...listRecords,
    ...data,
  };
  if (data.entityId) {
    recordData.id = gri({
      entityType: spaceEntityType,
      entityId: data.entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    delete recordData.entityId;
  }
  const record = store.createRecord('space', recordData);
  await record.save();
  return record;
}
