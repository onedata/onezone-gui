/**
 * PrivilegesTreeEditor extension which allows to work on recordProxy - an abstraction
 * of model records, which allows batch edition and saving.
 *
 * @module components/record-privileges-tree-editor
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, observer, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import PrivilegesTreeEditor from 'onedata-gui-common/components/privileges-tree-editor';

export default PrivilegesTreeEditor.extend({
  /**
   * Record proxy with privileges.
   * @virtual
   * @type {PrivilegeRecordProxy}
   */
  recordProxy: Object.freeze({}),

  /**
   * @override
   */
  editionEnabled: computed(
    'recordProxy.{isSaving,isReadOnly}',
    function editionEnabled() {
      return !this.get('recordProxy.isSaving') &&
        !this.get('recordProxy.isReadOnly');
    }
  ),

  /**
   * @override
   */
  overridePrivileges: reads('recordProxy.effectivePrivilegesSnapshot'),

  recordProxyObserver: observer('recordProxy', function recordProxyObserver() {
    const recordProxy = this.get('recordProxy');
    if (!get(recordProxy, 'isLoaded') && !get(recordProxy, 'isLoading')) {
      recordProxy.reloadRecords();
    }
  }),

  init() {
    this._super(...arguments);

    // Moving record processing to the next runloop frame to avoid double set
    // in the same render (recordProxyObserver changes recordProxy content)
    scheduleOnce('afterRender', this, 'recordProxyObserver');
  },

  actions: {
    treeValuesChanged(values) {
      const superResult = this._super(...arguments);

      this.get('recordProxy').setNewPrivileges(values);

      return superResult;
    },
  },
});
