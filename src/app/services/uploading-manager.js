import Service, { inject as service } from '@ember/service';
import EmberObject, { computed, observer, get, getProperties, set, setProperties } from '@ember/object';
import UploadingObjectState from 'onezone-gui/utils/uploading-object-state';
import { A } from '@ember/array';
import { array, gt, raw } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import gri from 'onedata-gui-websocket-client/utils/gri';
import _ from 'lodash';

export default Service.extend(I18n, {
  embeddedIframeManager: service(),
  router: service(),
  i18n: service(),
  providerManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.uploadingManager',

  /**
   * @type {Window}
   */
  _window: window,

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

  uploadingOneproviders: array.uniq(array.mapBy('uploadRootObjects', raw('oneprovider'))),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allProvidersProviderAbstraction: computed(
    function allProvidersProviderAbstraction() {
      return EmberObject.create({
        id: gri({
          entityType: 'provider',
          entityId: 'all',
        }),
        entityId: 'all',
        isAllOneproviders: true,
        name: this.t('allOneproviders'),
      });
    }
  ),

  sidebarOneproviders: computed(function sidebarOneproviders() {
    return A();
  }),

  hasUploads: gt('uploadingOneproviders.length', raw(0)),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadingObjectState>>}
   */
  activeUploads: array.filterBy('uploadRootObjects', raw('isUploading')),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasActiveUploads: gt('activeUploads.length', raw(0)),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  globalProgress: computed(
    'activeUploads.@each.{progress,objectSize}',
    function globalProgress() {
      const activeUploads = this.get('activeUploads');
      if (get(activeUploads, 'length') === 0) {
        return undefined;
      } else {
        const totalBytes = _.sum(activeUploads.mapBy('objectSize'));
        const totalUploadedBytes = _.sum(activeUploads.mapBy('bytesUploaded'));
        if (!totalBytes || !totalUploadedBytes) {
          return 0;
        } else {
          return Math.floor((totalUploadedBytes / totalBytes) * 100);
        }
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  pageUnloadHandler: computed(function pageUnloadHandler() {
    return (event) => this.onPageUnload(event);
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

  uploadingOneprovidersObserver: observer(
    'uploadingOneproviders.[]',
    function uploadingOneprovidersObserver() {
      const {
        uploadingOneproviders,
        allProvidersProviderAbstraction,
        sidebarOneproviders,
      } = this.getProperties(
        'uploadingOneproviders',
        'allProvidersProviderAbstraction',
        'sidebarOneproviders'
      );
      sidebarOneproviders.clear();
      if (get(uploadingOneproviders, 'length')) {
        sidebarOneproviders.pushObject(allProvidersProviderAbstraction);
        sidebarOneproviders.pushObjects(uploadingOneproviders);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.embeddedIframesObserver();
    this.uploadingOneprovidersObserver();
    this.attachPageUnloadHandler();
    this.get('providerManager').getProviders().then(l => l.get('list')).then(list => list.objectAt(0)).then(oneprovider => {
      // setTimeout(() => {
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
      // }, 2000);
    });
    
  },

  attachPageUnloadHandler() {
    const {
      _window,
      pageUnloadHandler,
    } = this.getProperties('pageUnloadHandler', '_window');
    _window.addEventListener('beforeunload', pageUnloadHandler);
  },

  onPageUnload(event) {
    if (this.get('hasActiveUploads')) {
      // Code based on https://stackoverflow.com/a/19538231
      const confirmationMessage = this.t('confirmPageClose');
      event.preventDefault();
      (event || window.event).returnValue = confirmationMessage;
      return confirmationMessage;  
    }
  },

  /**
   * @param {Utils.UploadingObjectState} uploadObject
   * @returns {undefined}
   */
  cancelUpload(uploadObject) {
    uploadObject.cancel();

    const uploadObjectRoot = get(uploadObject, 'objectType') === 'root' ?
      uploadObject : get(uploadObject, 'root');
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
      // In case of many updates in the same time sometimes root upload object
      // does not react to all changes in children state. We need to refresh
      // root state manually.
      get(uploadObject, 'root').notifyPropertyChange('state');
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
    } = this.getProperties(
      'uploadRootObjects',
      'floatingUploads',
    );

    const rootTreeSchema = this.createTreeSchemaFromFileList(files);
    const root = this.createUploadObjectFromTree(rootTreeSchema);
    setProperties(root, {
      oneprovider,
      uploadId,
    });
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
