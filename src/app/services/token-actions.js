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
import $ from 'jquery';
import OpenCreateTokenViewAction from 'onezone-gui/utils/token-actions/open-create-token-view-action';
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

  createOpenCreateTokenViewAction(context) {
    return OpenCreateTokenViewAction.create({ ownerSource: this, context });
  },

  createCleanObsoleteTokensAction(context) {
    return CleanObsoleteTokensAction.create({ ownerSource: this, context });
  },

  createGlobalActions(context) {
    return [
      this.createOpenCreateTokenViewAction(context),
      this.createCleanObsoleteTokensAction(context),
    ];
  },

  /**
   * Creates token
   * @param {Object} tokenPrototype token model prototype
   * @returns {Promise} A promise, which resolves to new token if it has
   * been created successfully.
   */
  createToken(tokenPrototype) {
    const {
      globalNotify,
      router,
      tokenManager,
      guiUtils,
    } = this.getProperties(
      'globalNotify',
      'router',
      'tokenManager',
      'guiUtils'
    );
    return tokenManager.createToken(tokenPrototype).then((token) => {
      globalNotify.success(this.t('tokenCreateSuccess'));
      router.transitionTo(
        'onedata.sidebar.content',
        'tokens',
        guiUtils.getRoutableIdFor(token)
      );
      // TODO: instead that, always scroll to sidebar position on changing
      // sidebar chosen item
      $('.col-sidebar').scrollTop(0);
    }).catch(error => {
      globalNotify.backendError(this.t('tokenCreation'), error);
      throw error;
    });
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
