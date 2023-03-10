/**
 * View-Model for displaying info about single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';

/**
 * @typedef {'visible'|'pending'|'granted'|'outdated'|'rejected'} MarketplaceSpaceStatus
 */

/**
 * @type {Object<string, MarketplaceSpaceStatus>}
 */
export const MarketplaceSpaceStatus = Object.freeze({
  Visible: 'visible',
  Pending: 'pending',
  Granted: 'granted',
  Outdated: 'outdated',
  Rejected: 'rejected',
});

export default EmberObject.extend({
  /**
   * @virtual
   * @type {Models.SpaceMarketplaceInfo}
   */
  spaceMarketplaceInfo: undefined,

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * Index for infinite scroll.
   * @type {string}
   */
  index: reads('spaceMarketplaceInfo.index'),

  name: reads('spaceMarketplaceInfo.name'),
  organizationName: reads('spaceMarketplaceInfo.organizationName'),
  description: reads('spaceMarketplaceInfo.description'),
  tags: reads('spaceMarketplaceInfo.tags'),
  creationTime: reads('spaceMarketplaceInfo.creationTime'),
  totalSupportSize: reads('spaceMarketplaceInfo.totalSupportSize'),
  providerNames: reads('spaceMarketplaceInfo.providerNames'),
  spaceId: reads('spaceMarketplaceInfo.entityId'),

  /**
   * Implements id property used by `Utils.InfiniteScroll.ScrollHandler`.
   * @type {ComputedProperty<string>}
   */
  id: reads('spaceId'),

  isAccessGrantedProxy: promise.object(computed(
    'marketplaceSpaceStatusProxy.content',
    async function isAccessGrantedProxy() {
      const status = await this.marketplaceSpaceStatusProxy;
      return status === MarketplaceSpaceStatus.Granted;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<{ requestInfo: SpaceMembershipRequestInfo, collectionName: 'pending'|'rejected'>>}
   */
  itemRequestInfoProxy: promise.object(computed(
    'spaceMembershipRequestsInfoProxy.content.{pending,rejected}',
    async function itemRequestInfoProxy() {
      const spaceMembershipRequestsInfo = await this.spaceMembershipRequestsInfoProxy;
      if (!spaceMembershipRequestsInfo) {
        return null;
      }

      /** @type {'pending'|'rejected'} */
      let collectionName = null;
      for (collectionName of ['pending', 'rejected']) {
        const requestInfo =
          get(spaceMembershipRequestsInfo, collectionName)?.[this.spaceId];
        if (requestInfo) {
          return {
            requestInfo,
            collectionName,
          };
        }
      }
      return null;
    }
  )),

  itemRequestInfo: reads('itemRequestInfoProxy.content'),

  userSpacesIdsProxy: reads('viewModel.userSpacesIdsProxy'),

  spaceMembershipRequestsInfoProxy: reads('viewModel.spaceMembershipRequestsInfoProxy'),

  marketplaceSpaceStatusProxy: promise.object(computed(
    'spaceId',
    'userSpacesIdsProxy.content',
    'itemRequestInfoProxy.content.lastActivity',
    async function marketplaceSpaceStatusProxy() {
      // FIXME: w praktyce uruchamia się wielokrotnie
      // FIXME: może by to przerobić tak, żeby te poniższe dane były konieczne do
      // załadowania widoku nadrzędnego
      const [
        itemRequestInfo,
        userSpacesIds,
      ] = await allFulfilled([
        this.itemRequestInfoProxy,
        this.userSpacesIdsProxy,
      ]);
      if (userSpacesIds.includes(this.spaceId)) {
        return MarketplaceSpaceStatus.Granted;
      } else if (itemRequestInfo?.collectionName === 'rejected') {
        const lastActivity = itemRequestInfo.requestInfo.lastActivity ?? 0;
        const minBackoff =
          this.viewModel.marketplaceConfig.minBackoffAfterRejection ?? 0;
        const now = Math.floor(Date.now() / 1000);
        if (lastActivity + minBackoff < now) {
          return MarketplaceSpaceStatus.Visible;
        } else {
          return MarketplaceSpaceStatus.Rejected;
        }
      } else if (itemRequestInfo?.collectionName === 'pending') {
        const lastActivity = itemRequestInfo.requestInfo.lastActivity ?? 0;
        const minBackoff =
          this.viewModel.marketplaceConfig.minBackoffBetweenReminders ?? 0;
        const now = Math.floor(Date.now() / 1000);
        if (lastActivity + minBackoff < now) {
          return MarketplaceSpaceStatus.Outdated;
        } else {
          return MarketplaceSpaceStatus.Pending;
        }
      } else {
        return MarketplaceSpaceStatus.Visible;
      }
    },
  )),
});
