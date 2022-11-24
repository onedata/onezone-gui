import Component from '@ember/component';
import { reads } from '@ember/object/computed';

export default Component.extend({
  spaceItems: undefined,

  viewModel: undefined,

  // FIXME: sorting
  sortedCollection: reads('viewModel.spaceItems'),

  actions: {
    changeSearchValue() {
      // FIXME: implement
    },
  },
});
