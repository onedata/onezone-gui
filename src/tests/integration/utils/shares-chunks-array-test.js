import { expect } from 'chai';
import {
  describe,
  it,
} from 'mocha';
import { lookupService } from '../../helpers/stub-service';
import clearStore from '../../helpers/clear-store';
import _ from 'lodash';
import { all as allFulfilled } from 'rsvp';
import { defineProperty } from '@ember/object';
import SharesChunksArray from 'onezone-gui/utils/shares-chunks-array';
import { setupRenderingTest } from 'ember-mocha';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { defer } from 'rsvp';
import { settled } from '@ember/test-helpers';
import sinon from 'sinon';
import getIndexedListPosition from 'onedata-gui-common/utils/get-indexed-list-position';

describe('Integration | Utility | shares-chunks-array', function () {
  const { afterEach } = setupRenderingTest();

  afterEach(function () {
    try {
      this.chunksArray?.destroy();
    } finally {
      clearStore();
    }
  });

  it('exposes shares collected from multiple spaces', async function () {
    // given
    const spacesCount = 3;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares();
    await helper.givenSimpleSpaceShareList();

    // when
    this.chunksArray = SharesChunksArray.create({ ownerSource: this.owner });
    await this.chunksArray.initialLoad;
    const array = this.chunksArray.toArray();

    // then
    const arrayShareNames = array.map(share => share.name);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(
        helper.spaces.map(space => `${Helper.generateShareName(space, 0)}`),
        'index'
      )
    );
  });

  it('changes progress from 0 to 0.2 when 1/5 of multi fetchers are done', async function () {
    // given
    const spacesCount = 25;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares();
    await helper.givenSimpleSpaceShareList();
    const shareManager = helper.getService('shareManager');

    const listDefers = {};
    // resolving of shares listing will be blocked until its defer will be resolved
    for (const shareItem of helper.shareItems) {
      listDefers[shareItem.shareId] = defer();
    }
    async function getSpaceShareList(spaceId, /* { index, limit, offset } */ ) {
      const shareItem = helper.shareItems.find(shareItem =>
        shareItem.spaceId === spaceId
      );
      await listDefers[shareItem.shareId].promise;
      return {
        array: [shareItem],
        isLast: true,
      };
    }
    shareManager.getSpaceShareList = getSpaceShareList;

    // when
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      spacesBatchSize: 5,
      reloadMinSize: spacesCount,
    });
    for (let i = 0; i < 5; ++i) {
      Object.values(listDefers)[i].resolve();
    }
    await settled();

    // then
    expect(this.chunksArray.progressTracker.progress).to.equal(0.2);

    // when 2
    for (let i = 5; i < 25; ++i) {
      Object.values(listDefers)[i].resolve();
    }
    await this.chunksArray.initialLoad;

    // then 2 - check if shares are properly sorted
    const arrayShareNames = this.chunksArray.map(share => share.name);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(
        helper.spaces.map(space => `${Helper.generateShareName(space, 0)}`),
        'index'
      )
    );
  });

  it('does not fetch next lists which have been fetched before', async function () {
    // --- given ---
    const spacesCount = 2;
    // should be lesser than chunk size, to fully fetch list of first space
    const sharesPerSpace = 8;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: sharesPerSpace });
    await helper.givenSimpleSpaceShareList();
    const getSpaceShareListSpy = sinon.spy(
      helper.getService('shareManager'),
      'getSpaceShareList'
    );

    // --- when ---
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      // first fetch size exceeds number of shares in single space
      chunkSize: 10,
    });
    await this.chunksArray.initialLoad;
    getSpaceShareListSpy.resetHistory();
    this.chunksArray.setIndices(2, 7);
    await settled();

    // --- then ---
    // Note, that call count is after fetch next after spy history reset,
    // so we check only fetchNext calls.
    expect(getSpaceShareListSpy).to.have.callCount(0);

    // check if final array has proper elements
    const array = this.chunksArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
      _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
    ).flat().slice(2, 7);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  it('does not fetch next from sources that have been run out', async function () {
    // --- given ---
    const spacesCount = 2;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    const spaceId1 = helper.spaces[0].entityId;
    const spaceId2 = helper.spaces[1].entityId;
    // speficies how many shares should be created for particular space
    const perSpace = {
      [spaceId1]: 5,
      [spaceId2]: 50,
    };
    await helper.givenShares({
      perSpace,
    });
    await helper.givenSimpleSpaceShareList();
    const getSpaceShareListSpy = sinon.spy(
      helper.getService('shareManager'),
      'getSpaceShareList'
    );

    // --- when ---
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize: 10,
      startIndex: 0,
      endIndex: 9,
    });
    await this.chunksArray.initialLoad;
    getSpaceShareListSpy.resetHistory();
    this.chunksArray.setIndices(3, 12);
    await settled();

    // --- then ---
    // In the first fetch, we shoul use 5 shares from first space (all of them)
    // and 5 shares from second space (5 shares were not used).
    // So the next fetch should use 5 not-used spaces and fetch next chunk, but decreased
    // by cached elements (10 - 5 = 5).

    // Note, that call count is after fetch next after spy history reset,
    // so we check only fetchNext calls.
    expect(getSpaceShareListSpy).to.have.callCount(1);
    expect(getSpaceShareListSpy).to.have.been.calledWith(
      spaceId2,
      sinon.match({
        // share no. 9 - because in first fetch we got 10 shares (share-00..share-09)
        index: Helper.generateShareName(helper.spaces[1], 9),
        // the last request fetched already elements 0..9, we start from item 4, so now we need only 10..15
        limit: 5,
        // when using cache, the offset is increased by 1
        offset: 1,
      }),
    );

    // check if final array has proper elements
    const array = this.chunksArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
      _.times(perSpace[space.entityId]).map(i => `${Helper.generateShareName(space, i)}`)
    ).flat().slice(3, 12);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  it('fetches lists which have been fetched before after using reload', async function () {
    // --- given ---
    const spacesCount = 2;
    const sharesPerSpace = 12;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: sharesPerSpace });
    await helper.givenSimpleSpaceShareList();
    const getSpaceShareListSpy = sinon.spy(
      helper.getService('shareManager'),
      'getSpaceShareList'
    );
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize: 10,
      startIndex: 0,
      endIndex: 10,
    });
    await this.chunksArray.initialLoad;
    // invoke second fetch
    this.chunksArray.setIndices(10, 20);
    await settled();
    // before reload, go back to the position, which needs only one fetch
    this.chunksArray.setIndices(0, 10);
    await settled();
    getSpaceShareListSpy.resetHistory();

    // --- when ---
    await this.chunksArray.scheduleReload();
    this.chunksArray.setIndices(10, 20);
    await settled();

    // --- then ---
    // Note, that call count is after fetch next after spy history reset,
    // so we check only fetchNext calls.
    // first 2 fetches - list for each space
    // second 2 fetched - after setting indices to (10, 20) for each space
    expect(getSpaceShareListSpy).to.have.callCount(4);

    // check if final array has proper elements
    const array = this.chunksArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
      _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
    ).flat().slice(10, 20);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  it('has expected content after initial jump', async function () {
    // --- given ---
    const spacesCount = 2;
    const sharesPerSpace = 12;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: sharesPerSpace });
    await helper.givenSimpleSpaceShareList();

    const sortedShareIndexes = _.sortBy(helper.shareRecords.map(s => s.index));

    // --- when ---
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize: 10,
      // 12th share on the list
      initialJumpIndex: sortedShareIndexes[12],
    });
    await this.chunksArray.initialLoad;

    // --- then ---
    // check if final array has proper elements
    const array = this.chunksArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
      _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
    ).flat().slice(12);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  it('has expected content when sliding range prev after initial jump', async function () {
    // --- given ---
    const spacesCount = 2;
    const sharesPerSpace = 12;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: sharesPerSpace });
    await helper.givenSimpleSpaceShareList();

    const sortedShareIndexes = _.sortBy(helper.shareRecords.map(s => s.index));

    // --- when ---
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize: 10,
      // 12th share on the list
      initialJumpIndex: sortedShareIndexes[12],
    });
    await this.chunksArray.initialLoad;
    this.chunksArray.scheduleTask('fetchPrev');
    await settled();
    // added 10 new elements (fetchPrev using chunkSize)
    this.chunksArray.setIndices(0, 10);
    await settled();

    // --- then ---
    // check if final array has proper elements
    const array = this.chunksArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
        _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
      )
      .flat()
      // slice 2..12 because we started from jump to 12 and then fetched prev 10 elements
      .slice(2, 12);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  it('does not query source arrays on fetch prev that have been runned out', async function () {
    // --- given ---
    const spacesCount = 2;
    const chunkSize = 10;
    // more than 1 chunk, but less than 2 chunks
    const sharesPerSpace = (chunkSize - 1) * 2;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: sharesPerSpace });
    await helper.givenSimpleSpaceShareList();
    const getSpaceShareListSpy = sinon.spy(
      helper.getService('shareManager'),
      'getSpaceShareList'
    );
    const sortedShareIndexes = _.sortBy(helper.shareRecords.map(s => s.index));
    // middle of the space1 shares list
    const initialPosition = 1.5 * sharesPerSpace;
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize,
      initialJumpIndex: sortedShareIndexes[initialPosition],
    });
    await this.chunksArray.initialLoad;
    await this.chunksArray.scheduleTask('fetchPrev');
    getSpaceShareListSpy.resetHistory();
    // The first fetchPrev should load 10 items from each space shares list
    // but only 10 from single space should be used to populate the array.

    // --- when ---
    this.chunksArray.setIndices(0, 10);
    this.chunksArray.scheduleTask('fetchPrev');
    await settled();

    // --- then ---
    // Second fetchPrev should query backend only for space that was not runned-out at
    // previous queries.
    expect(getSpaceShareListSpy).to.have.been.calledOnce;
    expect(getSpaceShareListSpy).to.have.been.calledWith(
      helper.spaces[0].entityId,
      sinon.match({
        index: helper.shareRecords[initialPosition - chunkSize].index,
        limit: chunkSize,
        offset: -chunkSize,
      })
    );

    // check if final source array has proper elements (do not matter about current chunk)
    const array = this.chunksArray.sourceArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
        _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
      )
      .flat()
      // source array content
      .slice(initialPosition - 2 * chunkSize, initialPosition + chunkSize);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  /**
   * Handles sitution when we have more spaces than shares fetch size. It causes the
   * ShareListFetcherToolkit to lookup cache multiple times, but not using it. Successive
   * fetches:
   *
   * 1. Each space shares list cache is created (with single share).
   * 2. It lookups to cache and should use it, but the result is not used in final array.
   * 3. It lookups to cache and should use it and the result should be used in final
   *    array.
   *
   * It is important to preserve cache until pt. 3 is done.
   */
  it('preserves cache of single space list fetcher to be used multiple times', async function () {
    // given
    const spacesCount = 100;
    const helper = new Helper(this);
    await helper.givenUser();
    await helper.givenSpaces({ spacesCount });
    await helper.givenShares({ perSpace: 1 });
    await helper.givenSimpleSpaceShareList();
    this.chunksArray = SharesChunksArray.create({
      ownerSource: this.owner,
      chunkSize: 10,
    });
    await this.chunksArray.initialLoad;

    // when
    this.chunksArray.setIndices(10, 20);
    await settled();
    this.chunksArray.setIndices(20, 30);
    await settled();

    // then
    const array = this.chunksArray.sourceArray.toArray();
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
        `${Helper.generateShareName(space, 0)}`
        // source array content
      )
      .slice(0, 30);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });
});

class Helper {
  static generateSpaceName(i) {
    return `space${String(i).padStart(2, '0')}`;
  }

  static generateShareName(space, i) {
    return `${space.name}-share${String(i).padStart(3, '0')}`;
  }

  /**
   * @param {Mocha.Context} mochaContext
   */
  constructor(mochaContext) {
    /** @type {Mocha.Context} */
    this.mochaContext = mochaContext;
  }

  get store() {
    return this.getService('store');
  }

  getService(serviceName) {
    return lookupService(this.mochaContext, serviceName);
  }

  async givenUser() {
    if (this.user) {
      throw new Error('mock: user already initialized');
    }

    this.user = await this.store.createRecord('user', {});
    const currentUserService = lookupService(this.mochaContext, 'currentUser');
    const userProxy = promiseObject((async () => this.user)());
    defineProperty(currentUserService, 'userProxy', {
      get() {
        return userProxy;
      },
    });
  }

  async givenSpaces({ spacesCount }) {
    if (!this.user) {
      throw new Error('mock: user not initialized');
    }
    if (this.spaces) {
      throw new Error('mock: spaces already initialized');
    }

    const spaceNames = _.times(spacesCount, i => Helper.generateSpaceName(i));
    const spacePromises = spaceNames.map(name => {
      return this.store.createRecord('space', {
        name,
      }).save();
    });
    this.spaces = await allFulfilled(spacePromises);
    const spaceList = await this.store.createRecord('spaceList', {
      list: this.spaces,
    }).save();
    this.user.set('spaceList', spaceList);
  }

  async givenShares({ perSpace } = { perSpace: 1 }) {
    if (this.shareItems) {
      throw new Error('mock: shareItems already initialized');
    }

    if (!this.spaces) {
      throw new Error('mock: spaces not initialized');
    }

    this.shareItems = this.spaces.map(space => {
      let sharesCount;
      if (typeof perSpace === 'number') {
        sharesCount = perSpace;
      } else if (typeof perSpace === 'object') {
        sharesCount = perSpace[space.entityId];
      }
      if (sharesCount === undefined) {
        sharesCount = 1;
      }
      return _.times(sharesCount).map(i => this.createSpaceSidebarItem(space, i));
    }).flat();

    this.shareRecords = await allFulfilled(this.shareItems.map(shareItem => {
      const { index, name, spaceId, shareId } = shareItem;
      const space = this.spaces.find(space => space.entityId === spaceId);
      const id = gri({
        entityType: shareEntityType,
        entityId: shareId,
        aspect: 'instance',
      });
      const share = this.store.createRecord('share', { id, index, name, space });
      return share.save();
    }));
  }

  async givenSimpleSpaceShareList() {
    if (!this.shareItems) {
      throw new Error('mock: shareItems not initialized');
    }

    const shareManager = this.getService('shareManager');
    const helper = this;
    async function getSpaceShareList(spaceId, { index, limit, offset }) {
      const shareItems = helper.shareItems.filter(shareItem =>
        shareItem.spaceId === spaceId
      );
      const itemsSorted = _.sortBy(shareItems, 'index');
      const startPosition = getIndexedListPosition(itemsSorted, index) + offset;
      const endPosition = startPosition + limit;
      const itemsLimited = itemsSorted.slice(Math.max(startPosition, 0), endPosition);
      return {
        array: itemsLimited,
        isLast: endPosition > itemsSorted.length,
      };
    }
    shareManager.getSpaceShareList = getSpaceShareList;
  }

  /**
   * @private
   * @param {Models.Space} space
   * @param {number} i
   * @returns {Object}
   */
  createSpaceSidebarItem(space, i) {
    const index = Helper.generateShareName(space, i);
    const spaceId = space.entityId;
    return { shareId: `sh-sp${spaceId}-i${i}`, index, name: index, spaceId };
  }
}
