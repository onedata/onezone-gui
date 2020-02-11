/**
 * A service which provides tokens manipulation functions ready to use for gui
 *
 * @module services/token-actions
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject as service } from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import CreateTokenLinkAction from 'onezone-gui/utils/token-actions/create-token-link-action';
import CreateTokenAction from 'onezone-gui/utils/token-actions/create-token-action';
import CleanObsoleteTokensAction from 'onezone-gui/utils/token-actions/clean-obsolete-tokens-action';

export default Service.extend(I18n, {
  tokenManager: service(),
  router: service(),
  guiUtils: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.tokenActions',

  createCreateTokenLinkAction(context) {
    return CreateTokenLinkAction.create({ ownerSource: this, context });
  },

  createCreateTokenAction(context) {
    return CreateTokenAction.create({ ownerSource: this, context });
  },

  createCleanObsoleteTokensAction(context) {
    return CleanObsoleteTokensAction.create({ ownerSource: this, context });
  },

  createGlobalActions(context) {
    return [
      this.createCreateTokenLinkAction(context),
      this.createCleanObsoleteTokensAction(context),
    ];
  },

  /**
   * @param {Models.Token} token
   * @returns {Promise}
   */
  deleteToken(token) {
    const {
      globalNotify,
      tokenManager,
    } = this.getProperties('globalNotify', 'tokenManager');

    return tokenManager.deleteToken(get(token, 'id'))
      .then(result => {
        globalNotify.success(this.t('tokenRemoveSuccess'));
        return result;
      })
      .catch(error => {
        globalNotify.backendError(this.t('removingToken'), error);
        throw error;
      });
  },
});
