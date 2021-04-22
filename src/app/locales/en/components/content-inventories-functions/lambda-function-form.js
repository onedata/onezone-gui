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
    },
    onedataFunctionOptions: {
      onedataFunctionName: {
        label: 'Onedata function name',
      },
    },
    arguments: {
      label: 'Arguments',
      entry: {
        entryName: {
          label: 'Name',
          placeholder: 'Name',
        },
        entryType: {
          label: 'Type',
          options: {
            string: {
              label: 'String',
            },
            object: {
              label: 'Object',
            },
            listStream: {
              label: 'List stream',
            },
            mapStream: {
              label: 'Map stream',
            },
            filesTreeStream: {
              label: 'Files tree stream',
            },
            histogram: {
              label: 'Histogram',
            },
            onedatafsOptions: {
              label: 'OnedataFS options',
            },
          },
        },
        entryArray: {
          label: 'Array',
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
      entry: {
        entryName: {
          label: 'Name',
          placeholder: 'Name',
        },
        entryType: {
          label: 'Type',
          options: {
            string: {
              label: 'String',
            },
            object: {
              label: 'Object',
            },
            listStreamOperation: {
              label: 'List stream operation',
            },
            mapStreamOperation: {
              label: 'Map stream operation',
            },
            filesTreeStreamOperation: {
              label: 'Files tree stream operation',
            },
            dataReadStats: {
              label: 'Data read stats',
            },
            dataWriteStats: {
              label: 'Data write stats',
            },
            networkTransferStats: {
              label: 'Network transfer stats',
            },
            auditLogRecord: {
              label: 'Audit log record',
            },
          },
        },
        entryArray: {
          label: 'Array',
        },
        entryOptional: {
          label: 'Optional',
        },
      },
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
  submit: {
    create: 'Create',
  },
};
