/**
 * Shows modal, that allows to choose one of available groups
 *
 * @module components/group-add-your-group-modal
 * @author Michał Borzęcki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import layout from 'onezone-gui/templates/components/select-model-modal';
import SelectModelModal from 'onezone-gui/components/select-model-modal';
import computedT from 'onedata-gui-common/utils/computed-t';

export default SelectModelModal.extend({
  layout,

  groupManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.groupAddYourGroupModal',

  /**
   * @override
   */
  recordIcon: 'group',

  /**
   * @override
   */
  modalClass: 'group-add-your-group-modal',

  /**
   * @override
   */
  headerText: computedT('addYourGroup'),

  /**
   * Record to which another group will be added
   * @type {GraphSingleModel}
   * @virtual
   */
  relatedRecord: undefined,

  /**
   * Selected group will be with `group` in relation specified by this field.
   * One of `child`, `parent`.
   * @type {string}
   * @virtual
   */
  relation: 'child',

  /**
   * @override
   */
  messageText: computed(
    'relatedRecord.{name,entityType}',
    'relation',
    function messageText() {
      const {
        relation,
        relatedRecord,
      } = this.getProperties('relation', 'relatedRecord');
      const {
        name,
        entityType,
      } = getProperties(relatedRecord, 'name', 'entityType');
      return this.t('message', {
        relation: this.t(relation),
        recordType: this.t(entityType),
        recordName: name,
      });
    }
  ),

  /**
   * @override
   */
  proceedButtonText: computedT('add'),

  /**
   * @override
   */
  recordsForDropdown: computed(
    'records.content.[]',
    'relatedRecord',
    function recordsForDropdown() {
      const {
        records,
        relatedRecord,
      } = this.getProperties('records', 'relatedRecord');
      if (get(records, 'isFulfilled')) {
        return get(records, 'content')
          .filter(group => group !== relatedRecord)
          .sort((g1, g2) =>
            get(g1, 'name').localeCompare(get(g2, 'name'))
          );
      } else {
        return [];
      }
    }
  ),

  /**
   * @override
   */
  loadRecords() {
    this.set('records', PromiseArray.create({
      promise: this.get('groupManager').getGroups()
        .then(groupList => get(groupList, 'list')),
    }));
  },
});
