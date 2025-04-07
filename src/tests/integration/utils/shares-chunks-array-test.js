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
    this.helper = new Helper(this);
    await this.helper.givenUser();
    await this.helper.givenSpaces({ spacesCount });
    await this.helper.givenShares();
    await this.helper.givenSimpleSpaceShareList();

    // when
    this.chunksArray = SharesChunksArray.create({ ownerSource: this.owner });
    await this.chunksArray.initialLoad;
    const array = this.chunksArray.toArray();

    // then
    const arrayShareNames = array.map(share => share.name);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.times(spacesCount, i => `${Helper.generateSpaceName(i)}-share`)
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

    // then 2 - check if spaces are properly sorted
    const arrayShareNames = this.chunksArray.map(share => share.name);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.times(spacesCount, i => `${Helper.generateSpaceName(i)}-share`)
    );
  });
});

class Helper {
  static generateSpaceName(i) {
    return `space-${String(i).padStart(2, '0')}`;
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

  async givenShares() {
    if (!this.spaces) {
      throw new Error('mock: spaces not initialized');
    }

    this.shareItems = this.spaces.map(space => {
      const index = `${space.name}-share`;
      const spaceId = space.entityId;
      return { shareId: `sh${spaceId}`, index, name: index, spaceId };
    });
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
    const shareManager = this.getService('shareManager');
    const helper = this;
    async function getSpaceShareList(spaceId, /* { index, limit, offset } */ ) {
      const shareItem = helper.shareItems.find(shareItem =>
        shareItem.spaceId === spaceId
      );
      return {
        array: [shareItem],
        isLast: true,
      };
    }
    shareManager.getSpaceShareList = getSpaceShareList;
  }
}
