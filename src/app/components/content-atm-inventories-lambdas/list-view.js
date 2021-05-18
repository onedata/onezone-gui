/**
 * Lists lambdas. It is a whole view component - may be used for
 * a full page carousel.
 *
 * @module components/content-atm-inventories-lambdas/list-view
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed, get } from '@ember/object';
import { bool } from '@ember/object/computed';
import { collect } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-lambdas-list-view'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.listView',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Function}
   */
  onAddAtmLambda: notImplementedIgnore,

  /**
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmLambda>>}
   */
  atmLambdasProxy: promise.array(
    computed('atmInventory', function atmLambdas() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      return get(atmInventory, 'atmLambdaList')
        .then(atmLambdaList => get(atmLambdaList, 'list'));
    })
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageLambdasPrivilege: bool('atmInventory.privileges.manageLambdas'),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  addNewAtmLambdaAction: computed(
    'hasManageLambdasPrivilege',
    function addNewAtmLambdaAction() {
      const {
        hasManageLambdasPrivilege,
        i18n,
      } = this.getProperties('hasManageLambdasPrivilege', 'i18n');
      return {
        action: () => this.get('onAddAtmLambda')(),
        title: this.t('addAtmLambdaButton'),
        class: 'open-add-atm-lambda-trigger',
        disabled: !hasManageLambdasPrivilege,
        tip: hasManageLambdasPrivilege ? undefined : insufficientPrivilegesMessage({
          i18n,
          modelName: 'atmInventory',
          privilegeFlag: 'atm_inventory_manage_lambdas',
        }),
        icon: 'add-filled',
      };
    }
  ),

  /**
   * @override
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  globalActions: collect('addNewAtmLambdaAction'),

  init() {
    this._super(...arguments);
    this.registerViewActions();
  },

  registerViewActions() {
    const {
      onRegisterViewActions,
      globalActions,
    } = this.getProperties('onRegisterViewActions', 'globalActions');

    onRegisterViewActions(globalActions);
  },
});
