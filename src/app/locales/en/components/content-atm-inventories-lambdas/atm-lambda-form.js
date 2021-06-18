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
  histogram: {
    label: 'Histogram',
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
  dataset: {
    label: 'Dataset',
  },
  archive: {
    label: 'Archive',
  },
  singleValueStore: {
    label: 'Single value store',
  },
  listStore: {
    label: 'List store',
  },
  mapStore: {
    label: 'Map store',
  },
  treeForestStore: {
    label: 'Tree forest store',
  },
  rangeStore: {
    label: 'Range store',
  },
  histogramStore: {
    label: 'Histogram store',
  },
  onedatafsCredentials: {
    label: 'OnedataFS credentials',
  },
};

export default {
  fields: {
    name: {
      label: 'Name',
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
        entryBatch: {
          label: 'Batch',
        },
        entryOptional: {
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
        entryBatch: {
          label: 'Batch',
        },
      },
    },
  },
  submit: {
    create: 'Create',
    edit: 'Save',
  },
  cancel: 'Cancel',
};
