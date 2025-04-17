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
    const array = this.chunksArray.toArray();

    // --- then ---
    // Note, that call count is after fetch next after spy history reset,
    // so we check only fetchNext calls.
    expect(getSpaceShareListSpy).to.have.callCount(0);

    // check if final array has proper elements
    const arrayShareNames = array.map(share => share.name);
    const allExpectedShareNames = helper.spaces.map(space =>
      _.times(sharesPerSpace).map(i => `${Helper.generateShareName(space, i)}`)
    ).flat().slice(2, 7);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.sortBy(allExpectedShareNames)
    );
  });

  // FIXME: niesymetryczne tablice:
  // space1: 0,1,2,3,4
  // space2: 0,1,2,3,4,5,... 49
  // pobieramy 10 elementów: wysycimy 1: 0-4, 2: 0-9; potem przesuwamy tablicę: 3-13; powinno pobrać dodatkowe elementy tylko z drugiej
  // i to powinno pobrać od indeksu: 9 z size 3

  // FIXME: test działania zawartości back: initialJumpIndex, następnie idziemy do początku i badamy czy będą dobre wpisy

  // FIXME: test działania użycia cache back: initialJumpIndex, następnie do tyłu, pobierze coś, potem jescze raz do tyłu i powinno użyć samych cache (podobny s1-sh1, s1-sh2 itd. najpierw lista z jednego, potem drugiego)
  // FIXME: jw. tylko niech będą naprzemienne shery

  // FIXME: test działania reload: po reloadzie powinno pobierać wszystko o nowa
});

class Helper {
  static generateSpaceName(i) {
    return `space-${String(i).padStart(2, '0')}`;
  }

  static generateShareName(space, i) {
    return `${space.name}-share-${String(i).padStart(3, '0')}`;
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
      return _.times(perSpace).map(i => this.createSpaceSidebarItem(space, i));
    }).flat();

    await allFulfilled(this.shareItems.map(shareItem => {
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
      // FIXME: implementacja i przetestowanie obsługi indeksu, który nie istnieje, ale jest pomiędzy
      const position = getIndexedListPosition(itemsSorted, index) + offset;
      const itemsLimited = itemsSorted.slice(position, limit);
      return {
        array: itemsLimited,
        isLast: true,
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
