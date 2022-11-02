/**
 * Shows modal with REST API info for space
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

export default Component.extend(I18n, {
  tagName: '',

  apiStringGenerator: service(),
  restApiGenerator: service(),
  spaceManager: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaceRestApiModal',

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
   * @override
   */
  modalClass: 'space-rest-api-modal',

  /**
   * @type {ComputedProperty<String>}
   */
  spaceId: reads('modalOptions.spaceId'),

  /**
   * @type {ComputedProperty<PromiseObject<Array<ApiSample>>>}
   */
  apiSamplesProxy: promise.object(computed('spaceId', function apiSamplesProxy() {
    const spaceId = this.spaceId;
    return this.spaceManager.getApiSamples(spaceId);
  })),

  /**
   * @type {ComputedProperty<Array<ApiSample>>}
   */
  apiSamples: reads('apiSamplesProxy.content'),
});
