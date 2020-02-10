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
        tip: 'Onezone plugin used to integrate with an external harvesting service (e.g. Elasticsearch). Can provide persistence and analytics for harvested metadata.',
      },
      endpoint: {
        label: 'Endpoint',
        tip: 'Location of the harvesting service (e.g. Elasticsearch) where the plugin will feed incoming metadata and perform queries.',
      },
      public: {
        label: 'Public',
        tip: 'If enabled, anyone with the public link can browse the harvested metadata or use the REST API for queries.',
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
    aboutGuiPlugin: 'GUI plugin is a self-contained web application that allows to query and visualize harvested metadata in a customizable way. After uploading, it is embedded into the Onezone interface. It communicates with the underlying harvesting service through Onezone. The plugin can be customized in the configuration section below.',
    guiUpload: {
      header: 'GUI plugin upload',
      sectionHint: 'GUI plugin should be a standalone, static web application compressed in tar.gz format. Only plugins that are whitelisted are accepted.',
      browse: 'Browse',
      upload: 'Upload',
      guiUploadSuccess: 'GUI plugin has been uploaded successfully',
      guiUploading: 'gui plugin uploading',
      guiPackageUnverifiedDescription: 'GUI plugin package verification failed, because SHA checksum of uploaded package is not whitelisted. To allow uploading this package please contact Onezone administrator and ask to add harvester GUI checksum {{checksum}} to /etc/oz_worker/compatibility.json configuration file.',
      percentDone: '{{percent}}% done...',
    },
    guiInfo: {
      header: 'Current GUI plugin',
      status: 'Status',
      uploading: 'uploading',
      uploaded: 'uploaded',
      cannotLoadManifest: 'cannot load manifest - upload correct GUI plugin',
      version: 'Version',
      unknown: 'unknown',
    },
    guiIndices: {
      sectionHint: 'A mapping between indices needed by the GUI plugin and real indices that are a part of this harvester. Onezone will proxy GUI plugin communication to the harvesting service according to that settings.',
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
      listReloadError: 'update index list error',
      createError: 'create index error',
      updateError: 'update index error',
    },
    guiJsonConfig: {
      sectionHint: 'Custom JSON configuration which allows to pass extra data needed to adjust the GUI plugin.',
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
