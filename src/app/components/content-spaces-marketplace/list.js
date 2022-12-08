import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend({
  spaceItems: undefined,

  viewModel: undefined,

  // FIXME: sorting
  filteredCollection: reads('viewModel.filteredCollection'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this.viewModel, 'changeSearchValue', newValue, typingActionDebouce);
    },
  },
});
