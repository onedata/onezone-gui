import Service from '@ember/service';
import { computed, get, getProperties, set, setProperties } from '@ember/object';
import { raw, writable } from 'ember-awesome-macros';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';

export default Service.extend({
  uploadRootObjects: computed(function uploadObjects() {
    return A();
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  dataForOneproviders: writable(raw({})),

  init() {
    this._super(...arguments);
    const oneprovider = { entityId: 'prov1' };
    const uploadId = 1;
    this.addNewUpload({
      oneprovider,
      uploadId,
      files: [{
        path: 'test/doc.txt',
        size: 1024,
      }],
    });
    this.updateUploadProgress({
      oneprovider,
      uploadId,
      path: 'test/doc.txt',
      bytesUploaded: 700,
    });
    this.addNewUpload({
      oneprovider,
      uploadId: 2,
      files: [{
        path: 'test/doc.txt',
        size: 1024,
      }],
    });
    this.updateUploadProgress({
      oneprovider,
      uploadId: 2,
      path: 'test/doc.txt',
      bytesUploaded: 400,
    });
  },

  /**
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  cancelUpload(uploadObject) {
    const uploadRootObjects = this.get('uploadRootObjects');
    if (get(uploadObject, 'objectType') === 'root') {
      uploadRootObjects.removeObject(uploadObject);
    } else {
      uploadObject.cancel();
      const uploadObjectRoot = get(uploadObject, 'root');
      if (get(uploadObjectRoot, 'children.length') === 0) {
        uploadRootObjects.removeObject(uploadObjectRoot);
      }
    }
    this.updateDataForOneproviders();
  },

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

  /**
   * @returns {undefined}
   */
  updateDataForOneproviders() {
    const uploadRootObjects = this.get('uploadRootObjects');
    const dataForOneproviders = {};
    uploadRootObjects.forEach(uploadRootObject => {
      const {
        oneprovider,
        uploadId,
      } = getProperties(uploadRootObject, 'oneprovider', 'uploadId');
      const oneproviderId = get(oneprovider, 'entityId');
      const oneproviderData = get(dataForOneproviders, oneproviderId) || {};
      set(dataForOneproviders, oneproviderId, oneproviderData);

      oneproviderData[uploadId] = {
        files: uploadRootObject
          .getAllNestedFiles()
          .map(uploadObject => ({ path: get(uploadObject, 'objectPath') })),
      };
    });
    this.set('dataForOneproviders', dataForOneproviders);
  },

  /**
   * @param {Object} newUpload
   * @param {Models.Provider} oneprovider
   * @param {number} updateData.uploadId
   * @param {Array<{ path: string }>} updateData.files
   * @returns {undefined}
   */
  addNewUpload({ oneprovider, uploadId, files }) {
    const rootTreeSchema = this.createTreeSchemaFromFileList(files);
    const root = this.createUploadObjectFromTree(rootTreeSchema);
    setProperties(root, {
      oneprovider,
      uploadId,
    });
    this.get('uploadRootObjects').addObject(root);
    this.updateDataForOneproviders();
  },

  createTreeSchemaFromFileList(files) {
    const rootTreeSchema = {
      objectType: 'root',
      children: {},
    };
    files.forEach(({ path, size }) => {
      const pathElements = path.split('/').filter(element => element);
      // path without possible surrounding `/` characters
      const strippedPath = pathElements.join('/');
      if (strippedPath) {
        let nextElementParent = rootTreeSchema;
        for (let i = 0; i < pathElements.length; i++) {
          let node = nextElementParent.children[pathElements[i]];
          if (!node) {
            const objectType =
              i === pathElements.length - 1 ? 'file' : 'directory';
            node = {
              objectPath: pathElements.slice(0, i + 1).join('/'),
              objectType,
              children: {},
            };
            if (objectType === 'file') {
              set(node, 'objectSize', size);
            }
            nextElementParent.children[pathElements[i]] = node;
          }
          nextElementParent = node;
        }
      }
    });
    return rootTreeSchema;
  },

  createUploadObjectFromTree(treeSchema, parent) {
    const {
      objectPath,
      objectType,
      objectSize,
      children,
    } = getProperties(
      treeSchema,
      'objectPath',
      'objectType',
      'objectSize',
      'children'
    );

    const uploadObject = UploadingObjectState.create({
      objectPath,
      objectType,
      parent,
    });

    if (objectSize !== undefined) {
      set(uploadObject, 'objectSize', objectSize);
    }

    if (objectType !== 'file') {
      const childrenObjects = Object.keys(children)
        .map(key => this.createUploadObjectFromTree(children[key], uploadObject));
      set(uploadObject, 'children', A(childrenObjects));
    }

    return uploadObject;
  },
});
