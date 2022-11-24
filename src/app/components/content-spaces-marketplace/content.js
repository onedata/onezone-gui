import { computed } from '@ember/object';
import Component from '@ember/component';
import { collect } from 'ember-awesome-macros';

export default Component.extend({
  globalActions: collect('advertiseBtn'),

  viewModel: undefined,

  advertiseBtn: computed('advertiseBtn', function advertiseBtn() {
    return {
      title: 'Advertise your space',
      buttonStyle: 'default',
      icon: 'add-filled',
      action: () => {},
    };
  }),
});
