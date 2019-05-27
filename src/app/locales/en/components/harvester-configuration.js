export default {
  generalHeader: 'General',
  guiPluginHeader: 'GUI plugin',
  general: {
    fields: {
      name: {
        label: 'Name',
      },
      plugin: {
        label: 'Plugin',
      },
      endpoint: {
        label: 'Endpoint',
      },
      public: {
        label: 'Public',
      },
      publicUrl: {
        label: 'Public URL',
      },
    },
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
  },
  guiPlugin: {
    header: 'GUI plugin',
    path: 'Path',
    configuration: 'Configuration',
    guiUpload: {
      header: 'GUI plugin upload',
      browse: 'Browse',
      upload: 'Upload',
      guiUploadSuccess: 'GUI plugin has been uploaded successfully',
      guiUploading: 'gui plugin uploading',
      percentDone: '{{percent}}% done...',
    },
    guiInfo: {
      header: 'Current GUI plugin',
      status: 'Status',
      uploading: 'uploading',
      uploaded: 'uploaded',
      cannotLoadManifest: 'cannot load manifest',
      version: 'Version',
      unknown: 'unknown',
    },
    guiIndices: {
      waitingForUpload: 'Waiting for GUI plugin to upload...',
      manifestUnavailable: 'GUI plugin manifest file is unavailable. Upload correct GUI plugin to set up indices.',
      edit: 'Edit',
      cancel: 'Cancel',
      save: 'Save',
      indicesHeader: 'Indices',
      pluginIndex: 'GUI Plugin index',
      harvesterIndex: 'Harvester index',
      notAssigned: 'Not assigned',
      assignMethods: {
        create: 'Create new index',
        reuse: 'Use existing index',
        unassigned: 'Leave unassigned',
      },
      validationErrors: {
        nameUsedByExistingIndex: 'This name is already used by existing index',
        nameUsedToCreateAnotherIndex: 'This name is already used to create another index',
        isAlreadyAssigned: 'This index is already assigned',
      },
      indicesUpdating: 'indices updating',
      indicesUpdateSuccess: 'Indices has been updated successfully',
    },
    guiJsonConfig: {
      header: 'Injected configuration',
      edit: 'Edit',
      useDefaults: 'Use defaults',
      noDefaults: 'GUI plugin manifest does not provide any default configuration',
      cancel: 'Cancel',
      save: 'Save',
      configurationSaveSuccess: 'Configuration has been saved successfully',
      savingConfiguration: 'saving configuration',
    },
  },
  save: 'Save',
  create: 'Create',
};
