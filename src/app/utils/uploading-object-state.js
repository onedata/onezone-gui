import EmberObject, { computed, get } from '@ember/object';
import { conditional, equal, sum, lt, not, and, array, raw, writable } from 'ember-awesome-macros';
import _ from 'lodash';

export default EmberObject.extend({
  /**
   * Full uploading object path. It should be trimmed from `/` character
   * @virtual
   * @type {string}
   */
  objectPath: undefined,

  /**
   * One of `file`, `directory`, `root`
   * `root` is a top level collection of all selected files from the 0 level of
   * tree nesting - is not related to any real directory
   * @virtual
   * @type {string}
   */
  objectType: undefined,

  /**
   * Error related to uploading this file. May be not empty only if `objectType`
   * is `file`
   * @virtual
   * @type {any}
   */
  error: undefined,

  /**
   * @virtual
   * @type {Utils.UploadingObjectState|null}
   */
  parent: undefined,

  /**
   * Nested objects (1 level deep) (if this object is a directory)
   * @virtual
   * @type {Ember.A<Utils.UploadingObjectState>}
   */
  children: undefined,

  /**
   * Only available when `objectType` is `root`
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,
  
  /**
   * Only available when `objectType` is `root`
   * @virtual
   * @type {number}
   */
  uploadId: undefined,

  /**
   * Object size (in bytes). Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  objectSize: writable(
    sum(array.mapBy('children', raw('objectSize')))
  ),

  /**
   * Always is <= `objectSize`. Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  bytesUploaded: writable(
    sum(array.mapBy('children', raw('bytesUploaded')))
  ),

  /**
   * True if object is uploading, false otherwise (e.g. when error occurred or
   * upload finished successfully).
   * @type {Ember.ComputedProperty<boolean>}
   */
  isUploading: conditional(
    equal('objectType', raw('file')),
    and(not('error'), lt('bytesUploaded', 'objectSize')),
    array.isAny('children', raw('isUploading'))
  ),

  /**
   * Object name (extracted from object path)
   * @type {Ember.ComputedProperty<string>}
   */
  objectName: computed('objectPath', function objectName() {
    return get(this.get('objectPath').split('/'), 'lastObject');
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
    raw(1),
    sum(array.mapBy('children', raw('numberOfFiles')))
  ),

  /**
   * @type {Utils.UploadingObjectState|null}
   */
  root: computed('objectType', 'parent.root', function () {
    if (this.get('objectType') === 'root') {
      return this;
    } else {
      return this.get('parent.root');
    }
  }),

  /**
   * One of `uploading`, `uploaded`, `partiallyUploading`, `failed`.
   * `partiallyUploading` is used for directories, that have both
   * uploading/uploaded and failed files.
   * @virtual
   * @type {string}
   */
  state: computed(
    'objectType',
    'isUploading',
    'objectSize',
    'bytesUploaded',
    'children.@each.{state}',
    function state() {
      const {
        objectType,
        isUploading,
        objectSize,
        bytesUploaded,
        children,
      } = this.getProperties(
        'objectType',
        'isUploading',
        'objectSize',
        'bytesUploaded',
        'children'
      );
      if (isUploading) {
        if (objectType === 'file') {
          return 'uploading';
        } else {
          const everyChildrenIsOk = children.every(child => 
            ['uploaded', 'uploading'].includes(get(child, 'state'))
          );
          if (everyChildrenIsOk) {
            return 'uploading';
          } else {
            return 'partiallyUploading';
          }
        }
      } else if (bytesUploaded < objectSize) {
        return 'failed';
      } else {
        return 'uploaded';
      }
    }
  ),

  /**
   * Object upload progress (in percents 0-100).
   * @type {Ember.ComputedProperty<number>}
   */
  progress: computed('objectSize', 'bytesUploaded', function progress() {
    const {
      objectSize,
      bytesUploaded,
    } = this.getProperties('objectSize', 'bytesUploaded');
    if (objectSize === 0 && bytesUploaded === 0) {
      return 100;
    } else if (!objectSize || !bytesUploaded ) {
      return 0;
    } else {
      return Math.floor((bytesUploaded / objectSize) * 100);
    }
  }),

  /**
   * @returns {undefined}
   */
  cancel() {
    const parent = this.get('parent');
    if (parent) {
      const parentChildren = get(parent, 'children');
      parentChildren.removeObject(this);
      if (!get(parentChildren, 'length') && get(parent, 'type') !== 'root') {
        // Cancel parent if it does not contain any file
        parent.cancel();
      }
    }
  },

  /**
   * Traverses through upload objects structure to find object related to
   * given path
   * @param {string} relativePath
   * @returns {Utils.UploadingObjectState|null} null if not found
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
   * @returns {Array<Utils.UploadingObjectState>}
   */
  getAllNestedFiles() {
    const children = this.get('children');
    if (children) {
      const directFiles = children.filterBy('type', 'file');
      const indirectFiles = _.flatten(
        children.rejectBy('type', 'file').invoke('getAllNestedFiles')
      );
      return directFiles.concat(indirectFiles);
    } else {
      return [];
    }
  },
});
