export default {
  header: 'Add support',
  requestSupport: {
    tabName: 'Request support',
    desc1: 'Request storage support for this space from an existing Oneprovider.',
    desc2: 'Pass the token below to the administrator of the Oneprovider of your choice (e.g. via email).',
  },
  exposeData: {
    tabName: 'Expose existing data set',
    desc1: 'Deploy your own Oneprovider service and expose your storage with existing data through this space.',
    desc2: 'Existing directories and files structure will be ' +
      'automatically discovered and synchronized, allowing any member of ' +
      'this space to access the data set.',
  },
  deployProvider: {
    tabName: 'Deploy your own Oneprovider',
    desc1: 'Deploy your own Oneprovider service and automatically support ' +
      'this space using your storage.',
  },
  tabsCommon: {
    descCommand: 'The following command installs docker and configures ' +
      'a dockerized Oneprovider instance.',
    token: 'Token',
    command: 'Command',
    distributionsSupported: 'The following Linux distributions are officially supported. Hovewer, since the deployment is Docker-based, it is likely to work on other systems.',
  },
};
