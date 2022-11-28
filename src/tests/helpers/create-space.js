import { allSettled } from 'rsvp';

export default async function createSpace(store, data = {}) {
  const listRecords = {
    effUserList: store.createRecord('user-list', { list: [] }),
    effGroupList: store.createRecord('group-list', { list: [] }),
    providerList: store.createRecord('provider-list', { list: [] }),
  };
  await allSettled(Object.values(listRecords).map(r => r.save()));
  return await store.createRecord('space', {
    name: 'test space',
    ...listRecords,
    ...data,
  }).save();
}
