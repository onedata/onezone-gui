/**
 * A modal for batch changing privileges.
 *
 * @module components/privileges-batch-edit-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.privilegesBatchEditModal',

  /**
   * @type {boolean}
   */
  modalActive: false,

  /**
   * Grouped privileges used to construct tree nodes.
   * @type {Array<Object>}
   */
  privilegesGroups: Object.freeze([]),

  /**
   * Path to the translations of privilege groups names.
   * @type {string}
   */
  privilegeGroupsTranslationsPath: undefined,

  /**
   * Path to the translations of privileges names.
   * @type {string}
   */
  privilegesTranslationsPath: undefined,

  /**
   * Model with privileges.
   * @type {PrivilegesModelProxy}
   */
  modelProxy: Object.freeze({}),

  /**
   * @type {function}
   * @returns {Promise}
   */
  save: notImplementedThrow,

  /**
   * @type {function}
   * @returns {undefined}
   */
  close: notImplementedThrow,
});
