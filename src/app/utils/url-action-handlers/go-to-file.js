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

/**
 * @typedef {'show'|'download'} GoToFileUrlActionHandler.GoToFileActionType
 */

export default class GoToFileUrlActionHandler {
  static get defaultFileAction() {
    return 'show';
  }
  static get availableFileActions() {
    return ['show', 'download'];
  }

  constructor(router) {
    this.router = router;
  }

  // FIXME: handle not-happy-path (lack of params, etc.)
  // FIXME: być może handlować na podstawie samego transition (przenieść tutaj parser)
  /**
   * @param {string} fileId
   * @param {GoToFileUrlActionHandler.GoToFileActionType} fileAction
   * @param {Transition} transition
   */
  async handle({ fileId, fileAction, transition } = {}) {
    let effFileAction = fileAction;
    if (!GoToFileUrlActionHandler.availableFileActions.includes(effFileAction)) {
      effFileAction = GoToFileUrlActionHandler.defaultFileAction;
    }
    const fileGuid = cdmiObjectIdToGuid(fileId);
    const spaceId = getSpaceIdFromGuid(fileGuid);
    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }

    const aspectOptions = {
      selected: fileGuid,
    };
    if (fileAction === 'download') {
      aspectOptions.fileAction = 'download';
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
  }

  /**
   * @param {string} fileId
   * @param {GoToFileUrlActionHandler.GoToFileActionType} fileAction
   * @returns {string} Onezone URL that this handler can handle.
   */
  generateUrl({ fileId, fileAction } = {}) {
    if (!fileId || !GoToFileUrlActionHandler.availableFileActions.includes(fileAction)) {
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
  }
}
