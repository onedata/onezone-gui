// FIXME: jsdoc

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: ['spaceItem.isOwned:iconified-block-marketplace-owned:iconified-block-marketplace-available'],

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

  isRequested: false,

  isDescriptionExpanded: false,

  //#endregion

  isOwned: reads('spaceItem.isOwned'),

  spaceName: reads('spaceItem.name'),

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
      // try {
      const pro = await allFulfilled(ids.map(entityId => {
        return this.providerManager.getRecordById(entityId);
      }));
      // debugger;
      return pro;
      // } catch (error) {
      // debugger;
      // }

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
    expandDescription() {
      this.set('isDescriptionExpanded', true);
    },
  },
});
