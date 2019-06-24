import Service from '@ember/service';
import { computed, set, setProperties } from '@ember/object';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';

export default Service.extend({
  uploadRootObjects: computed(function uploadObjects() {
    const file1 = UploadingObjectState.create({
      objectPath: 'dir1/test.txt',
      objectType: 'file',
      objectSize: 1024,
      bytesUploaded: 120,
      state: 'uploading',
    });
    const dir1 = UploadingObjectState.create({
      objectPath: 'dir1',
      objectType: 'directory',
      children: A([file1]),
    });
    set(file1, 'parent', dir1);
    return A([UploadingObjectState.create({
      type: 'root',
      children: A([dir1]),
    })]);
  }),

  /**
   * @param {Models.Provider} oneprovider
   * @param {number} uploadId
   * @param {string} path
   * @returns {Utils.UploadingObjectState|null}
   */
  findUploadObject(oneprovider, uploadId, path) {
    const rootObject = this.get('uploadRootObjects')
      .filterBy('oneprovider', oneprovider)
      .findBy('uploadId', uploadId);
    return rootObject ? rootObject.getFile(path) : null;
  },

  /**
   * @param {Object} updateData
   * @param {Models.Provider} updateData.oneprovider
   * @param {number} updateData.uploadId
   * @param {string} updateData.path
   * @param {boolean} updateData.error
   * @returns {Utils.UploadingObjectState|null}
   */
  updateUploadProgress({
    oneprovider,
    uploadId,
    path,
    bytesUploaded,
    error,
  }) {
    const uploadObject = this.findUploadObject(oneprovider, uploadId, path);
    if (uploadObject) {
      setProperties(uploadObject, {
        bytesUploaded,
        error,
      });
    }
  },
});
