/**
 * Component that shows info "Could not open share".
 *
 * @module components/open-share-failed
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import layout from '../../templates/components/errors/open-share-failed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  layout,

  /**
   * @override
   */
  i18nPrefix: 'components.errors.openShareFailed',

  /**
   * @type {Object}
   */
  reason: reads('error.reason'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  description: computed('reason', function description() {
    const reason = this.get('reason');
    if (reason && reason.description) {
      return reason.description;
    } else {
      return this.tt('shareUnknownError');
    }
  }),
});
