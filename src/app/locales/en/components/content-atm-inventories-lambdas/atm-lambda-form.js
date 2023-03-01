import taskResourcesFields from '../../onedata-gui-common/utils/workflow-visualiser/task-resources-fields';

export default {
  fields: {
    name: {
      label: 'Name',
    },
    state: {
      label: 'State',
      options: {
        draft: {
          label: 'Draft',
        },
        stable: {
          label: 'Stable',
        },
        deprecated: {
          label: 'Deprecated',
        },
      },
    },
    summary: {
      label: 'Summary (optional)',
    },
    engine: {
      label: 'Engine',
      options: {
        openfaas: {
          label: 'OpenFaaS',
        },
        onedataFunction: {
          label: 'Onedata function',
        },
      },
    },
    openfaasOptions: {
      dockerImage: {
        label: 'Docker image',
      },
      readonly: {
        label: 'Read-only',
      },
      mountSpace: {
        label: 'Mount space',
      },
      mountSpaceOptions: {
        mountPoint: {
          label: 'Mount point',
        },
        oneclientOptions: {
          label: 'Oneclient options',
        },
      },
    },
    onedataFunctionOptions: {
      onedataFunctionName: {
        label: 'Onedata function name',
      },
    },
    preferredBatchSize: {
      label: 'Preferred batch size',
    },
    arguments: {
      label: 'Arguments',
      addButtonText: 'Add argument',
    },
    results: {
      label: 'Results',
      addButtonText: 'Add result',
      entry: {
        entryName: {
          label: 'Name',
          placeholder: 'Name',
          errors: {
            notUnique: 'This field must have a unique value',
          },
        },
        entryIsViaFile: {
          label: 'Via file',
        },
      },
    },
    configParameters: {
      label: 'Configuration parameters',
      addButtonText: 'Add parameter',
    },
    resources: Object.assign({}, taskResourcesFields, {
      label: 'Resources',
    }),
  },
  submit: {
    create: 'Create',
    edit: 'Save',
  },
  cancel: 'Cancel',
};
