/**
 * Shows information about uploaded dump file.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['upload-details'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.applyAtmWorkflowSchemaDumpModal.uploadDetails',

  /**
   * @virtual
   * @type {AtmWorkflowSchemaDumpSource}
   */
  dumpSource: undefined,

  /**
   * @virtual
   * @type {() => void}
   */
  onReupload: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isDisabled: false,

  /**
   * @type {ComputedProperty<String>}
   */
  filename: reads('dumpSource.name'),

  actions: {
    reupload() {
      const onReupload = this.get('onReupload');
      onReupload && onReupload();
    },
  },
});
