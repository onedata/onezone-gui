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
    const store = lookupService(this, 'store');
    const shareManager = lookupService(this, 'shareManager');
    const user = await store.createRecord('user', {});
    const currentUserService = lookupService(this, 'currentUser');
    const userProxy = promiseObject((async () => user)());
    defineProperty(currentUserService, 'userProxy', {
      get() {
        return userProxy;
      },
    });
    const spaceNames = _.times(spacesCount, i => `space-${i}`);
    const spacePromises = spaceNames.map(name => {
      return store.createRecord('space', {
        name,
      }).save();
    });
    const spaces = await allFulfilled(spacePromises);
    const shareItems = spaces.map(space => {
      const index = `${space.name}-share`;
      const spaceId = space.entityId;
      return { shareId: `sh${spaceId}`, index, name: index, spaceId };
    });
    await allFulfilled(shareItems.map(shareItem => {
      const { index, name, spaceId, shareId } = shareItem;
      const space = spaces.find(space => space.entityId === spaceId);
      const id = gri({
        entityType: shareEntityType,
        entityId: shareId,
        aspect: 'instance',
      });
      const share = store.createRecord('share', { id, index, name, space });
      return share.save();
    }));
    async function getSpaceShareList(spaceId, /* { index, limit, offset } */ ) {
      const shareItem = shareItems.find(shareItem => shareItem.spaceId === spaceId);
      return {
        array: [shareItem],
        isLast: true,
      };
    }
    shareManager.getSpaceShareList = getSpaceShareList;
    // sinon.stub(shareManager, 'getSpaceShareList').callsFake(getSpaceShareList);
    const spaceList = await store.createRecord('spaceList', {
      list: spaces,
    }).save();
    user.set('spaceList', spaceList);

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
});
