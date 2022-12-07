import { computed } from '@ember/object';
import Component from '@ember/component';
import { collect } from 'ember-awesome-macros';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { inject as service } from '@ember/service';

export default Component.extend(GlobalActions, {
  spaceActions: service(),

  /**
   * @override
   */
  globalActions: collect('chooseSpaceToAdvertiseAction'),

  viewModel: undefined,

  chooseSpaceToAdvertiseAction: computed(function chooseSpaceToAdvertiseAction() {
    return this.spaceActions.createChooseSpaceToAdvertiseAction();
  }),
});
