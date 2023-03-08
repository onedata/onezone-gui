/**
 * View-Model for displaying info about single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed } from '@ember/object';
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

  /**
   * @type {ComputedProperty<boolean|null>}
   */
  isAccessGranted: reads('isAccessGrantedProxy.content'),

  isAccessGrantedProxy: promise.object(computed(
    'marketplaceSpaceStatusProxy',
    async function isAccessGrantedProxy() {
      const status = await this.marketplaceSpaceStatusProxy;
      return status === MarketplaceSpaceStatus.Granted;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<SpaceMembershipRequestInfo>>}
   */
  requestInfo: promise.object(computed(
    'viewModel.spaceMembershipRequestsInfoProxy.content',
    function requestInfo() {
      const spaceMembershipRequestsInfo = this.viewModel.spaceMembershipRequestsInfoProxy;
      if (!spaceMembershipRequestsInfo) {
        return null;
      }
      return spaceMembershipRequestsInfo.pending[this.spaceId] ??
        spaceMembershipRequestsInfo.rejected[this.spaceId] ??
        null;
    }
  )),

  marketplaceSpaceStatusProxy: promise.object(computed(
    'spaceId',
    'viewModel.{userSpacesIdsProxy.content,spaceMembershipRequestsInfoProxy.content}',
    async function marketplaceSpaceStatusProxy() {
      // FIXME: może by to przerobić tak, żeby te poniższe dane były konieczne do
      // załadowania widoku nadrzędnego
      const [
        userSpacesIds,
        spaceMembershipRequestsInfo,
      ] = await allFulfilled([
        this.viewModel.userSpacesIdsProxy,
        this.viewModel.spaceMembershipRequestsInfoProxy,
      ]);
      if (userSpacesIds.includes(this.spaceId)) {
        return MarketplaceSpaceStatus.Granted;
      } else if (spaceMembershipRequestsInfo?.rejected?.[this.spaceId]) {
        const requestInfo = spaceMembershipRequestsInfo.rejected[this.spaceId];
        const lastActivity = requestInfo.lastActivity ?? 0;
        const minBackoff =
          this.spaceManager.marketplaceConfig.minBackoffAfterRejection ?? 0;
        const now = Date.now() / 1000;
        if (now < lastActivity + minBackoff) {
          return MarketplaceSpaceStatus.Visible;
        } else {
          return MarketplaceSpaceStatus.Rejected;
        }
      } else if (spaceMembershipRequestsInfo?.pending?.[this.spaceId]) {
        const requestInfo = spaceMembershipRequestsInfo.pending[this.spaceId];
        const lastActivity = requestInfo.lastActivity ?? 0;
        const minBackoff =
          this.spaceManager.marketplaceConfig.minBackoffBetweenReminders ?? 0;
        const now = Date.now() / 1000;
        if (now < lastActivity + minBackoff) {
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
