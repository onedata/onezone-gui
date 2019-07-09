import Component from '@ember/component';
import { computed, observer, get } from '@ember/object';
import { conditional, and, not, array, raw } from 'ember-awesome-macros';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import _ from 'lodash';
import $ from 'jquery';

export default Component.extend({
  classNames: ['uploading-presenter'],
  classNameBindings: [
    'floatingMode:floating',
    'isHidden:hidden',
    'summaryActive',
  ],

  uploadingManager: service(),
  router: service(),

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
   * @type {boolean}
   */
  isSummaryDirectoryVisible: false,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  summaryActive: and(
    'floatingMode',
    'isSummaryDirectoryVisible',
    not('isHidden')
  ),

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
      let uploads;
      if (floatingMode) {
        uploads =
          this.set('orderedUploadObjects', filteredUploadObjects.toArray());
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
        uploads = this.set('orderedUploadObjects', orderedUploads);
      }
      if (get(uploads, 'length')) {
        this.set('isSummaryDirectoryVisible', true);
      }
    }
  ),

  uploadObjectsObserver: observer(
    'filteredUploadObjects.[]',
    function uploadObjectObserver() {
      const {
        filteredUploadObjects,
        orderedUploadObjects,
        floatingMode,
      } = this.getProperties(
        'filteredUploadObjects',
        'orderedUploadObjects',
        'floatingMode'
      );
      
      _.difference(orderedUploadObjects, filteredUploadObjects)
          .forEach(upload => orderedUploadObjects.removeObject(upload));

      const newUploads =
        _.difference(filteredUploadObjects, orderedUploadObjects);
      if (floatingMode) {
        orderedUploadObjects.addObjects(newUploads);
      } else {
        newUploads
          .reverseObjects()
          .forEach(upload => orderedUploadObjects.unshiftObject(upload));
      }

      if (get(newUploads, 'length')) {
        this.set('isSummaryDirectoryVisible', true);
      }
    }
  ),

  summaryActiveObserver: observer(
    'summaryActive',
    function summaryActiveObserver() {
      next(() => this.get('_window').dispatchEvent(new Event('resize')));
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
    cancelSummaryDirectory() {
      this.get('uploadingManager.floatingSummaryRootDirectory.children')
        .forEach(rootObject => this.send('cancel', rootObject));
    },
    hideSummaryDirectory() {
      this.set('isSummaryDirectoryVisible', false);
    },
    goToUploads(event) {
      if (!$(event.target).closest('.upload-summary-header-icons').length) {
        this.get('router')
          .transitionTo('onedata.sidebar.content', 'uploads', 'all');
      }
    },  
  },
});
