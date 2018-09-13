/**
 * Permissions presenter and editor for a collection of models. Yields list
 * when there are no items to present.
 *
 * @module components/collection-permissions
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedWarn from 'onedata-gui-common/utils/not-implemented-warn';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.collectionPermissions',

  /**
   * @type {Ember.A<PrivilegeModelProxy>}
   * @virtual
   */
  proxyList: undefined,

  /**
   * Type of model, which permissions are processed.
   * @virtual
   * @type {string}
   */
  subjectType: undefined,

  /**
   * Called after list item selection.
   * @virtual
   * @type {function}
   * @param {Array<PrivilegeModelProxy>} modelsProxies array of selected models
   * @returns {any}
   */
  modelsSelected: notImplementedWarn,

  /**
   * Header of the models list.
   * @virtual
   * @type {string}
   */
  listHeader: undefined,

  /**
   * Name of icon used for each list entry.
   * @virtual
   * @type {string}
   */
  itemIcon: undefined,

  /**
   * 1-level-nested tree with privileges. It should group privileges
   * into categories.
   * @type {Object}
   * @virtual
   */
  groupedPrivilegesFlags: Object.freeze({}),

  /**
   * Path to the translations with privilege groups names.
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations with privileges names.
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * Callback responsible for privileges persistence.
   * @type {function}
   * @param {PrivilegeModelProxy} modelProxy
   * @returns {Promise<PrivilegeModelProxy>}
   */
  save: notImplementedThrow,

  /**
   * @type {Array<Action>}
   */
  itemActions: undefined,

  actions: {
    reset(modelProxy) {
      modelProxy.resetModifications();
    },
  },
});
