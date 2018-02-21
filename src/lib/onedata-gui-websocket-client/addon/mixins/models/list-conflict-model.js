/**
 * Adds auto assigning of conflict labels for elements of list
 * in list record
 *
 * @module mixins/models/list-conflict-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, observer } from '@ember/object';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import { isArray } from '@ember/array';
import Mixin from '@ember/object/mixin';

export default Mixin.create({
  // FIXME: there are hard-to-reproduce bugs: sometimes one item in collection
  // does not have a conflictLabel attached
  addConflictLabels: observer('list.content.@each.{name,entityId}', function () {
    const listContent = this.get('list.content');
    if (isArray(listContent) && listContent.every(r => get(r, 'name') != null)) {
      addConflictLabels(
        listContent,
        'name',
        'entityId'
      );
    }
  }),

  init() {
    this._super(...arguments);
    this.addConflictLabels();
  },
});
