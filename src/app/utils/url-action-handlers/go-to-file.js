/**
 * Implementation of "GoToFile" URL action runner and URL generator.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import globals from 'onedata-gui-common/utils/globals';
import cdmiObjectIdToGuid from 'onedata-gui-common/utils/cdmi-object-id-to-guid';
import { getSpaceIdFromGuid } from 'onedata-gui-common/utils/file-guid-parsers';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { get } from '@ember/object';
import Version from 'onedata-gui-common/utils/version';
import { findCurrentDefaultOneprovider } from 'onezone-gui/mixins/choose-default-oneprovider';
import EmberObject from '@ember/object';
import { inject as service } from '@ember/service';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import I18n from 'onedata-gui-common/mixins/components/i18n';

/**
 * @typedef {'show'|'download'} GoToFileUrlActionHandler.GoToFileActionType
 */

const mixins = [
  OwnerInjector,
  I18n,
];

export default EmberObject.extend(...mixins, {
  router: service(),
  recordManager: service(),
  alert: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.urlActionHandlers.goToFile',

  //#region configuration

  /**
   * @type {GoToFileUrlActionHandler.GoToFileActionType}
   */
  defaultFileAction: 'show',

  /**
   * @type {Array<GoToFileUrlActionHandler.GoToFileActionType>}
   */
  availableFileActions: Object.freeze(['show', 'download']),

  //#endregion

  // FIXME: handle not-happy-path (lack of params, etc.)
  // FIXME: być może handlować na podstawie samego transition (przenieść tutaj parser)
  /**
   * @param {string} fileId
   * @param {GoToFileUrlActionHandler.GoToFileActionType} fileAction
   * @param {Transition} transition
   */
  async handle({ fileId, fileAction, transition } = {}) {
    let effFileAction = fileAction;
    if (!this.availableFileActions.includes(effFileAction)) {
      effFileAction = this.defaultFileAction;
    }
    const fileGuid = cdmiObjectIdToGuid(fileId);
    const spaceId = getSpaceIdFromGuid(fileGuid);
    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }

    let providerId;
    if (fileAction === 'download') {
      const minSupportedVersion = '21.02.3';
      // FIXME: handle errors
      const space = await this.recordManager.getRecordById('space', spaceId);
      const providerList = await get(space, 'providerList');
      const providers = (await get(providerList, 'list')).toArray();
      // Filter out providers that handle download link feature to prefer one of
      // these providers.
      const applicableProviders = providers.filter(provider => {
        return get(provider, 'online') &&
          Version.isRequiredVersion(get(provider, 'version'), minSupportedVersion);
      });
      const provider = findCurrentDefaultOneprovider(applicableProviders);
      if (provider) {
        providerId = get(provider, 'entityId');
      } else {
        this.alert.warning(
          this.t('downloadNotSupported', { version: minSupportedVersion })
        );
      }
    }

    const aspectOptions = {
      selected: fileGuid,
    };
    if (fileAction === 'download') {
      aspectOptions.fileAction = 'download';
    }
    if (providerId) {
      aspectOptions.oneproviderId = providerId;
    }
    try {
      await this.router.transitionTo(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'data', {
          queryParams: {
            options: serializeAspectOptions(aspectOptions),
          },
        }
      );
    } catch (error) {
      // FIXME: handle errors
      console.dir(error);
    }
  },

  /**
   * @param {string} fileId
   * @param {GoToFileUrlActionHandler.GoToFileActionType} fileAction
   * @returns {string} Onezone URL that this handler can handle.
   */
  generateUrl({ fileId, fileAction } = {}) {
    if (!fileId || !this.availableFileActions.includes(fileAction)) {
      return '';
    }
    return globals.location.origin +
      this.router.urlFor('onedata', {
        queryParams: {
          action_name: 'goToFile',
          action_fileId: fileId,
          action_fileAction: fileAction,
        },
      });
  },
});
