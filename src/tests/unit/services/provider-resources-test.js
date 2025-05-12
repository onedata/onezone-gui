import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import clearStore from '../../helpers/clear-store';
import { allSettled } from 'rsvp';

describe('Unit | Service | provider-resources', function () {
  const { beforeEach, afterEach } = setupTest();

  beforeEach(function () {
    this.destroyables = [];
  });

  afterEach(function () {
    clearStore();
    for (const destroyable of this.destroyables) {
      destroyable.destroy();
    }
  });

  it('resolves new ChunkableListModel with provider spaces list', async function () {
    const providerResourcesService = this.owner.lookup('service:provider-resources');

    const store = this.owner.lookup('service:store');
    const space1 = await store.createRecord('space', {
      name: 'space-1',
    }).save();
    const spaceList1 = await store.createRecord('spaceList', {
      list: [space1],
    }).save();
    const provider1 = await store.createRecord('provider', {
      name: 'provider-1',
      spaceList: spaceList1,
    }).save();

    const chunkableListModel =
      await providerResourcesService.resolveChunkableSpaceListModel(provider1);
    this.destroyables.push(chunkableListModel);
    await chunkableListModel.chunksArray.initialLoad;

    expect(chunkableListModel.chunksArray.toArray()[0]).to.equal(space1);
  });

  it('resolves single ChunkableListModel instance for particular provider', async function () {
    const providerResourcesService = this.owner.lookup('service:provider-resources');

    const store = this.owner.lookup('service:store');
    const spaceList = await store.createRecord('spaceList', {
      list: [],
    }).save();
    const provider = await store.createRecord('provider', {
      name: 'provider-1',
      spaceList: spaceList,
    }).save();

    const chunkableListModel1 =
      await providerResourcesService.resolveChunkableSpaceListModel(provider);
    const chunkableListModel2 =
      await providerResourcesService.resolveChunkableSpaceListModel(provider);
    this.destroyables.push(chunkableListModel1, chunkableListModel2);
    await chunkableListModel1.chunksArray.initialLoad;
    await chunkableListModel2.chunksArray.initialLoad;

    expect(chunkableListModel1).to.equal(chunkableListModel2);
  });

  /*
   * A single space may be supported by multiple providers. If so, multiple providers have
   * the same space on the list. Batch container cannot be created if container having one
   * of requested spaces already exists, so there must be a safety check somewhere to wait
   * for conflicts to resolve.
   */
  it('loads spaces for multiple providers supporting the same spaces', async function () {
    // given
    const providerResourcesService = this.owner.lookup('service:provider-resources');
    const store = this.owner.lookup('service:store');
    const space = await store.createRecord('space', {
      name: 'space1',
    });
    const spaceList1 = await store.createRecord('spaceList', {
      list: [space],
    }).save();
    const spaceList2 = await store.createRecord('spaceList', {
      list: [space],
    }).save();
    const provider1 = await store.createRecord('provider', {
      name: 'provider-1',
      spaceList: spaceList1,
    }).save();
    const provider2 = await store.createRecord('provider', {
      name: 'provider-2',
      spaceList: spaceList2,
    }).save();

    // when
    const chunkableListModelResults = await allSettled([
      providerResourcesService.resolveChunkableSpaceListModel(provider1),
      providerResourcesService.resolveChunkableSpaceListModel(provider2),
    ]);
    for (const result of chunkableListModelResults) {
      if (result.value) {
        this.destroyables.push(result.value);
      }
    }

    // then
    for (const result of chunkableListModelResults) {
      expect(result.state).to.equal('fulfilled');
      const chunkableListModel = result.value;
      await chunkableListModel.chunksArray.initialLoad;
      expect(chunkableListModel.listModel.list.toArray()).to.deep.equal([space]);
    }
  });
});
