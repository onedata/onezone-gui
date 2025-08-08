/**
 * Shows modal with choose-a-group selector to add relation to it to some record.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import AddYourRecordAction from './add-your-record-action';

/**
 * @typedef {'child'|'parent'|'member'} GroupRelationAddType
 */

export default AddYourRecordAction.extend({
  /** @override */
  i18nPrefix: 'utils.addYourGroupAction',

  /** @override */
  icon: 'group-invite',

  /** @override */
  className: 'add-your-group-action',

  /** @override */
  addedRecordType: 'group',

  /** @type {ComputedProperty<(addedGroup: Models.Group) => Promise<void>>} */
  onRecordAdd: reads('context.onGroupAdd'),
});
