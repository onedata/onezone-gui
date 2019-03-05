/**
 * A support page for space
 *
 * @module components/content-spaces-support
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { hash } from 'rsvp';
import { computed } from '@ember/object';

export default Component.extend(
  UserProxyMixin,
  I18n,
  createDataProxyMixin('supportToken'),
  createDataProxyMixin('tokens'), {
    currentUser: service(),
    globalNotify: service(),
    clusterManager: service(),

    i18nPrefix: 'components.contentSpacesSupport',

    /**
     * @type {models/Space}
     */
    space: undefined,

    lazyTokensProxy: computed('tokensProxy', function lazyTokensProxy() {
      return this.getTokensProxy();
    }),

    init() {
      this._super(...arguments);
      if (!this.get('tokensProxy')) {
        this.updateTokensProxy();
      }
    },

    /**
     * @override
     */
    fetchSupportToken() {
      return this.get('space').getInviteToken('provider');
    },

    /**
     * @override
     */
    fetchTokens() {
      return hash({
        supportToken: this.updateSupportTokenProxy(),
        onezoneRegistrationToken: this.get('clusterManager').getOnezoneRegistrationToken(),
      });
    },

    actions: {
      getNewSupportToken() {
        return this.updateSupportTokenProxy();
      },

      getNewTokens() {
        return this.updateTokensProxy();
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
