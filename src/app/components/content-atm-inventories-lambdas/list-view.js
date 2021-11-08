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
import { bool, collect } from '@ember/object/computed';
import { promise, conditional, eq, raw } from 'ember-awesome-macros';
import { resolve } from 'rsvp';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-lambdas-list-view'],

  i18n: service(),
  workflowManager: service(),

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
   * Needed when `mode` is `'presentation'`
   * @virtual optional
   * @type {Function}
   */
  onAddAtmLambda: notImplementedIgnore,

  /**
   * Needed when `mode` is `'selection'`
   * @virtual optional
   * @type {Function}
   * @param {Model.AtmLambda}
   * @returns {any}
   */
  onAddToAtmWorkflowSchema: notImplementedIgnore,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, revisionNumber: Number) => void}
   */
  onRevisionClick: undefined,

  /**
   * @virtual
   * @type {(atmLambda: Models.AtmLambda, originRevisionNumber: Number) => void}
   */
  onRevisionCreate: undefined,

  /**
   * Needed when `mode` is `'selection'`
   * @virtual optional
   * @type {Function}
   */
  onBackSlide: notImplementedIgnore,

  /**
   * @virtual
   * @type {Boolean}
   */
  onRegisterViewActions: notImplementedIgnore,

  /**
   * One of: `'presentation'`, `'selection'`
   * @virtual optional
   * @type {String}
   */
  mode: 'presentation',

  /**
   * @type {ComputedProperty<String>}
   */
  headerText: computed('mode', function headerText() {
    const mode = this.get('mode');
    return this.t(`header.${mode === 'selection' ? 'selection' : 'presentation'}`);
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmLambda>>}
   */
  atmLambdasProxy: promise.array(
    computed('atmInventory.privileges.view', async function atmLambdas() {
      const atmInventory = this.get('atmInventory');
      if (!atmInventory) {
        return resolve([]);
      }
      if (!get(atmInventory, 'privileges.view')) {
        throw { id: 'forbidden' };
      }
      const atmLambdaList = await get(atmInventory, 'atmLambdaList');
      return atmLambdaList ? (await get(atmLambdaList, 'list')) : [];
    })
  ),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmLambda>>}
   */
  allAtmLambdasProxy: computed('mode', function allAtmLambdasProxy() {
    const {
      mode,
      workflowManager,
    } = this.getProperties('mode', 'workflowManager');

    if (mode === 'selection') {
      // Only in selection mode we need to fetch all lambdas
      return workflowManager.getAllKnownAtmLambdas();
    }
    return promiseArray(resolve([]));
  }),

  /**
   * @type {ComputedProperty<PromiseObject>}
   */
  loadingDataProxy: promise.object(promise.all(
    'atmLambdasProxy',
    'allAtmLambdasProxy'
  )),

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
   * @type {ComputedProperty<Boolean>}
   */
  hasSomeLambdas: conditional(
    eq('mode', raw('selection')),
    'allAtmLambdasProxy.content.length',
    'atmLambdasProxy.content.length'
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

  actions: {
    backSlide() {
      this.get('onBackSlide')();
    },
  },
});
