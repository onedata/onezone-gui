import { allSettled } from 'rsvp';
import gri from 'onedata-gui-websocket-client/utils/gri';
import {
  entityType as spaceEntityType,
} from 'onezone-gui/models/space';
import { get, set } from '@ember/object';

export default async function createSpace(store, data = {}, user) {
  const relationRecords = {
    effUserList: store.createRecord('user-list', { list: [] }),
    effGroupList: store.createRecord('group-list', { list: [] }),
    providerList: store.createRecord('provider-list', { list: [] }),
    membership: store.createRecord('membership', {
      intermediaries: [],
      directMemberhip: true,
    }),
  };
  await allSettled(Object.values(relationRecords).map(r => r.save()));
  const recordData = {
    name: 'test space',
    ...relationRecords,
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
  const spaceRecord = store.createRecord('space', recordData);
  await spaceRecord.save();
  if (user) {
    const effUserMembershipGri = gri({
      entityType: 'space',
      entityId: get(spaceRecord, 'entityId'),
      aspect: 'eff_user_membership',
      aspectId: get(user, 'entityId'),
      scope: 'private',
    });
    const effUserMembership = store.createRecord('membership', {
      id: effUserMembershipGri,
      intermediaries: [],
      directMemberhip: true,
    });
    await effUserMembership.save();
    if (!get(spaceRecord, 'info.creatorId')) {
      set(spaceRecord, 'info', {
        creatorId: get(user, 'entityId'),
        creatorType: 'user',
        creatorName: get(user, 'name'),
        creationTime: get(spaceRecord, 'info.creationTime') ?? 0,
        sharesCount: get(spaceRecord, 'info.sharesCount') ?? 0,
      });
      spaceRecord.save();
    }
  }
  return spaceRecord;
}
