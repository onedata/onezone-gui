import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import EmberObject, { computed } from '@ember/object';
import { isEmpty, promise, collect } from 'ember-awesome-macros';
import { exampleMarkdownShort, exampleMarkdownLong } from 'onezone-gui/utils/mock-data';
import { inject as service } from '@ember/service';
import SpacesMarketplaceViewModel from 'onezone-gui/utils/spaces-marketplace-view-model';

export default Component.extend({
  classNames: ['content-spaces-marketplace'],

  isEmpty: reads('viewModel.isEmpty'),

  viewModel: computed(function viewModel() {
    return SpacesMarketplaceViewModel.create({
      ownerSource: this,
    });
  }),
});
