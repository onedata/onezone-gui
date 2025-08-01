/**
 * Shows modal with choose-a-space selector to add relation to it to some record.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import AddYourRecordAction from './add-your-record-action';

/**
 * @typedef {'sourceFor'} SpaceRelationAddType
 */

export default AddYourRecordAction.extend({
  /** @override */
  i18nPrefix: 'utils.addYourSpaceAction',

  /** @override */
  icon: 'space-add',

  /** @override */
  className: 'add-your-space-action',

  /** @override */
  addedRecordType: 'space',

  /**
   * @override
   * @type {ComputedProperty<(addedSpace: Models.Space) => Promise<void>>}
   */
  onRecordAdd: reads('context.onSpaceAdd'),
});
