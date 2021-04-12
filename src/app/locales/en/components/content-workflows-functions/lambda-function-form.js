export default {
  fields: {
    name: {
      label: 'Name',
    },
    shortDescription: {
      label: 'Short description (optional)',
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
      readOnly: {
        label: 'Read-only',
      },
    },
  },
};
