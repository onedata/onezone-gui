import Component from '@ember/component';
import { computed } from '@ember/object';
import { conditional, and, not, array, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';

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
   * @type {Ember.ComputedProperty<Utils.UploadingObjectState>}
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
  },
});
