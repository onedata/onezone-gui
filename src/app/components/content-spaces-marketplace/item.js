import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { array, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: ['spaceItem.isOwned:iconified-block-marketplace-owned:iconified-block-marketplace-available'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.item',

  router: service(),
  spaceActions: service(),

  //#region state

  isRequested: false,

  //#endregion

  viewModel: undefined,

  spaceItem: undefined,

  isDescriptionExpanded: false,

  isOwned: reads('spaceItem.isOwned'),

  tagsString: array.join('spaceItem.tags', raw(', ')),

  supportingProvidersTags: computed(
    'spaceItem.supportingProviders',
    function supportingProvidersTags() {
      return [
        { icon: 'support', label: '3 TiB' },
        { icon: 'provider', label: 'Kraków' },
        { icon: 'provider', label: 'Paris' },
      ];
    }
  ),

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
      // FIXME: change into disabled button
    },
    expandDescription() {
      this.set('isDescriptionExpanded', true);
    },
  },
});
