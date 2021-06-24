/**
 * A modal that generates temporary invite tokens of specified type. Data needed from
 * modalOptions:
 * - inviteType - type of invite token, e.g. userJoinSpace,
 * - targetRecord - target of invitation, e.g. space record for userJoinSpace type.
 *
 * @module components/modals/generate-invite-token-modal
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.generateInviteTokenModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   */
  modalOptions: undefined,

  /**
   * @type {ComputedProperty<String>}
   */
  inviteType: reads('modalOptions.inviteType'),

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  targetRecord: reads('modalOptions.targetRecord'),
});
