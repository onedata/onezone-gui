/**
 * A support page for space
 *
 * @module components/content-spaces-support
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(UserProxyMixin, I18n, {
  currentUser: inject(),
  globalNotify: inject(),

  i18nPrefix: 'components.contentSpacesSupport',

  /**
   * @type {models/Space}
   */
  space: undefined,

  /**
   * Resolves with support token, can be updated with `_updateSupportToken`
   * @type {PromiseObject<string>}
   */
  supportTokenProxy: undefined,

  init() {
    this._super(...arguments);
    if (!this.get('supportTokenProxy')) {
      this._updateSupportToken();
    }
  },

  _getNewSupportToken() {
    return this.get('space')
      .getInvitationToken('provider')
      .then(({ data }) => data);
  },

  _updateSupportToken() {
    const promise = this._getNewSupportToken();
    return this.set(
      'supportTokenProxy',
      PromiseObject.create({ promise })
    );
  },

  actions: {
    getNewSupportToken() {
      return this._updateSupportToken();
    },

    /**
     * @param {string} type one of: token, command
     * @returns {undefined}
     */
    copySuccess(type) {
      this.get('globalNotify').info(this.t(`copy.${type}.success`));
    },

    /**
     * @param {string} type one of: token, command
     * @returns {undefined}
     */
    copyError(type) {
      this.get('globalNotify').info(this.t(`copy.${type}.error`));
    },
  },
});
