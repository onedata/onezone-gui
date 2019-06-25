import Component from '@ember/component';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { htmlSafe } from '@ember/string';
import $ from 'jquery';

export default Component.extend(I18n, {
  classNames: ['up-upload-summary-header'],

  /**
   * @override
   */
  i18nPrefix: 'components.uploadingPresenter.uploadSummaryHeader',

  /**
   * @type {number}
   */
  numberOfFiles: undefined,

  /**
   * Upload progress (in percents 0-100).
   * @type {number}
   */
  progress: undefined,

  /**
   * Callback called when "Cancel" button is clicked
   * @virtual
   * @type {Function}
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,

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
  progressBarWidthStyle: computed('progress', function progressBarWidthStyle() {
    return htmlSafe(`width: ${this.get('progress')}%`);
  }),

  click(event) {
    if (!$(event.target).closest('.cancel-action').length) {
      this.get('onToggleExpand')();
    }
  },
});
