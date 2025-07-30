/**
 * Shows modal, that allows to choose one of available groups
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed, get } from '@ember/object';
import { camelize } from '@ember/string';
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
      if (!relatedRecord) {
        return;
      }

      return this.t('message', {
        relation: this.t(relation),
        recordType: this.t(camelize(get(relatedRecord, 'constructor.modelName'))),
        recordName: get(relatedRecord, 'name'),
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
    'recordsProxy.content.[]',
    'relatedRecord',
    function recordsForDropdown() {
      const {
        recordsProxy,
        relatedRecord,
      } = this;
      if (recordsProxy.isFulfilled) {
        return recordsProxy.content
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
    this.set('recordsProxy', PromiseArray.create({
      promise: this.groupManager.getGroups()
        .then(groupList => groupList.list),
    }));
  },
});
