import Component from '@ember/component';
import { conditional, and, not } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['uploading-presenter'],
  classNameBindings: [
    'floatingMode:floating',
    'isHidden:hidden',
  ],

  uploadingManager: service(),

  /**
   * @type {Utils.UploadingObjectState|null}
   */
  expandedUpload: null,

  /**
   * @type {boolean}
   */
  floatingMode: false,

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

  actions: {
    toggleExpand(uploadObject) {
      const expandedUpload = this.get('expandedUpload');
      if (expandedUpload === uploadObject) {
        this.set('expandedUpload', null);
      } else {
        this.set('expandedUpload', uploadObject);
      }
    },
  },
});
