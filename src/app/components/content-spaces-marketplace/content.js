import { computed } from '@ember/object';
import Component from '@ember/component';
import { collect } from 'ember-awesome-macros';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, GlobalActions, {
  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.content',

  // FIXME: this does not work, consult; add globalActionsTitle
  /**
   * @override
   */
  globalActions: collect('chooseSpaceToAdvertiseAction'),

  viewModel: undefined,

  chooseSpaceToAdvertiseAction: computed(function chooseSpaceToAdvertiseAction() {
    return this.spaceActions.createChooseSpaceToAdvertiseAction();
  }),
});
