import EmberObject, { computed, get } from '@ember/object';
import { sum, array, raw, writable } from 'ember-awesome-macros';

export default EmberObject.extend({
  /**
   * Full uploading object path. It should be trimmed from `/` character
   * @virtual
   * @type {string}
   */
  objectPath: undefined,

  /**
   * One of `file`, `directory`
   * @virtual
   * @type {string}
   */
  objectType: undefined,

  /**
   * Nested objects (if this object is a directory)
   * @virtual
   * @type {Ember.A<Utils.UploadingObjectState>}
   */
  children: undefined,

  /**
   * Object size (in bytes). Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  objectSize: writable(
    sum(
      array.mapBy('children', raw('objectSize'))
    )
  ),

  /**
   * Always is <= `objectSize`. Should be overridden with a number if objectType
   * is `file`.
   * @virtual
   * @type {Ember.ComputedProperty<number>|number}
   */
  bytesUploaded: writable(
    sum(
      array.mapBy('children', raw('bytesUploaded'))
    )
  ),

  /**
   * True if object is uploading, false otherwise (e.g. when error occurred or
   * upload finished successfully). Should be overridden with a boolean if
   * objectType is `file`.
   * @type {Ember.ComputedProperty<boolean>|boolean}
   */
  isUploading: writable(
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
});
