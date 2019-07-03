import Service, { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get, getProperties, set, setProperties } from '@ember/object';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';

export default Service.extend({
  embeddedIframeManager: service(),
  router: service(),

  areFloatingUploadsVisible: computed(
    'router.currentURL',
    function areFloatingUploadsVisible() {
      return !this.get('router').isActive('onedata.sidebar', 'uploads');
    }
  ),

  uploadRootObjects: computed(function uploadObjects() {
    return A();
  }),

  floatingUploads: computed(function floatingUploads() {
    return A();
  }),

  uploadingProviders: computed(function uploadingProviders() {
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
    }, 2000);
  },

  /**
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  cancelUpload(uploadObject) {
    const floatingUploads = this.get('floatingUploads');
    const uploadObjectRoot = get(uploadObject, 'objectType') === 'root' ?
      uploadObject : get(uploadObject, 'root');
    
    uploadObject.cancel();
    if (get(uploadObjectRoot, 'isCancelled')) {
      floatingUploads.removeObject(uploadObjectRoot);
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
   * @param {number} updateData.bytesUploaded
   * @param {boolean} updateData.error
   * @param {boolean} updateData.success
   * @returns {Utils.UploadingObjectState|null}
   */
  updateUploadProgress({
    oneprovider,
    uploadId,
    path,
    bytesUploaded,
    error,
    success,
  }) {
    const uploadObject = this.findUploadObject(oneprovider, uploadId, path);
    if (uploadObject) {
      if (bytesUploaded !== undefined) {
        set(uploadObject, 'bytesUploaded', bytesUploaded);
      }
      if (error !== undefined) {
        setProperties(uploadObject, {
          error,
          isUploading: false,
        });
      }
      if (success === true) {
        setProperties(uploadObject, {
          success,
          error: undefined,
          isCancelled: false,
          isUploading: false,
        });
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
        .rejectBy('isCancelled')
        .forEach(uploadRootObject => {
          const uploadId = get(uploadRootObject, 'uploadId');
          oneproviderData[uploadId] = {
            files: uploadRootObject
              .getAllNestedFiles()
              .rejectBy('isCancelled')
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
    const {
      uploadRootObjects,
      floatingUploads,
      uploadingProviders,
    } = this.getProperties(
      'uploadRootObjects',
      'floatingUploads',
      'uploadingProviders'
    );

    const rootTreeSchema = this.createTreeSchemaFromFileList(files);
    const root = this.createUploadObjectFromTree(rootTreeSchema);
    setProperties(root, {
      oneprovider,
      uploadId,
    });
    uploadingProviders.addObject(oneprovider);
    uploadRootObjects.addObject(root);
    floatingUploads.addObject(root);
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
