import Component from '@ember/component';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';

export default Component.extend(I18n, {
  classNames: ['up-upload-summary-header'],
  classNameBindings: ['uploadObject.isCancelled:cancelled'],

  /**
   * @override
   */
  i18nPrefix: 'components.uploadingPresenter.uploadSummaryHeader',

  /**
   * @virtual
   * @type {Utils.UploadingObjectState}
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

    const files = uploadObject.getAllNestedFiles();
    const notCancelledFiles = files.rejectBy('isCancelled').length;
    const uploadedFiles = files.filterBy('state', 'uploaded').length;
    switch (get(uploadObject, 'state')) {
      case 'uploaded':
      case 'cancelled':
      case 'failed':
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
      case 'uploading':
      case 'partiallyUploading':
        if (notCancelledFiles === 1) {
          return this.t('uploading1File');
        } else {
          return this.t('uploadingNFiles', {
            numberOfFiles: notCancelledFiles,
          });
        }
    }
  }),

  click(event) {
    if (!$(event.target).closest('.upload-summary-header-icons').length) {
      this.get('onToggleExpand')();
    }
  },
});
