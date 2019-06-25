import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  classNames: ['up-upload-object-root-list'],

  /**
   * @virtual
   * @type {Array<Utils.UploadingObjectState>}
   */
  uploadObjects: undefined,

  /**
   * Callback called when "Cancel" button is clicked
   * @virtual
   * @type {Function}
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  onCancel: notImplementedIgnore,
});
