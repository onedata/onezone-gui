import Service, { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get, getProperties, set, setProperties } from '@ember/object';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';

export default Service.extend({
  embeddedIframeManager: service(),

  uploadRootObjects: computed(function uploadObjects() {
    return A();
  }),

  embeddedIframesObserver: observer(
    'embeddedIframeManager.embeddedIframes.[]',
    function embeddedIframesObserver() {
      const embeddedIframes = this.get('embeddedIframeManager.embeddedIframes');
      embeddedIframes
        .filterBy('iframeType', 'oneprovider')
        .reject(embIframe =>
          get(embIframe, 'callParentCallbacks.updateUploadProgress')
        )
        .forEach(embIframe => {
          const {
            relatedData: oneprovider,
            callParentCallbacks,
          } = getProperties(embIframe, 'relatedData', 'callParentCallbacks');
          setProperties(callParentCallbacks, {
            updateUploadProgress: (data) =>
              this.updateUploadProgress(Object.assign({ oneprovider }, data)),
            addNewUpload: (data) =>
              this.addNewUpload(Object.assign({ oneprovider }, data)),
          });
        });
    }
  ),

  init() {
    this._super(...arguments);
    this.embeddedIframesObserver();
    setTimeout(() => {
      const oneprovider = this.get('embeddedIframeManager.embeddedIframes.firstObject.relatedData');
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
      // this.addNewUpload({
      //   oneprovider,
      //   uploadId: 2,
      //   files: [{
      //     path: 'test/doc.txt',
      //     size: 1024,
      //   }],
      // });
      // this.updateUploadProgress({
      //   oneprovider,
      //   uploadId: 2,
      //   path: 'test/doc.txt',
      //   bytesUploaded: 400,
      // });
    }, 2000);
    // const oneprovider = { entityId: 'prov1' };
    
  },

  /**
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  cancelUpload(uploadObject) {
    const uploadRootObjects = this.get('uploadRootObjects');
    let uploadObjectRoot;
    if (get(uploadObject, 'objectType') === 'root') {
      uploadObjectRoot = uploadObject;
      uploadRootObjects.removeObject(uploadObject);
    } else {
      uploadObjectRoot = get(uploadObject, 'root');
      uploadObject.cancel();
      if (get(uploadObjectRoot, 'children.length') === 0) {
        uploadRootObjects.removeObject(uploadObjectRoot);
      }
    }
    this.updateDataForOneprovider(get(uploadObjectRoot, 'oneprovider'));
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
      if (bytesUploaded !== undefined) {
        set(uploadObject, 'bytesUploaded', bytesUploaded);
      }
      if (error !== undefined) {
        set(uploadObject, 'error', error);
      }
    }
  },

  /**
   * @param {Models.Provider} oneprovider
   * @returns {undefined}
   */
  updateDataForOneprovider(oneprovider) {
    const embeddedIframe = this.getEmbeddedIframe(oneprovider);
    if (embeddedIframe) {
      const uploadRootObjects = this.get('uploadRootObjects');

      const oneproviderData = {};
      uploadRootObjects
        .filterBy('oneprovider', oneprovider)
        .forEach(uploadRootObject => {
          const uploadId = get(uploadRootObject, 'uploadId');
          oneproviderData[uploadId] = {
            files: uploadRootObject
              .getAllNestedFiles()
              .map(uploadObject => ({ path: get(uploadObject, 'objectPath') })),
          };
        });
        
      embeddedIframe.setSharedProperty('uploadingFiles', oneproviderData);
      this.setOwnershipOfEmbeddedIframe(oneprovider);
    }
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
    this.updateDataForOneprovider(oneprovider);
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

  getEmbeddedIframe(oneprovider) {
    return this.get('embeddedIframeManager.embeddedIframes')
      .find(embIframe =>
        get(embIframe, 'iframeType') === 'oneprovider' &&
        get(embIframe, 'relatedData') === oneprovider
      );
  },

  setOwnershipOfEmbeddedIframe(oneprovider) {
    const embeddedIframe = this.getEmbeddedIframe(oneprovider);
    if (embeddedIframe) {
      const uploadRootObjects = this.get('uploadRootObjects');
      const oneproviderHasUpload = uploadRootObjects
        .filterBy('oneprovider', oneprovider)
        .isAny('isUploading');
      
      const owners = get(embeddedIframe, 'owners');
      const existingOwnership = owners.findBy('ownerReference', this);
      if (oneproviderHasUpload) {
        if (!existingOwnership) {
          owners.pushObject(EmberObject.create({
            ownerReference: this,
          }));
        }
      } else {
        owners.removeObject(existingOwnership);
      }
    }
  },
});
