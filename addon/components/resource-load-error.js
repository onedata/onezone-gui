/**
 * A message to display in place of some resource cannot be loaded. 
 *
 * @module components/resource-load-error
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from 'onedata-gui-common/templates/components/resource-load-error';

import getErrorDetails from 'onedata-gui-common/utils/get-error-description';

export default Component.extend({
  layout,
  classNames: ['alert', 'alert-danger', 'alert-promise-error', 'resource-load-error'],

  i18n: service(),

  /**
   * Action to invoke on alert panel close.
   * If not null - show a close button in alert panel.
   * @type {function|undefined}
   */
  onClose: undefined,

  /**
   * Displayed error details generated from reason error object
   * @type {string}
   */
  _reasonDetails: computed('reason', function () {
    return getErrorDetails(this.get('reason'));
  }),

  init() {
    this._super(...arguments);
    if (!this.get('message')) {
      this.set(
        'message',
        this.get('i18n').t('components.resourceLoadError.defaultErrorMessage')
      );
    }
  },

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
    close() {
      this.get('onClose')();
    }
  }
});
