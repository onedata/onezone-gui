/**
 * A resource loading error message intended to use on whole application screen
 *
 * @module components/application-error
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import layout from 'onedata-gui-common/templates/components/application-error';

import I18n from 'onedata-gui-common/mixins/components/i18n';
import getErrorDetails from 'onedata-gui-common/utils/get-error-description';

const {
  computed,
  inject: { service },
} = Ember;

export default Ember.Component.extend(I18n, {
  layout,
  classNames: ['application-error'],

  i18n: service(),

  i18nPrefix: 'components.applicationError.',

  showDetails: false,

  /**
   * To inject.
   * An object with error details, that should be parseable by getErrorDetails
   * @type {object}
   */
  error: undefined,

  /**
   * @virtual
   * One of: default, internal
   */
  messageType: 'default',

  message: computed('messageType', function () {
    return this.t('messages.' + this.get('messageType'));
  }),

  /**
   * Displayed error details generated from reason error object
   * @type {string}
   */
  _reasonDetails: computed('error', function () {
    let error = this.get('error');
    if (error != null && typeof error === 'object') {
      try {
        return JSON.stringify(error);
      } catch (e) {
        if (e instanceof TypeError) {
          return error;
        } else {
          throw error;
        }
      }
    } else {
      return error && getErrorDetails(error);
    }
  }),

  actions: {
    toggleShowDetails() {
      this.toggleProperty('showDetails');
    },
  },
});
