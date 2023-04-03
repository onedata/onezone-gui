/**
 * Allows to generate invite tokens for groups, spaces, harvesters etc.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { not, and } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.tokenActions.generateInviteTokenAction',

  /**
   * @override
   */
  title: computed('inviteType', function title() {
    return this.t(`title.${this.get('inviteType')}`);
  }),

  /**
   * @override
   */
  icon: 'join-plug',

  /**
   * @override
   */
  className: 'generate-invite-token-action',

  /**
   * @override
   */
  disabled: not(and('inviteType', 'targetRecord')),

  /**
   * @type {ComputedProperty<String>}
   */
  inviteType: reads('context.inviteType'),

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  targetRecord: reads('context.targetRecord'),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        inviteType,
        targetRecord,
        modalManager,
      } = this.getProperties(
        'inviteType',
        'targetRecord',
        'modalManager'
      );

      return modalManager
        .show('generate-invite-token-modal', {
          inviteType,
          targetRecord,
        }).hiddenPromise;
    }
  },
});
