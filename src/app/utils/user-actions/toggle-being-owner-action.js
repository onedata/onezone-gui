/**
 * Allows to (un)make a specific user an owner of a given record.
 * Needs recordBeingOwned, ownerRecord and (optionally) owners passed via context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import {
  array,
  and,
  or,
  not,
  equal,
  raw,
  conditional,
} from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';

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
  recordBeingOwned: reads('context.recordBeingOwned'),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  ownerRecord: reads('context.ownerRecord'),

  /**
   * @type {ComputedProperty<Array<Models.User>>}
   */
  owners: reads('context.owners'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  hasOwnership: array.includes('owners', 'ownerRecord'),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isSingleOwner: and('hasOwnership', equal('owners.length', raw(1))),

  /**
   * @type {ComputedProperty<Models.User>}
   */
  currentUser: computed(function currentUser() {
    return this.get('recordManager').getCurrentUserRecord();
  }),

  /**
   * @type {ComputedProperty<boolean>}
   */
  isCurrentUserOwner: array.includes(
    array.mapBy('owners', raw('entityId')),
    'currentUser.entityId'
  ),

  /**
   * @override
   */
  title: computed('hasOwnership', function title() {
    return this.t(`title.${this.get('hasOwnership') ? 'unmake' : 'make'}`);
  }),

  /**
   * @override
   */
  tip: conditional(
    not('isCurrentUserOwner'),
    computedT('tip.forbidden'),
    conditional(
      'isSingleOwner',
      computedT('tip.unmakeButIsSingleOwner'),
      raw(undefined)
    )
  ),

  /**
   * @override
   */
  disabled: or(
    and('owners', not('isCurrentUserOwner')),
    'isSingleOwner'
  ),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        recordBeingOwned,
        ownerRecord,
        hasOwnership,
        recordManager,
      } = this.getProperties(
        'recordBeingOwned',
        'ownerRecord',
        'hasOwnership',
        'recordManager',
      );

      const methodName = hasOwnership ? 'removeOwnerFromRecord' : 'addOwnerToRecord';
      const actionPromise = recordManager[methodName](
        recordBeingOwned,
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
      recordBeingOwned,
      ownerRecord,
    } = this.getProperties(
      'recordBeingOwned',
      'ownerRecord',
    );
    const recordBeingOwnedName = get(recordBeingOwned, 'name');
    const modelBeingOwnedName = get(recordBeingOwned, 'constructor.modelName');
    const ownerRecordName = get(ownerRecord, 'name');
    const owned = !get(result, 'hadOwnership');

    return this.t(
      `successNotificationText.${owned ? 'owned' : 'notOwned'}.${modelBeingOwnedName}`, {
        recordBeingOwnedName,
        ownerRecordName,
      }
    );
  },

  getFailureNotificationActionName(result) {
    const owned = !get(result, 'hadOwnership');
    return this.t(`failureNotificationActionName.${owned ? 'owned' : 'notOwned'}`);
  },
});
