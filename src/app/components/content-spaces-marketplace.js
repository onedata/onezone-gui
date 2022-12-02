import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';
import { isEmpty, promise } from 'ember-awesome-macros';
import { exampleMarkdownShort, exampleMarkdownLong } from 'onezone-gui/utils/mock-data';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['content-spaces-marketplace'],
  isEmpty: isEmpty('spaceItems'),

  spaceManager: service(),

  // FIXME: create spacesMarketplaceViewModel

  // FIXME: fake generator used, only static list
  spaceItemsProxy: promise.object(computed(function spaceItemsProxy() {
    return this.spaceManager.getSpacesMarketplaceData();
  })),

  spaceItems: reads('spaceItemsProxy.content'),

  viewModel: computed('spaceItems', function spaceItems() {
    return {
      spaceItems: this.spaceItems,
    };
  }),
});
