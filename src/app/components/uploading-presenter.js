import Component from '@ember/component';
import { computed } from '@ember/object';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';

export default Component.extend({
  classNames: ['uploading-presenter'],

  /**
   * TODO: remove
   */
  testData: computed(function () {
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
    return UploadingObjectState.create({
      children: A([dir1]),
    });
  }),
});
