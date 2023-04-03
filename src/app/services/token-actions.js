/**
 * A service which provides tokens manipulation functions ready to use for gui
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import {
  default as Service,
  inject as service,
} from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OpenCreateTokenViewAction from 'onezone-gui/utils/token-actions/open-create-token-view-action';
import CreateTokenAction from 'onezone-gui/utils/token-actions/create-token-action';
import ModifyTokenAction from 'onezone-gui/utils/token-actions/modify-token-action';
import CleanObsoleteTokensAction from 'onezone-gui/utils/token-actions/clean-obsolete-tokens-action';
import GenerateInviteTokenAction from 'onezone-gui/utils/token-actions/generate-invite-token-action';
import OpenConsumeTokenViewAction from 'onezone-gui/utils/token-actions/open-consume-token-view-action';
import ConsumeInviteTokenAction from 'onezone-gui/utils/token-actions/consume-invite-token-action';

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

  createOpenCreateTokenViewAction(context) {
    return OpenCreateTokenViewAction.create({ ownerSource: this, context });
  },

  createCreateTokenAction(context) {
    return CreateTokenAction.create({ ownerSource: this, context });
  },

  createModifyTokenAction(context) {
    return ModifyTokenAction.create({ ownerSource: this, context });
  },

  createCleanObsoleteTokensAction(context) {
    return CleanObsoleteTokensAction.create({ ownerSource: this, context });
  },

  createGenerateInviteTokenAction(context) {
    return GenerateInviteTokenAction.create({ ownerSource: this, context });
  },

  createOpenConsumeTokenViewAction(context) {
    return OpenConsumeTokenViewAction.create({ ownerSource: this, context });
  },

  createConsumeInviteTokenAction(context) {
    return ConsumeInviteTokenAction.create({ ownerSource: this, context });
  },

  createGlobalActions(context) {
    return [
      this.createOpenCreateTokenViewAction(context),
      this.createCleanObsoleteTokensAction(context),
      this.createOpenConsumeTokenViewAction(context),
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
