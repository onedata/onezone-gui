/**
 * Shows modal with API samples info for passed record
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { promise } from 'ember-awesome-macros';
import recordIcon from 'onedata-gui-common/utils/record-icon';

export default Component.extend(I18n, {
  tagName: '',

  apiSamplesManager: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.apiSamplesModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  modalOptions: undefined,

  /**
   * @type {string}
   */
  icon: computed('apiSubject', function icon() {
    return recordIcon(this.get('apiSubject'));
  }),

  /**
   * @type {Object}
   */
  record: reads('modalOptions.record'),

  /**
   * @type {ComputedProperty<String>}
   */
  apiSubject: reads('modalOptions.apiSubject'),

  /**
   * @type {ComputedProperty<String>}
   */
  recordId: reads('record.entityId'),

  /**
   * @type {ComputedProperty<PromiseObject<Array<ApiSample>>>}
   */
  apiSamplesProxy: promise.object(computed(
    'recordId',
    'apiSubject',
    function apiSamplesProxy() {
      const recordId = this.recordId;
      const apiSubject = this.apiSubject;
      // works until apiSubject is equal to model name
      return this.apiSamplesManager.getApiSamples(recordId, apiSubject);
    }
  )),

  /**
   * @type {ComputedProperty<Array<ApiSample>>}
   */
  apiSamples: reads('apiSamplesProxy.content'),
});
