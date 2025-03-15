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
    await this.helper.given({ spacesCount });

    // when
    this.chunksArray = SharesChunksArray.create({ ownerSource: this.owner });
    await this.chunksArray.initialLoad;
    const array = this.chunksArray.toArray();

    // then
    const arrayShareNames = array.map(share => share.name);
    expect(arrayShareNames, arrayShareNames.join(',')).to.deep.equal(
      _.times(spacesCount, i => `space-${i}-share`)
    );
  });

  // FIXME:
  // it('changes progress from 0 to 0.1 when 1/10 of multi fetchers are done', async function () {
  //   // given
  //   const spacesCount = 9;
  //   this.helper = new Helper(this);
  //   await this.helper.given({ spacesCount });

  //   // when
  //   this.chunksArray = SharesChunksArray.create({ ownerSource: this.owner });
  //   await this.chunksArray.initialLoad;
  //   const array = this.chunksArray.toArray();
  // });
});

class Helper {
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

    const spaceNames = _.times(spacesCount, i => `space-${i}`);
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

  async given({ spacesCount }) {
    await this.givenUser();
    await this.givenSpaces({ spacesCount });
    await this.givenShares();
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
