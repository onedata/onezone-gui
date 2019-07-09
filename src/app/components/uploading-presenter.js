import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { conditional, and, not, array, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import _ from 'lodash';

export default Component.extend({
  classNames: ['uploading-presenter'],
  classNameBindings: [
    'floatingMode:floating',
    'isHidden:hidden',
  ],

  uploadingManager: service(),

  /**
   * @virtual
   * @type {Models.Provider}
   */
  oneprovider: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  floatingMode: false,

  /**
   * @virtual
   * @type {string}
   * Used only if `floatingMode` is true.
   */
  minimizeTargetSelector: undefined,

  /**
   * @type {Ember.A<Utils.UploadingObjectState>}
   */
  orderedUploadObjects: undefined,

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils.UploadingObjectState>>}
   */
  expandedUploads: computed(function expandedUploads() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isHidden: and(
    not('uploadingManager.areFloatingUploadsVisible'),
    'floatingMode'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadingObjectState>>}
   */
  uploadObjects: conditional(
    'floatingMode',
    'uploadingManager.floatingUploads',
    'uploadingManager.uploadRootObjects'
  ),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadingObjectState>>}
   */
  filteredUploadObjects: conditional(
    'oneprovider',
    array.filterBy('uploadObjects', raw('oneprovider'), 'oneprovider'),
    'uploadObjects'
  ),

  uploadObjectsOrderReset: observer(
    'floatingMode',
    'oneprovider',
    function uploadObjectsOrderReset() {
      const {
        floatingMode,
        filteredUploadObjects,
      } = this.getProperties('floatingMode', 'filteredUploadObjects');
      if (floatingMode) {
        this.set('orderedUploadObjects', filteredUploadObjects);
      } else {
        const activeUploads = filteredUploadObjects
          .filterBy('isUploading')
          .sortBy('startTime')
          .reverseObjects();
        const doneUploads = filteredUploadObjects
          .rejectBy('isUploading')
          .sortBy('endTime')
          .reverseObjects();
        
        const orderedUploads = activeUploads.concat(doneUploads);
        this.set('orderedUploadObjects', orderedUploads);
      }
    }
  ),

  uploadObjectsObserver: observer(
    'filteredUploadObjects.[]',
    function uploadObjectObserver() {
      const {
        filteredUploadObjects,
        orderedUploadObjects,
      } = this.getProperties(
        'filteredUploadObjects',
        'orderedUploadObjects'
      );

      _.difference(orderedUploadObjects, filteredUploadObjects)
        .forEach(upload => orderedUploadObjects.removeObject(upload));
      _.difference(filteredUploadObjects, orderedUploadObjects)
        .reverseObjects()
        .forEach(upload => orderedUploadObjects.unshiftObject(upload));
    }
  ),

  init() {
    this._super(...arguments);

    this.uploadObjectsOrderReset();
  },

  actions: {
    toggleExpand(uploadObject) {
      const {
        expandedUploads,
        floatingMode,
      } = this.getProperties('expandedUploads', 'floatingMode');

      const isExpanded = expandedUploads.includes(uploadObject);
      if (isExpanded) {
        expandedUploads.removeObject(uploadObject);
      } else {
        if (floatingMode) {
          expandedUploads.clear();
        }
        expandedUploads.addObject(uploadObject);
      }
    },
    toggleMinimize(uploadObject) {
      const floatingUploads = this.get('uploadingManager.floatingUploads');
      if (floatingUploads.includes(uploadObject)) {
        floatingUploads.removeObject(uploadObject);
      } else {
        floatingUploads.addObject(uploadObject);
      }
    },
    cancel(uploadObject) {
      this.get('uploadingManager').cancelUpload(uploadObject);
    },
  },
});
