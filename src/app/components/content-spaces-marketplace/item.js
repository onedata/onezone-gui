import Component from '@ember/component';
import { computed } from '@ember/object';
import { array, raw } from 'ember-awesome-macros';

export default Component.extend({
  classNames: ['spaces-marketplace-item', 'iconified-block'],
  classNameBindings: ['spaceItem.isOwned:iconified-block-marketplace-owned:iconified-block-marketplace-available'],

  viewModel: undefined,

  spaceItem: undefined,

  isDescriptionExpanded: false,

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

  actions: {
    configureSpace() {},
    requestAccess() {},
    expandDescription() {
      this.set('isDescriptionExpanded', true);
    },
  },
});
