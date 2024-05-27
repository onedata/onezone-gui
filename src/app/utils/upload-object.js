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
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  computed,
  observer,
  get,
} from '@ember/object';
import {
  equal,
  raw,
  or,
} from 'ember-awesome-macros';
import _ from 'lodash';
import moment from 'moment';

export default EmberObject.extend({
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
   * @virtual
   * Oneprovider's file model entityId
   * @type {string}
   */
  fileId: undefined,

  /**
   * @virtual
   * Oneprovider's file model spaceId
   * @type {string}
   */
  spaceId: undefined,

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
   * @virtual optional
   * @type {Ember.ComputedProperty<number>|number}
   */
  objectSize: computed('children.@each.{isCancelled,objectSize}', {
    get() {
      if (this.overriddenComputedFields.objectSize !== undefined) {
        return this.overriddenComputedFields.objectSize;
      }

      const nonCancelledChildren =
        this.children?.filter((child) => !child.isCancelled) ?? [];
      return nonCancelledChildren.reduce(
        (acc, child) => acc + (child.objectSize ?? 0),
        0
      );
    },
    set(key, value) {
      return this.overriddenComputedFields.objectSize = value;
    },
  }),

  /**
   * Always is <= `objectSize`. Should be overridden with a number if objectType
   * is `file`.
   * @virtual optional
   * @type {Ember.ComputedProperty<number>|number}
   */
  bytesUploaded: computed('children.@each.{isCancelled,bytesUploaded}', {
    get() {
      if (this.overriddenComputedFields.bytesUploaded !== undefined) {
        return this.overriddenComputedFields.bytesUploaded;
      }

      const nonCancelledChildren =
        this.children?.filter((child) => !child.isCancelled) ?? [];
      return nonCancelledChildren.reduce(
        (acc, child) => acc + (child.bytesUploaded ?? 0),
        0
      );
    },
    set(key, value) {
      return this.overriddenComputedFields.bytesUploaded = value;
    },
  }),

  /**
   * Errors related to uploading this file or nested files in directory.
   * @virtual optional
   * @type {Ember.ComputedProperty<Array<unknown>>}
   */
  errors: computed('objectType', 'children.@each.errors', {
    get() {
      if (this.overriddenComputedFields.errors !== undefined) {
        return this.overriddenComputedFields.errors;
      } else if (this.objectType === 'file') {
        return [];
      } else {
        return this.children?.reduce(
          (acc, child) => acc.concat(child.errors ?? []),
          []
        ) ?? [];
      }
    },
    set(key, value) {
      return this.overriddenComputedFields.errors = value;
    },
  }),

  /**
   * True if object is cancelled, false otherwise. Should be overridden with
   * a boolean if objectType is `file`.
   * @virtual optional
   * @type {Ember.ComputedProperty<boolean>}
   */
  isCancelled: computed('objectType', 'children.@each.isCancelled', {
    get() {
      if (this.overriddenComputedFields.isCancelled !== undefined) {
        return this.overriddenComputedFields.isCancelled;
      } else if (this.objectType === 'file') {
        return false;
      } else {
        return this.children?.every((child) => child.isCancelled) ?? false;
      }
    },
    set(key, value) {
      return this.overriddenComputedFields.isCancelled = value;
    },
  }),

  /**
   * True if object is uploading. Should be overridden with a boolean if
   * objectType is `file`.
   * @virtual optional
   * @type {Ember.ComputedProperty<boolean>}
   */
  isUploading: computed('objectType', 'children.@each.isUploading', {
    get() {
      if (this.overriddenComputedFields.isUploading !== undefined) {
        return this.overriddenComputedFields.isUploading;
      } else if (this.objectType === 'file') {
        return true;
      } else {
        return this.children?.some((child) => child.isUploading) ?? false;
      }
    },
    set(key, value) {
      return this.overriddenComputedFields.isUploading = value;
    },
  }),

  /**
   * Contains values used to override virtual computed fields
   * @type {Object}
   */
  overriddenComputedFields: undefined,

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
  numberOfFiles: computed(
    'objectType',
    'children.@each.numberOfFiles',
    function numberOfFiles() {
      if (this.objectType === 'file') {
        return this.isCancelled ? 0 : 1;
      }

      return this.children?.reduce(
        (acc, child) => acc + (child.numberOfFiles ?? 0),
        0
      ) ?? 0;
    }
  ),

  /**
   * Number of uploaded files (calculated recurrently). If this object represents
   * a file, then numberOfFiles is 1 if it is uploaded, or 0 otherwise.
   * @type {Ember.ComputedProperty<number>}
   */
  numberOfUploadedFiles: computed(
    'objectType',
    'state',
    'children.@each.numberOfUploadedFiles',
    function numberOfUploadedFiles() {
      if (this.objectType === 'file') {
        return this.state === 'uploaded' ? 1 : 0;
      }

      return this.children?.reduce(
        (acc, child) => acc + (child.numberOfUploadedFiles ?? 0),
        0
      ) ?? 0;
    }
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
          const childrenStates = new Set(children.mapBy('state'));
          childrenStates.delete('uploaded');
          childrenStates.delete('uploading');
          const everyChildrenIsOk = childrenStates.size === 0;

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

    this.setProperties({
      startTime: moment().valueOf(),
      overriddenComputedFields: {},
    });
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
      this.set('isUploading', false);
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
