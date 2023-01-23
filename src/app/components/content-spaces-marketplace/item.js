/**
 * Single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: [
    'isAccessGranted:iconified-block-marketplace-access-granted:iconified-block-marketplace-available'
  ],
  attributeBindings: ['spaceId:data-space-id'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.item',

  router: service(),
  spaceActions: service(),
  currentUser: service(),
  guiUtils: service(),

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * @virtual
   * @type {SpaceMarketplaceInfo}
   */
  spaceItem: undefined,

  //#region state

  /**
   * The access has been requested in current component instance.
   * It is stored as component state, because there is currently no such state in model.
   * @type {boolean}
   */
  isRequested: false,

  isDescriptionExpanded: false,

  //#endregion

  spaceName: reads('spaceItem.name'),

  spaceId: reads('spaceItem.entityId'),

  providerNames: reads('spaceItem.providerNames'),

  isAccessGranted: computed('userSpacesIds', function isAccessGranted() {
    return this.userSpacesIds.includes(this.spaceId);
  }),

  supportSize: reads('spaceItem.totalSupportSize'),

  organizationName: reads('spaceItem.organizationName'),

  tags: computed('spaceItem.tags', function tags() {
    return this.spaceItem.tags.map(tagName => ({
      label: tagName,
    }));
  }),

  userSpacesIds: computed(
    'currentUser.user.spaceList.content.list',
    function userSpacesIds() {
      // Both current and space list should be loaded before reaching spaces marketplace,
      // so do not care about async relationship loading.
      const currentUserRecord = this.currentUser.user;
      const userSpaces = get(currentUserRecord, 'spaceList.content.list').toArray();
      return userSpaces.map(space => get(space, 'entityId'));
    }
  ),

  visitSpaceHref: computed('spaceItem.entityId', function visitSpaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      this.guiUtils.getRoutableIdFor(this.spaceItem),
      'index',
    );
  }),

  configureSpaceHref: computed('spaceItem.entityId', function configureSpaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      this.guiUtils.getRoutableIdFor(this.spaceItem),
      'configuration',
    );
  }),

  actions: {
    requestAccess() {
      (async () => {
        const result = await this.spaceActions.createRequestSpaceAccessAction({
          spaceMarketplaceData: this.spaceItem,
        }).execute();
        if (result.status === 'done') {
          this.set('isRequested', true);
        }
      })();
    },
  },
});
