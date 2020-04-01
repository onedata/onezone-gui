/**
 * Manages upload process by communicating with oneprovider iframes and
 * dealing with UploadObject objects.
 *
 * @module services/upload-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import EmberObject, {
  computed,
  observer,
  get,
  getProperties,
  set,
  setProperties,
} from '@ember/object';
import UploadObject from 'onezone-gui/utils/upload-object';
import { A } from '@ember/array';
import { reads } from '@ember/object/computed';
import { array, gt, raw, conditional, collect } from 'ember-awesome-macros';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import gri from 'onedata-gui-websocket-client/utils/gri';
import _ from 'lodash';
import { getOwner } from '@ember/application';

export default Service.extend(I18n, {
  embeddedIframeManager: service(),
  router: service(),
  i18n: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.uploadManager',

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @type {boolean}
   */
  areFloatingUploadsVisible: true,

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils.UploadObject>>}
   */
  uploadRootObjects: computed(() => A()),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Utils.UploadObject>>}
   */
  floatingUploads: computed(() => A()),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Models.Provider>>}
   */
  uploadingOneproviders: array.uniq(
    array.mapBy('uploadRootObjects', raw('oneprovider'))
  ),

  /**
   * @type {Ember.ComputedProperty<EmberObject>}
   */
  allOneprovidersItem: computed(
    function allOneprovidersItem() {
      return EmberObject.create({
        id: gri({
          entityType: 'provider',
          entityId: 'all',
        }),
        entityId: 'all',
        isAllOneproviders: true,
        name: this.t('allUploads'),
      });
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Ember.A<Models.Provider>>}
   */
  sidebarOneproviders: conditional(
    'uploadingOneproviders.length',
    array.concat(
      collect('allOneprovidersItem'),
      'uploadingOneproviders'
    ),
    raw([]),
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasUploads: gt('uploadingOneproviders.length', raw(0)),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadObject>>}
   */
  activeUploads: array.filterBy('uploadRootObjects', raw('isUploading')),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  hasActiveUploads: gt('activeUploads.length', raw(0)),

  /**
   * @type {Ember.ComputedProperty<Array<Utils.UploadObject>>}
   */
  uploadsForGlobalProgress: computed(() => A()),

  /**
   * @type {Ember.ComputedProperty<number|undefined>}
   */
  globalProgress: computed(
    'uploadsForGlobalProgress.@each.{progress,objectSize}',
    function globalProgress() {
      const uploadsForGlobalProgress = this.get('uploadsForGlobalProgress');
      if (get(uploadsForGlobalProgress, 'length') === 0) {
        return undefined;
      } else {
        const totalBytes = _.sum(uploadsForGlobalProgress.mapBy('objectSize'));
        const totalUploadedBytes =
          _.sum(uploadsForGlobalProgress.mapBy('bytesUploaded'));
        if (!totalBytes || !totalUploadedBytes) {
          return 0;
        } else {
          return Math.floor((totalUploadedBytes / totalBytes) * 100);
        }
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Utils.UploadObject>}
   * UploadObject that accumulates all floating uploads
   * stats to single upload visible in mobile mode.
   */
  floatingSummaryRootDirectory: computed(
    function floatingSummaryRootDirectory() {
      return UploadObject.create(getOwner(this).ownerInjection(), {
        uploadManager: this,
        objectType: 'root',
        children: reads('uploadManager.floatingUploads'),
      });
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Function>}
   */
  pageUnloadHandler: computed(function pageUnloadHandler() {
    return (event) => this.onPageUnload(event);
  }),

  hasActiveUploadsObserver: observer(
    'hasActiveUploads',
    function hasActiveUploadsObserver() {
      if (!this.get('hasActiveUploads')) {
        this.set('uploadsForGlobalProgress', A());
      }
    }
  ),

  embeddedIframesObserver: observer(
    'embeddedIframeManager.embeddedIframes.[]',
    function embeddedIframesObserver() {
      // attach actions related to uploading to new embedded oneprovider iframes
      this.get('embeddedIframeManager.embeddedIframes')
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
            uploadInitialized: (data) =>
              this.uploadInitialized(Object.assign({ oneprovider }, data)),
          });
        });
    }
  ),

  init() {
    this._super(...arguments);
    this.embeddedIframesObserver();
    this.attachPageUnloadHandler();
    this.hasActiveUploadsObserver();
  },

  /**
   * @returns {undefined}
   */
  attachPageUnloadHandler() {
    const {
      _window,
      pageUnloadHandler,
    } = this.getProperties('pageUnloadHandler', '_window');
    _window.addEventListener('beforeunload', pageUnloadHandler);
  },

  /**
   * @param {Event} unloadEvent 
   * @returns {undefined}
   */
  onPageUnload(unloadEvent) {
    if (this.get('hasActiveUploads')) {
      // Code based on https://stackoverflow.com/a/19538231
      const confirmationMessage = this.t('confirmPageClose');
      event.preventDefault();
      (unloadEvent || window.unloadEvent).returnValue = confirmationMessage;
      return confirmationMessage;
    }
  },

  /**
   * @param {Utils.UploadObject} uploadObject
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
   * @returns {Utils.UploadObject|null}
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
      const uploadRootObject = get(uploadObject, 'root');

      if (bytesUploaded !== undefined) {
        set(uploadObject, 'bytesUploaded', bytesUploaded);
      }
      if (error !== undefined) {
        setProperties(uploadObject, {
          errors: [error],
          isUploading: false,
        });
      }
      if (success === true) {
        setProperties(uploadObject, {
          success,
          errors: [],
          isCancelled: false,
          isUploading: false,
        });
      }
      // In case of many updates in the same time sometimes root upload object
      // does not react to all changes in children state. We need to refresh
      // root state manually.
      uploadRootObject.notifyPropertyChange('state');

      // Recaulculate ownership if upload finished
      if (!get(uploadRootObject, 'isUploading')) {
        this.setOwnershipOfEmbeddedIframe(oneprovider);
      }
    }
  },

  /**
   * Recalculates uploading state, that will be then injected to oneprovider
   * iframe
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

      embeddedIframe.setSharedProperty('uploadFiles', oneproviderData);
      this.setOwnershipOfEmbeddedIframe(oneprovider);
    }
  },

  uploadInitialized({ oneprovider, uploadId, path, fileId, spaceId }) {
    const uploadObject = this.findUploadObject(oneprovider, uploadId, path);
    setProperties(uploadObject, {
      fileId,
      spaceId,
    });
    this.updateDataForOneprovider(oneprovider);
  },

  /**
   * @param {Object} newUpload
   * @param {Models.Provider} oneprovider
   * @param {number} updateData.uploadId
   * @param {Array<{ path: string, size: number, fileId: string, spaceId: string }>} updateData.files
   * @returns {undefined}
   */
  addNewUpload({ oneprovider, uploadId, files }) {
    const {
      uploadRootObjects,
      floatingUploads,
      navigationState,
      uploadsForGlobalProgress,
    } = this.getProperties(
      'uploadRootObjects',
      'floatingUploads',
      'navigationState',
      'uploadsForGlobalProgress'
    );

    const {
      activeResourceType,
      activeResource,
    } = getProperties(
      navigationState,
      'activeResourceType',
      'activeResource'
    );

    // Determine space (upload target) from navigationState
    let space;
    if (activeResourceType === 'spaces' && activeResource) {
      space = activeResource;
    }

    // Create tree schema
    const rootTreeSchema = this.createTreeSchemaFromFileList(files);
    // Convert tree schema to real upload state objects
    const root = this.createUploadObjectFromTree(rootTreeSchema);
    setProperties(root, {
      space,
      oneprovider,
      uploadId,
    });

    uploadRootObjects.addObject(root);
    floatingUploads.addObject(root);
    uploadsForGlobalProgress.addObject(root);
    this.updateDataForOneprovider(oneprovider);
  },

  /**
   * Generates tree schema (nested objects structure) with simplified version
   * of upload objects. It can be used then to generate real upload objects
   * structure.
   * @param {Array<{ path: string, size: number }>} files flattened files
   *   structure
   * @returns {Object} nested object structure, that represents upload
   *   directories. Objects has keys: objectPath, objectType and children.
   *   Example:
   *     For [{ path: 'dir1/file1', size: 12 }, { path: 'file2', size: 800 }]
   *     it returns:
   *     ```
   *       {
   *         objectType: 'root',
   *         children: {
   *           dir1: {
   *             objectPath: 'dir1',
   *             objectType: 'directory',
   *             children: {
   *               file1: {
   *                 objectPath: 'dir1/file1',
   *                 objectType: 'file',
   *                 children: {},
   *                 size: 12,
   *               },
   *             },
   *           },
   *           file2: {
   *             objectPath: 'file2',
   *             objectType: 'file',
   *             children: {},
   *             size: 800,
   *           },
   *         },
   *       }
   *     ```
   */
  createTreeSchemaFromFileList(files) {
    const rootTreeSchema = {
      objectType: 'root',
      children: {},
    };
    files.forEach(({ path, size, fileId, spaceId }) => {
      const pathElements = path.split('/').filter(element => element);
      // path without possible surrounding `/` characters
      const strippedPath = pathElements.join('/');
      if (strippedPath) {
        let nextElementParent = rootTreeSchema;
        // loop over every level of nesting in file path
        for (let i = 0; i < pathElements.length; i++) {
          // search for existing node in already generated tree
          let node = nextElementParent.children[pathElements[i]];
          // if not exist, create new one and attach to children object of
          // nextElementParent
          if (!node) {
            // if this path element is a last one, then it must be a file node
            const objectType =
              i === pathElements.length - 1 ? 'file' : 'directory';
            node = {
              objectPath: pathElements.slice(0, i + 1).join('/'),
              objectType,
              children: {},
            };
            if (objectType === 'file') {
              setProperties(node, {
                objectSize: size,
                fileId,
                spaceId,
              });
            }
            nextElementParent.children[pathElements[i]] = node;
          }
          nextElementParent = node;
        }
      }
    });
    return rootTreeSchema;
  },

  /**
   * Converts treeSchema of upload objects to real upload objects.
   * Is a recurrent function, so calls itself on every children in
   * `treeSchema`.
   * @param {Object} treeSchema schema from `createTreeSchemaFromFileList`
   *   method (may be a nested part of it)
   * @param {Utils.UploadObject} parent parent node where `treeSchema`
   *   should be converted
   * @returns {Utils.UploadObject}
   */
  createUploadObjectFromTree(treeSchema, parent) {
    const {
      objectPath,
      objectType,
      objectSize,
      fileId,
      spaceId,
      children,
    } = getProperties(
      treeSchema,
      'objectPath',
      'objectType',
      'objectSize',
      'fileId',
      'spaceId',
      'children'
    );

    const uploadObject = UploadObject.create(getOwner(this).ownerInjection(), {
      objectPath,
      objectType,
      fileId,
      spaceId,
      parent,
    });

    if (objectSize !== undefined) {
      set(uploadObject, 'objectSize', objectSize);
    }

    if (objectType !== 'file') {
      const childrenObjects = Object.keys(children)
        .sort((a, b) => a.localeCompare(b))
        .map(key => this.createUploadObjectFromTree(children[key], uploadObject));
      set(uploadObject, 'children', A(childrenObjects));
    }

    return uploadObject;
  },

  /**
   * @param {Models.Provider} oneprovider 
   * @returns {Utils.EmbeddedIframe}
   */
  getEmbeddedIframe(oneprovider) {
    return this.get('embeddedIframeManager.embeddedIframes')
      .find(embIframe =>
        get(embIframe, 'iframeType') === 'oneprovider' &&
        get(embIframe, 'relatedData') === oneprovider
      );
  },

  /**
   * Modifies ownership of oneprovider embedded iframe according to whether or
   * not active uploads are available for this provider
   * @param {Models.Provider} oneprovider
   * @returns {undefined}
   */
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
      } else if (existingOwnership) {
        owners.removeObject(existingOwnership);
      }
    }
  },
});
