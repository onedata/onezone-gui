/**
 * Shows modal presenting group/user invitation token for passed record.
 *
 * @module components/invite-using-token-modal
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  tagName: '',

  groupManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.inviteUsingTokenModal',

  /**
   * If true, modal is opened
   * @type {boolean}
   * @virtual
   */
  opened: false,

  /**
   * Action called to close modal
   * @type {function}
   * @virtual
   * @returns {*}
   */
  close: notImplementedThrow,

  /**
   * Record for which invitation token will be generated
   * @type {Group}
   * @virtual
   */
  record: undefined,

  /**
   * One of 'user', 'group', null
   * @type {string|null}
   */
  tokenType: 'group',

  /**
   * @type {PromiseObject<string>}
   */
  tokenProxy: undefined,

  tokenLoadingObserver: observer(
    'opened',
    'tokenType',
    function tokenLoadingObserver() {
      if (this.get('opened')) {
        this.loadToken();
      }
    }
  ),

  /**
   * Loads token
   * @returns {undefined}
   */
  loadToken() {
    const {
      record,
      tokenType,
    } = this.getProperties('record', 'tokenType');
    this.set('tokenProxy', (record && tokenType) ?
      PromiseObject.create({
        promise: record.getInviteToken(tokenType),
      }) : null
    );
  },

  actions: {
    copyTokenSuccess() {
      this.get('globalNotify').info(this.t('copyTokenSuccess'));
    },
    copyTokenError() {
      this.get('globalNotify').info(this.t('copyTokenError'));
    },
    generateToken() {
      this.loadToken();
    },
  },
});
