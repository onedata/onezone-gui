// FIXME: jsdoc

import Component from '@ember/component';
import { computed } from '@ember/object';
import { collect, conditional, or, not } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Component.extend(I18n, {
  classNames: ['row', 'content-row', 'header-row', 'hidden-xs', 'has-border'],

  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.contentHeader',

  someSpacesAvailable: not(or(
    'viewModel.entriesInitialLoad.isPending',
    'viewModel.noSpacesAvailable'
  )),

  // TODO: VFS-10263 make "Add your space" action available in mobile mode
  // FIXME: jeśli jest refresh, to nie powinno być globalActions tylko lokalna tablica
  globalActions: conditional(
    'someSpacesAvailable',
    collect('refreshAdvertisedSpacesListAction', 'chooseSpaceToAdvertiseAction'),
    // raw([]),
    collect('refreshAdvertisedSpacesListAction'),
  ),

  /**
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  chooseSpaceToAdvertiseAction: computed(function chooseSpaceToAdvertiseAction() {
    return this.spaceActions.createChooseSpaceToAdvertiseAction();
  }),

  refreshAdvertisedSpacesListAction: computed(
    'viewModel',
    function refreshAdvertisedSpacesListAction() {
      return Action.create({
        ownerSource: this,
        i18nPrefix: `${this.i18nPrefix}.refreshAdvertisedSpacesListAction`,
        className: 'refresh-advertised-spaces-list',
        icon: 'refresh',
        onExecute: async () => {
          // FIXME: animation like in file browser?
          const result = ActionResult.create();
          await result.interceptPromise(this.viewModel.refreshList());
          return result;
        },
      });
    }
  ),
});
