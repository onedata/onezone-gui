/**
 * Shows modal asking about group/space leaving.
 *
 * @module components/leave-modal
 * @author Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ProceedProcessModal from 'onedata-gui-common/components/proceed-process-modal';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import _ from 'lodash';

export default ProceedProcessModal.extend({
  /**
   * @override
   */
  i18nPrefix: 'components.leaveModal',

  /**
   * @override
   */
  modalIcon: 'sign-warning-rounded',

  /**
   * @override
   */
  headerText: computed(function headerText() {
    return this.t('headerText', {
      recordType: this.t(this.get('record.entityType')),
    });
  }),

  /**
   * @override
   */
  messageText: computed('record.{name,recordType}', function messageText() {
    const recordName = this.get('record.name');
    const recordType = this.t(this.get('record.entityType'));
    const recordTypeI18n = this.t(recordType);
    return htmlSafe(
      this.t('areYouSure', { recordName, recordType: recordTypeI18n }) +
      '<br><br><strong class="text-danger">' +
      this.t('mayCause' + _.upperFirst(recordType), {
        recordName,
        recordType: recordTypeI18n,
      }) +
      '</strong>'
    );
  }),

  /**
   * @override
   */
  modalClass: 'leave-modal',
});
