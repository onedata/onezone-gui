/**
 * Header of upload list item, that shows info about upload.
 *
 * @module components/upload-presenter/upload-object-info
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, getProperties } from '@ember/object';
import { equal, and, reads } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['up-upload-object-info'],
  classNameBindings: [
    'isExpanded:expanded',
    'uploadObject.isCancelled:cancelled',
  ],

  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.uploadPresenter.uploadObjectInfo',

  /**
   * @virtual
   * @type {Utils.UploadObject}
   */
  uploadObject: undefined,

  /**
   * True if object has expanded list of nested objects
   * @virtual
   * @type {boolean}
   */
  isObjectExpanded: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  nestingStyle: undefined,

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
    'uploadObject.nestingLevel',
    'nestingStyle',
    function nestingSpaceWidthStyle() {
      const nestingLevel = this.get('uploadObject.nestingLevel');
      const nestingStyle = this.get('nestingStyle');
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
  objectIcon: computed('uploadObject.objectType', function objectIcon() {
    switch (this.get('uploadObject.objectType')) {
      case 'directory':
        return 'browser-directory';
      case 'file':
      default:
        return 'browser-file';
    }
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isDirectory: equal('uploadObject.objectType', 'directory'),

  /**
   * If true, object upload is allowed to be expanded and list subobjects
   * @type {Ember.ComputedProperty<boolean>}
   */
  isExpandable: reads('isDirectory'),

  /**
   * @type {Ember.ComptedProperty<boolean>}
   */
  isCancelledDirectory: and('isDirectory', 'uploadObject.isCancelled'),

  /**
   * Class defining color of progress bar (depending on state)
   * @type {Ember.ComputedProperty<string>}
   */
  progressBarContextClass: computed(
    'uploadObject.state',
    function progressBarContextClass() {
      let cssClass = 'progress-bar-';
      switch (this.get('uploadObject.state')) {
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
  progressBarWidthStyle: computed(
    'uploadObject.progress',
    function progressBarWidthStyle() {
      return htmlSafe(`width: ${this.get('uploadObject.progress')}%`);
    }
  ),

  fileUrl: computed('uploadObject.{objectType,fileId,spaceId}', function fileUrl() {
    const {
      uploadObject,
      router,
    } = this.getProperties('uploadObject', 'router');
    const { objectType, fileId, spaceId } = uploadObject;
    if (objectType === 'file' && fileId && spaceId) {
      return router.urlFor(
        'onedata.sidebar.content.aspect',
        'spaces',
        spaceId,
        'data', {
          queryParams: {
            options: serializeAspectOptions({ dir: fileId, selected: fileId }),
          },
        }
      );
    }
  }),

  actions: {
    toggleExpand() {
      const {
        onToggleExpand,
        isExpandable,
      } = this.getProperties('onToggleExpand', 'isExpandable');
      if (!$(event.target).closest('.cancel-action').length && isExpandable) {
        onToggleExpand();
      } else {
        return true;
      }
    },
  },
});
