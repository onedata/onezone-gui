/**
 * Icon used to indicate upload error.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  tagName: '',

  globalNotify: service(),
  errorExtractor: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.uploadPresenter.errorIndicator',

  /**
   * @virtual
   * @type {Utils.UploadObject}
   */
  uploadObject: undefined,

  /**
   * @type {ComputedProperty<string|null>}
   */
  errorMessage: computed('uploadObject.errors.[]', function errorMessage() {
    const errors = this.uploadObject?.errors ?? [];
    if (!errors.length) {
      return null;
    }

    const firstErrorMessage =
      this.errorExtractor.getMessage(errors[0])?.message;
    if (errors.length === 1) {
      return this.t('uploadError', { error: firstErrorMessage });
    } else {
      return this.t('uploadMultipleError', {
        firstError: firstErrorMessage,
        otherErrorsCount: errors.length - 1,
      });
    }
  }),

  actions: {
    showErrorModal() {
      if (this.uploadObject?.errors?.length) {
        this.globalNotify.backendError(
          this.t('uploading'),
          this.uploadObject.errors[0]
        );
      }
    },
  },
});
