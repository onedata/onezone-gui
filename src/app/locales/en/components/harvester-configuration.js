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
    },
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
  },
  metadataTypes: {
    header: 'Metadata types',
    typeField: 'Type field',
    types: 'Types',
    enterTypeName: 'Enter type name...',
    schema: 'Schema',
    add: 'Add',
    defaultType: 'Default type',
    noneType: 'None',
  },
  guiPlugin: {
    header: 'GUI plugin',
    path: 'Path',
    configuration: 'Configuration',

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
    indicesUpdateSuccess: 'Indices has been update successfully',
  },
  save: 'Save',
  create: 'Create',
};
