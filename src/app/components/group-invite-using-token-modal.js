/**
 * Shows modal presenting group invitation token from passed group
 *
 * @module components/group-invite-using-token-modal
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
  i18nPrefix: 'components.groupInviteUsingTokenModal',

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
   * Group for which invitation token will be generated
   * @type {Group}
   * @virtual
   */
  group: undefined,

  /**
   * @type {PromiseObject<string>}
   */
  tokenProxy: undefined,

  openedObserver: observer('opened', function openedObserver() {
    this.loadToken();
  }),

  /**
   * Loads token
   * @returns {undefined}
   */
  loadToken() {
    const group = this.get('group');
    this.set('tokenProxy', group ?
      PromiseObject.create({
        promise: group.getInviteToken('group'),
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
