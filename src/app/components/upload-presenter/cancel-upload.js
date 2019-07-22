/**
 * Button used to cancel upload
 *
 * @module components/upload-presenter/cancel-upload
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  /**
   * @override
   */
  i18nPrefix: 'components.uploadPresenter.cancelUpload',

  /**
   * Callback called when user clicks cancel
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

  /**
   * @virtual
   * @type {boolean}
   */
  isCancelled: undefined,

  /**
   * @virtual
   * @type {string}
   */
  iconClass: undefined,

  /**
   * @type {boolean}
   */
  ackPopoverOpened: false,

  actions: {
    toggleAckPopover(open) {
      const {
        ackPopoverOpened,
        isCancelled,
      } = this.getProperties('ackPopoverOpened', 'isCancelled');
      if (ackPopoverOpened !== open && (!isCancelled || !open)) {
        this.set('ackPopoverOpened', open);
      }
    },
    cancel() {
      this.send('toggleAckPopover', false);
      this.get('onCancel')();
    },
  },
});
