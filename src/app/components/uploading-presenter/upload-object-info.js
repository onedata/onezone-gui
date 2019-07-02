
import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { equal } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

export default Component.extend(I18n, {
  classNames: ['up-upload-object-info'],
  classNameBindings: ['isExpanded:expanded'],

  /**
   * @override
   */
  i18nPrefix: 'components.uploadingPresenter.uploadObjectInfo',

  /**
   * Object name without path
   * @virtual
   * @type {string}
   */
  objectName: undefined,

  /**
   * One of `file`, `directory`
   * @virtual
   * @type {string}
   */
  objectType: undefined,

  /**
   * One of `uploading`, `uploaded`, `partiallyUploading`, `failed`
   * @virtual
   * @type {string}
   */
  status: undefined,

  /**
   * Size (in bytes) of uploading object
   * @virtual
   * @type {number}
   */
  objectSize: undefined,

  /**
   * Always is <= `objectSize`
   * @virtual
   * @type {number}
   */
  bytesUploaded: undefined,

  /**
   * True if object has expanded list of nested objects
   * @virtual
   * @type {boolean}
   */
  isObjectExpanded: undefined,

  /**
   * Represents how deep in upload directory tree is this object. 0 means root
   * @virtual
   * @type {number}
   */
  nestingLevel: 0,

  /**
   * @virtual
   * @type {Object}
   */
  nestingStyle: undefined,

  /**
   * Object upload progress (in percents 0-100).
   * @virtual
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
  nestingSpaceWidthStyle: computed(
    'nestingLevel',
    'nestingStyle',
    function nestingSpaceWidthStyle() {
      const {
        nestingLevel,
        nestingStyle,
      } = this.getProperties('nestingLevel', 'nestingStyle');
      const {
        px,
        percent,
      } = getProperties(nestingStyle, 'px', 'percent');
      return htmlSafe(
        `width: ${nestingLevel * px}px; max-width: ${nestingLevel * percent}%;`
      );
    }
  ),

  /**
   * Object icon name according to passed `objectType`.
   * @type {Ember.ComputedProperty<string>}
   */
  objectIcon: computed('objectType', function objectIcon() {
    switch (this.get('objectType')) {
      case 'directory':
        return 'browser-directory';
      case 'file':
      default:
        return 'browser-file';
    }
  }),

  /**
   * If true, object upload is allowed to be expanded and list subobjects
   * @type {Ember.ComputedProperty<boolean>}
   */
  isExpandable: equal('objectType', 'directory'),

  /**
   * Class defining color of progress bar (depending on status)
   * @type {Ember.ComputedProperty<string>}
   */
  progressBarContextClass: computed(
    'status',
    function progressBarContextClass() {
      let cssClass = 'progress-bar-';
      switch (this.get('status')) {
        case 'failed':
          cssClass += 'danger';
          break;
        case 'partiallyUploading':
          cssClass += 'warning';
          break;
        case 'uploading':
        case 'uploaded':
        default:
          cssClass += 'success';
          break;
      }
      return cssClass;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<HtmlSafe>}
   */
  progressBarWidthStyle: computed('progress', function progressBarWidthStyle() {
    return htmlSafe(`width: ${this.get('progress')}%`);
  }),

  actions: {
    toggleExpand() {
      const {
        onToggleExpand,
        objectType,
      } = this.getProperties('onToggleExpand', 'objectType');
      if (!$(event.target).closest('.cancel-action').length &&
        objectType === 'directory') {
        onToggleExpand();
      }
    },
  },
});
