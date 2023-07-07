/**
 * Introduces onezone-related action runners. See more in the base class documentation in
 * onedata-gui-common.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import UrlActionRunner from 'onedata-gui-common/services/url-action-runner';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { reject } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';
import cdmiObjectIdToGuid from 'onedata-gui-common/utils/cdmi-object-id-to-guid';
import { getSpaceIdFromGuid } from 'onedata-gui-common/utils/file-guid-parsers';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
/**
 * @typedef {'show'|'download'} UrlActionRunner.GoToFileActionType
 */

export default UrlActionRunner.extend({
  spaceActions: service(),
  recordManager: service(),
  navigationState: service(),
  router: service(),

  init() {
    this._super(...arguments);

    this.registerActionRunner('removeSpace', this.removeSpaceActionRunner.bind(this));
    this.registerActionRunner(
      'confirmJoinSpaceRequest',
      this.confirmSpaceJoinRequestActionRunner.bind(this)
    );
    this.registerActionRunner(
      'goToFile',
      this.goToFileActionRunner.bind(this)
    );
  },

  /**
   * @param {Object} actionParams
   * @param {String} actionParams.action_space_id
   * @param {Transition} transition
   * @returns {Promise}
   */
  async removeSpaceActionRunner(actionParams, transition) {
    // NOTE: legacy name of parameter - in new code please follow convention:
    // `action_camelCaseKey`
    const spaceId = get(actionParams || {}, 'action_space_id');
    if (!spaceId) {
      return reject();
    }

    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }

    const {
      spaceActions,
      recordManager,
    } = this.getProperties('spaceActions', 'recordManager');

    return recordManager.getRecordById('space', spaceId)
      .then(space => spaceActions.createRemoveSpaceAction({ space }).execute());
  },

  /**
   * @param {Object} actionParams
   * @param {string} actionParams.action_spaceId
   * @param {string} actionParams.action_requestId
   * @param {Transition} transition
   * @returns {Promise}
   */
  async confirmSpaceJoinRequestActionRunner(actionParams, transition) {
    const spaceId = actionParams.action_spaceId;
    const requestId = actionParams.action_requestId;
    if (!spaceId || !requestId) {
      return;
    }
    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }

    try {
      // allow transition that invoked URL action to complete its handlers
      await this.router.transitionTo(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'members'
      );
    } finally {
      this.spaceActions.createConfirmSpaceJoinRequestAction({
        spaceId,
        requestId,
      }).execute();
    }
  },

  /**
   * @param {Object} actionParams
   * @param {string} actionParams.action_fileId
   * @param {UrlActionRunner.GoToFileActionType} actionParams.action_fileAction
   * @param {Transition} transition
   * @returns {Promise}
   */
  async goToFileActionRunner(actionParams, transition) {
    const {
      action_fileId: fileId,
      action_fileAction: fileAction,
    } = actionParams;
    // FIXME: handle not-happy-path (lack of params, etc.)
    await new GoToFileActionRunner(this.router)
      .handle({ fileId, fileAction, transition });
  },
});

// FIXME: refactor, może to nie powinna być klasa, tylko zestaw luźnych funkcji
export class GoToFileActionRunner {
  static get defaultFileAction() {
    return 'show';
  }
  static get availableFileActions() {
    // FIXME: implement download in oneprovider-gui
    return ['show', 'download'];
  }
  constructor(router) {
    this.router = router;
  }
  /**
   * @param {string} fileId
   * @param {UrlActionRunner.GoToFileActionType} fileAction
   * @param {Transition} transition
   */
  async handle({ fileId, fileAction, transition } = {}) {
    let effFileAction = fileAction;
    if (!GoToFileActionRunner.availableFileActions.includes(effFileAction)) {
      effFileAction = GoToFileActionRunner.defaultFileAction;
    }
    const fileGuid = cdmiObjectIdToGuid(fileId);
    const spaceId = getSpaceIdFromGuid(fileGuid);
    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }

    try {
      await this.router.transitionTo(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'data', {
          queryParams: {
            options: serializeAspectOptions({
              selected: fileGuid,
              fileAction,
            }),
          },
        }
      );
    } catch (error) {
      // FIXME: handle errors
      console.dir(error);
    }
  }
  generateUrl({ fileId, fileAction } = {}) {
    if (!fileId || !GoToFileActionRunner.availableFileActions.includes(fileAction)) {
      return '';
    }
    // + globals.location.pathname
    return globals.location.origin + globals.location.pathname +
      this.router.urlFor('onedata', {
        queryParams: {
          action_name: 'goToFile',
          action_fileId: fileId,
          action_fileAction: fileAction,
        },
      });
  }
}
