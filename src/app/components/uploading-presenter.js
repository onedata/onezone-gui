import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['uploading-presenter'],

  uploadingManager: service(),

  /**
   * @type {Utils.UploadingObjectState|null}
   */
  expandedUpload: null,

  /**
   * @type {Array<Utils.UploadingObjectState>}
   */
  uploadObjects: reads('uploadingManager.uploadRootObjects'),

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
