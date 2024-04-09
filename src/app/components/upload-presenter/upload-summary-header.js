/**
 * Header of single upload. Shows info about total number of files and total
 * progress.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { htmlSafe } from '@ember/string';
import isDirectlyClicked from 'onedata-gui-common/utils/is-directly-clicked';

export default Component.extend(I18n, {
  classNames: ['up-upload-summary-header', 'clickable'],
  classNameBindings: ['isCancelled:cancelled'],

  /**
   * @override
   */
  i18nPrefix: 'components.uploadPresenter.uploadSummaryHeader',

  /**
   * @virtual
   * @type {Utils.UploadObject}
   */
  uploadObject: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isMinimized: false,

  /**
   * Callback called when "Cancel" button is clicked
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

  /**
   * Callback called when "Minimize" button is clicked
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onToggleMinimize: notImplementedIgnore,

  /**
   * Callback called when user clicks on expand/collapse
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onToggleExpand: notImplementedIgnore,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCancelled: reads('uploadObject.isCancelled'),

  /**
   * @type {Ember.ComputedProperty<HtmlSafe>}
   */
  progressBarWidthStyle: computed(
    'uploadObject.progress',
    function progressBarWidthStyle() {
      return htmlSafe(`width: ${this.get('uploadObject.progress')}%`);
    }
  ),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  headerText: computed('uploadObject.state', function () {
    const uploadObject = this.get('uploadObject');

    const notCancelledFiles = get(uploadObject, 'numberOfFiles');
    const uploadedFiles = get(uploadObject, 'numberOfUploadedFiles');
    switch (get(uploadObject, 'state')) {
      case 'uploaded':
      case 'cancelled':
      case 'failed': {
        if (notCancelledFiles === 1 && uploadedFiles === 1) {
          return this.t('uploaded1File');
        } else {
          if (notCancelledFiles === 0) {
            return this.t('uploadedNFiles', { numberOfFiles: 0 });
          } else {
            return this.t('uploadedNFiles', {
              numberOfFiles: `${uploadedFiles}/${notCancelledFiles}`,
            });
          }
        }
      }
      case 'uploading':
      case 'partiallyUploading':
        if (notCancelledFiles === 1) {
          return this.t('uploading1File');
        } else {
          return this.t('uploadingNFiles', {
            numberOfFiles: `${uploadedFiles}/${notCancelledFiles}`,
          });
        }
    }
  }),

  click(event) {
    if (isDirectlyClicked(event)) {
      this.onToggleExpand?.();
    }
  },

  actions: {
    onToggleMinimize() {
      this.get('onToggleMinimize')();
    },
  },
});
