/**
 * Class that represents single upload object state. Upload object may by
 * a file, a directory or `root` - metadirectory that aggregates multiple
 * files/dirs in single upload. UploadObject objects creates a tree
 * structure linked using `children` array and `parent` reference. Also each
 * object has reference to root object.
 * 
 * Properties like objectSize or isUploading are calculated recurrently for
 * dirs. For files these fields must be set manually.
 *
 * @module utils/upload-bject
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, observer, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { conditional, equal, sum, array, raw, writable, or } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import _ from 'lodash';
import moment from 'moment';

export default EmberObject.extend(I18n, {
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.uploadObject',

  /**
   * Full upload object path. It should be trimmed from `/` character
   * @virtual
   * @type {string}
   */
  objectPath: undefined,

  /**
   * One of `file`, `directory`, `root`
   * `root` is a top level collection of all uploading files from the 0 level of
   * tree nesting - is not related to any real directory
   * @virtual
   * @type {string}
   */
  objectType: undefined,

  /**
   * @virtual
   * @type {Utils.UploadObject|null}
   */
  parent: undefined,

  /**
   * Nested objects (1 level deep) (if this object is a directory or root)
   * @virtual
   * @type {Ember.A<Utils.UploadObject>}
   */
  children: undefined,

  /**
   * Only available when `objectType` is `root`
   * @virtual
   * @type {Models.Space}
   */
  space: undefined,

  /**
   * Only available when `objectType` is `root`
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

  /**
   * Only available when `objectType` is `root`. Identifies single upload
   * process (files that are upload in the same batch).
   * @virtual
   * @type {number}
   */
  uploadId: undefined,

  /**
   * Start upload timestamp (in ms)
   * @type {number}
   */
  startTime: undefined,

  /**
   * End upload timestamp (in ms)
   * @type {number}
   */
  endTime: undefined,

  /**
   * Object size (in bytes). Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  objectSize: writable(
    sum(array.mapBy(
      array.rejectBy('children', raw('isCancelled')),
      raw('objectSize')
    ))
  ),

  /**
   * Always is <= `objectSize`. Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  bytesUploaded: writable(
    sum(array.mapBy(
      array.rejectBy('children', raw('isCancelled')),
      raw('bytesUploaded')
    ))
  ),

  /**
   * Errors related to uploading this file or nested files in directory.
   * @virtual
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  errors: writable(conditional(
    equal('objectType', raw('file')),
    raw([]),
    array.reduce(
      array.mapBy('children', raw('errors')),
      (arr, cur) => arr.concat(cur),
      []
    )
  )),

  /**
   * Error message based on `errors` array
   * @virtual
   * @type {Ember.ComputedProperty<Array<string>>}
   */
  errorMessage: computed('errors.[]', function errorMessage() {
    const errors = this.get('errors');
    if (errors.length) {
      if (errors.length === 1) {
        return this.tt('uploadError', { error: errors[0] });
      } else {
        return this.tt('uploadMultipleError', {
          firstError: errors[0],
          otherErrorsCount: errors.length - 1,
        });
      }
    }
  }),

  /**
   * True if object is cancelled, false otherwise. Should be overridden with
   * a boolean if objectType is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCancelled: writable(conditional(
    equal('objectType', raw('file')),
    raw(false),
    array.isEvery('children', raw('isCancelled'))
  )),

  /**
   * True if object is uploading. Should be overridden with a boolean if
   * objectType is `file`.
   * @type {Ember.ComputedProperty<boolean>}
   */
  isUploading: writable(conditional(
    equal('objectType', raw('file')),
    raw(true),
    array.isAny('children', raw('isUploading'))
  )),

  /**
   * Object name (extracted from object path)
   * @type {Ember.ComputedProperty<string>}
   */
  objectName: computed('objectPath', function objectName() {
    const objectPath = this.get('objectPath');
    return objectPath ? get(objectPath.split('/'), 'lastObject') : '';
  }),

  /**
   * Represents how deep in upload directory tree is this object. 0 means root
   * @type {Ember.ComputedProperty<number>}
   */
  nestingLevel: computed('objectPath', function nestingLevel() {
    const objectPath = this.get('objectPath');
    return objectPath ? objectPath.split('/').length - 1 : 0;
  }),

  /**
   * Number of files (calculated recurrently). If this object represents
   * a file, then numberOfFiles is 1.
   * @type {Ember.ComputedProperty<number>}
   */
  numberOfFiles: conditional(
    equal('objectType', raw('file')),
    conditional('isCancelled', raw(0), raw(1)),
    sum(array.mapBy('children', raw('numberOfFiles')))
  ),

  /**
   * @type {Utils.UploadObject|null}
   */
  root: computed('objectType', 'parent.root', function root() {
    if (this.get('objectType') === 'root') {
      return this;
    } else {
      return this.get('parent.root');
    }
  }),

  /**
   * One of `uploading`, `uploaded`, `partiallyUploading`, `failed`, `cancelled`.
   * `partiallyUploading` is used for directories, that have both
   * uploading/uploaded and failed files.
   * @virtual
   * @type {string}
   */
  state: computed(
    'objectType',
    'isUploading',
    'isCancelled',
    'objectSize',
    'bytesUploaded',
    'children.@each.{state}',
    'errors',
    function state() {
      const {
        objectType,
        isUploading,
        isCancelled,
        objectSize,
        bytesUploaded,
        children,
        errors,
      } = this.getProperties(
        'objectType',
        'isUploading',
        'isCancelled',
        'objectSize',
        'bytesUploaded',
        'children',
        'errors'
      );
      if (isUploading) {
        if (objectType === 'file') {
          return 'uploading';
        } else {
          const everyChildrenIsOk = children.every(child => ['uploaded', 'uploading']
            .includes(get(child, 'state'))
          );
          if (everyChildrenIsOk) {
            return 'uploading';
          } else {
            return 'partiallyUploading';
          }
        }
      } else if (isCancelled) {
        return 'cancelled';
      } else if (bytesUploaded < objectSize || errors.length) {
        return 'failed';
      } else {
        return 'uploaded';
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  canBeCancelled: or(
    equal('state', raw('uploading')),
    equal('state', raw('partiallyUploading'))
  ),

  /**
   * Object upload progress (in percents 0-100).
   * @type {Ember.ComputedProperty<number>}
   */
  progress: computed(
    'objectSize',
    'bytesUploaded',
    'state',
    function progress() {
      const {
        state,
        objectSize,
        bytesUploaded,
      } = this.getProperties('state', 'objectSize', 'bytesUploaded');
      if (objectSize === 0 && bytesUploaded === 0) {
        return state === 'uploaded' ? 100 : 0;
      } else if (!objectSize || !bytesUploaded) {
        return 0;
      } else {
        return Math.floor((bytesUploaded / objectSize) * 100);
      }
    }
  ),

  isUploadingObserver: observer('isUploading', function isUploadingObserver() {
    const {
      isUploading,
      endTime,
    } = this.getProperties('isUploading', 'endTime');
    if (!isUploading && !endTime) {
      this.set('endTime', moment().valueOf());
    }
  }),

  init() {
    this._super(...arguments);

    this.set('startTime', moment().valueOf());
  },

  /**
   * @returns {undefined}
   */
  cancel() {
    const {
      objectType,
      children,
      state,
    } = this.getProperties('objectType', 'children', 'state');
    if (objectType === 'file') {
      if (state !== 'uploaded') {
        this.setProperties({
          isCancelled: true,
          isUploading: false,
        });
      }
    } else {
      children.invoke('cancel');
    }
  },

  /**
   * Traverses through upload objects structure to find object related to
   * given path
   * @param {string} relativePath
   * @returns {Utils.UploadObject|null} null if not found
   */
  getFile(relativePath) {
    const children = this.get('children') || [];
    const thisLevelPathPart = relativePath.split('/')[0];
    const isFileAtThisLevel = thisLevelPathPart.length === relativePath.length;
    const objectOnPath = children.findBy('objectName', thisLevelPathPart);
    if (isFileAtThisLevel) {
      return objectOnPath;
    } else {
      // `+ 1` due to additional `/` character
      const nestedRelativePath =
        relativePath.substring(thisLevelPathPart.length + 1);
      return objectOnPath.getFile(nestedRelativePath);
    }
  },

  /**
   * Returns all nested files (at any level od nesting). Is not a computed
   * property to enforce recomputation only on demand.
   * @returns {Array<Utils.UploadObject>}
   */
  getAllNestedFiles() {
    const children = this.get('children');
    if (children) {
      const directFiles = children.filterBy('objectType', 'file');
      const indirectFiles = _.flatten(
        children.rejectBy('objectType', 'file').invoke('getAllNestedFiles')
      );
      return directFiles.concat(indirectFiles);
    } else {
      return [];
    }
  },
});
