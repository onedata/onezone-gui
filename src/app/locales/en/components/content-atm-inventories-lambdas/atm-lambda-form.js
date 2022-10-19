import taskResourcesFields from '../../onedata-gui-common/utils/workflow-visualiser/task-resources-fields';

const argumentAndResultTypes = {
  integer: {
    label: 'Integer',
  },
  string: {
    label: 'String',
  },
  object: {
    label: 'Object',
  },
  anyFile: {
    label: 'Any file',
  },
  regularFile: {
    label: 'Regular file',
  },
  directory: {
    label: 'Directory',
  },
  symlink: {
    label: 'Symbolic link',
  },
  dataset: {
    label: 'Dataset',
  },
  // TODO: VFS-7816 uncomment or remove future code
  // archive: {
  //   label: 'Archive',
  // },
  // singleValueStore: {
  //   label: 'Single value store',
  // },
  // listStore: {
  //   label: 'List store',
  // },
  // mapStore: {
  //   label: 'Map store',
  // },
  // treeForestStore: {
  //   label: 'Tree forest store',
  // },
  // rangeStore: {
  //   label: 'Range store',
  // },
  // histogramStore: {
  //   label: 'Histogram store',
  // },
  range: {
    label: 'Range',
  },
  timeSeriesMeasurement: {
    label: 'Time series measurement',
  },
};

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
      entry: {
        entryName: {
          label: 'Name',
          placeholder: 'Name',
          errors: {
            notUnique: 'This field must have a unique value',
          },
        },
        entryType: {
          label: 'Type',
          options: argumentAndResultTypes,
        },
        entryIsArray: {
          label: 'Array',
        },
        entryIsOptional: {
          label: 'Optional',
        },
        entryDefaultValue: {
          label: 'Default value',
          placeholder: 'Default value (optional)',
        },
      },
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
        entryType: {
          label: 'Type',
          options: argumentAndResultTypes,
        },
        entryIsArray: {
          label: 'Array',
        },
        entryIsViaFile: {
          label: 'Via file',
        },
      },
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
