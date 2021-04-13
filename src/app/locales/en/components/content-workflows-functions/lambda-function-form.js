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
      },
    },
    openfaasOptions: {
      dockerImage: {
        label: 'Docker image',
      },
    },
    arguments: {
      label: 'Arguments',
      argument: {
        argumentName: {
          placeholder: 'Name',
        },
        argumentType: {
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
          },
        },
        argumentArray: {
          label: 'Array',
        },
        argumentOptional: {
          label: 'Optional',
        },
        argumentDefaultValue: {
          placeholder: 'Default value (optional)',
        },
      },
    },
    results: {
      label: 'Results',
      result: {
        resultName: {
          placeholder: 'Name',
        },
        resultType: {
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
        resultArray: {
          label: 'Array',
        },
        resultOptional: {
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
