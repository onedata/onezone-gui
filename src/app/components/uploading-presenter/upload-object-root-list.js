import Component from '@ember/component';

export default Component.extend({
  classNames: ['up-upload-object-root-list'],

  /**
   * @virtual
   * @type {Array<Utils.UploadingObjectState>}
   */
  uploadObjects: undefined,
});
