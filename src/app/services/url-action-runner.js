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
import GoToFileUrlActionHandler from 'onezone-gui/utils/url-action-handlers/go-to-file';

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
      .then(space => {
        const action = spaceActions.createRemoveSpaceAction({ space });
        return action.execute().finally(() => action.destroy());
      });
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
      const action = this.spaceActions.createConfirmSpaceJoinRequestAction({
        spaceId,
        requestId,
      });
      action.execute().finally(() => action.destroy());
    }
  },

  /**
   * @param {Object} actionParams
   * @param {string} actionParams.action_fileId
   * @param {GoToFileUrlActionHandler.GoToFileActionType} actionParams.action_fileAction
   * @param {Transition} transition
   * @returns {Promise}
   */
  async goToFileActionRunner(actionParams, transition) {
    const {
      action_fileId: fileId,
      action_fileAction: fileAction,
    } = actionParams;
    try {
      await transition;
    } catch {
      // onedata transition could fail, but it should not cause action to cancel
    }
    const actionHandler = GoToFileUrlActionHandler.create({ ownerSource: this });
    try {
      await actionHandler.handle({ fileId, fileAction });
    } finally {
      actionHandler.destroy();
    }
  },
});
