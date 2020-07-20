/**
 * Allows to (un)make a specific user an owner of a given record.
 * Needs ownedRecord, ownerRecord and (optionally) ownerList passed via context.
 *
 * @module utils/user-actions/toggle-being-owner-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { array, and, or, not, equal, raw } from 'ember-awesome-macros';

export default Action.extend({
  recordManager: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.userActions.toggleBeingOwnerAction',

  /**
   * @override
   */
  className: 'toggle-being-owner-trigger',

  /**
   * @override
   */
  icon: 'role-holders',

  /**
   * @type {ComputedProperty<GraphSingleModel>}
   */
  ownedRecord: reads('context.ownedRecord'),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  ownerRecord: reads('context.ownerRecord'),

  /**
   * @type {ComputedProperty<Array<Models.User>>}
   */
  ownerList: reads('context.ownerList'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasOwnership: array.includes('ownerList', 'ownerRecord'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSingleOwner: and('hasOwnership', equal('ownerList.length', raw(1))),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.get('recordManager').getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCurrentUserOwner: array.includes('ownerList', 'currentUser'),

  /**
   * @override
   */
  title: computed('hasOwnership', function title() {
    return this.t(`title.${this.get('hasOwnership') ? 'unmake' : 'make'}`);
  }),

  /**
   * @override
   */
  tip: computed('isSingleOwner', function tip() {
    return this.get('isSingleOwner') ? this.t('tip.unmakeButIsSingleOwner') : undefined;
  }),

  /**
   * @override
   */
  disabled: or(
    and('ownerList', not('isCurrentUserOwner')),
    'isSingleOwner'
  ),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        ownedRecord,
        ownerRecord,
        hasOwnership,
        recordManager,
      } = this.getProperties(
        'ownedRecord',
        'ownerRecord',
        'hasOwnership',
        'recordManager',
      );

      const methodName = hasOwnership ? 'removeOwnerFromRecord' : 'addOwnerToRecord';
      const actionPromise = recordManager[methodName](
        ownedRecord,
        ownerRecord,
      );

      const result = ActionResult.create({ hadOwnership: hasOwnership });
      return result.interceptPromise(actionPromise)
        .catch(() => {})
        .then(() => {
          this.notifyResult(result);
          return result;
        });
    }
  },

  /**
   * @override
   */
  getSuccessNotificationText(result) {
    const {
      ownedRecord,
      ownerRecord,
    } = this.getProperties(
      'ownedRecord',
      'ownerRecord',
    );
    const ownedRecordName = get(ownedRecord, 'name');
    const ownedModelName = get(ownedRecord, 'constructor.modelName');
    const ownerRecordName = get(ownerRecord, 'name');
    const owned = !get(result, 'hadOwnership');

    return this.t(
      `successNotificationText.${owned ? 'owned' : 'notOwned'}.${ownedModelName}`, {
        ownedRecordName,
        ownerRecordName,
      }
    );
  },

  getFailureNotificationActionName(result) {
    const owned = !get(result, 'hadOwnership');
    return this.t(`failureNotificationActionName.${owned ? 'owned' : 'notOwned'}`);
  },
});
