/**
 * Shows modal asking for deleting harvester.
 *
 * @module components/harvester-remove-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.harvesterRemoveModal',

  /**
   * @virtual
   * @type {models.Harvester}
   */
  record: undefined,

  /**
   * @type {boolean}
   */
  isRemoveDataChecked: false,

  /**
   * Field passed to proceed-process-modal
   * @type {boolean}
   */
  opened: false,

  /**
   * Field passed to proceed-process-modal
   * @type {Function}
   */
  close: notImplementedThrow,

  /**
   * Field passed to proceed-process-modal
   * @type {Function}
   */
  proceed: notImplementedThrow,

  /**
   * Field passed to proceed-process-modal
   * @type {boolean}
   */
  processing: false,

  openedObserver: observer('opened', function openedObserver() {
    if (!this.get('opened')) {
      this.set('isRemoveDataChecked', false);
    }
  }),

  actions: {
    changeRemoveDataChecked(value) {
      this.set('isRemoveDataChecked', value);
    },
  },
});
