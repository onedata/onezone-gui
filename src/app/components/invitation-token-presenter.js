/**
 * A component that provides invitation token generation functionality.
 *
 * @module components/invitation-token-presenter
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  classNames: [
    'invitation-token-presenter',
    'row',
    'content-row',
    'token-row',
    'has-border',
  ],

  /**
   * @override
   */
  i18nPrefix: 'components.invitationTokenPresenter',

  /**
   * @type {PromiseProxy<string>}
   * @virtual
   */
  tokenProxy: undefined,

  /**
   * One of `user`, `group`
   * @type {string}
   * @virtual
   */
  tokenType: undefined,

  /**
   * @type {function}
   * @returns {undefined}
   * @virtual
   */
  generateToken: notImplementedThrow,

  /**
   * @type {function}
   * @returns {undefined}
   * @virtual
   */
  close: notImplementedThrow,

  actions: {
    copyTokenSuccess() {
      this.get('globalNotify').info(this.t('copyTokenSuccess'));
    },
    copyTokenError() {
      this.get('globalNotify').info(this.t('copyTokenError'));
    },
  },
});
