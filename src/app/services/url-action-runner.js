/**
 * Introduces onezone-related action runners. See more in the base class documentation in
 * onedata-gui-common.
 *
 * @module services/url-action-runner
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import UrlActionRunner from 'onedata-gui-common/services/url-action-runner';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { reject } from 'rsvp';

export default UrlActionRunner.extend({
  spaceActions: service(),
  recordManager: service(),

  init() {
    this._super(...arguments);

    this.registerActionRunner('removeSpace', this.removeSpaceActionRunner.bind(this));
  },

  /**
   * @param {Object} actionParams
   * @param {String} actionParams.action_space_id
   * @returns {Promise}
   */
  removeSpaceActionRunner(actionParams) {
    const spaceId = get(actionParams || {}, 'action_space_id');
    if (!spaceId) {
      return reject();
    }

    const {
      spaceActions,
      recordManager,
    } = this.getProperties('spaceActions', 'recordManager');

    return recordManager.getRecordById('space', spaceId)
      .then(space => spaceActions.createRemoveSpaceAction({ space }).execute());
  },
});
