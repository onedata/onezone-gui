export default {
  header: 'Add storage',
  copy: {
    token: {
      success: 'The support token has been copied to clipboard',
      error: 'Cannot copy the token to clipboard, please copy it manually',
    },
    command: {
      success: 'The command has been copied to clipboard',
      error: 'Cannot copy the command to clipboard, please copy it manually',
    },
  },
  requestSupport: {
    tabName: 'Request support',
    desc1: 'Request storage support for this space from existing provider.',
    desc2: 'Pass the token below to the administrator of the preferred ' +
      'storage provider (e.g. via email).',
    desc3: 'Each token can only be used once.',
  },
  exposeData: {
    tabName: 'Expose existing data collection',
    desc1: 'Expose storage with an existing data set through this space.',
    desc2: 'Existing directories and files structure will be ' +
      'automatically discovered and synchronized, allowing any member of ' +
      'this space to access the data set.',
  },
  deployProvider: {
    tabName: 'Deploy your own provider',
    desc1: 'Deploy your own Oneprovider service and automatically support ' +
      'this space using your storage.',
  },
  tabsCommon: {
    descDistros: 'The following Linux distributions are supported:',
    descCommand: 'The following command installs docker and configures ' +
      'a dockerized Oneprovider instance.',
    token: 'Token',
    command: 'Command',
    generateToken: 'Generate another token',
    copy: 'Copy',
  },
};
