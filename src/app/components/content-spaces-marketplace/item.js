/**
 * Single space item in marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';

export default Component.extend(I18n, {
  tagName: 'li',
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: ['spaceItem.isOwned:iconified-block-marketplace-owned:iconified-block-marketplace-available'],
  attributeBindings: ['spaceId:space-id'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.item',

  router: service(),
  spaceActions: service(),
  providerManager: service(),

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  /**
   * @virtual
   * @type {SpaceMarketplaceData}
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

  isOwned: reads('spaceItem.isOwned'),

  spaceName: reads('spaceItem.name'),

  spaceId: reads('spaceItem.spaceId'),

  tags: computed('spaceItem.tags', function tags() {
    return this.spaceItem.tags.map(tagName => ({
      label: tagName,
    }));
  }),

  visitSpaceHref: computed('spaceItem.spaceId', function visitSpaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      this.spaceItem.spaceId,
      'index',
    );
  }),

  configureSpaceHref: computed('spaceItem.spaceId', function configureSpaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'spaces',
      this.spaceItem.spaceId,
      'configuration',
    );
  }),

  providersProxy: promise.object(computed(
    'spaceItem.providerIds',
    async function providersProxy() {
      const ids = this.spaceItem.providerIds;
      return allFulfilled(ids.map(entityId => {
        return this.providerManager.getRecordById(entityId);
      }));
    }
  )),

  providers: reads('providersProxy.content'),

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
