export default {
  header: 'Add support',
  tabsCommon: {
    descCommand: 'The below command installs required packages (<code>docker</code>, <code>docker-compose</code>) and configures a dockerized Oneprovider instance.',
    token: 'Token',
    command: 'Command',
    distributionsSupported: 'Since the script uses standard <code>sh</code> shell and the deployment is Docker-based, it is likely to work on any Linux operating system. Nevertheless, we recommend Ubuntu, Debian or CentOS, where it has been well tested.',
  },
  requestSupport: {
    tabName: 'Request support',
    desc1: 'Request storage support for this space from an existing Oneprovider.',
    desc2: 'Pass the token below to the administrator of the Oneprovider of your choice (e.g. via email).',
  },
  deployProvider: {
    tabName: 'Deploy your own Oneprovider',
    desc1: 'Deploy your own Oneprovider service and automatically support this space using your storage system.',
  },
  exposeData: {
    tabName: 'Expose existing data set',
    desc1: 'Deploy your own Oneprovider service and expose your storage with existing data through this space.',
    desc2: 'Existing structure of files and directories will be automatically discovered and synchronized, allowing any member of this space to access the data set.',
  },
  requireAddSupportHeader: 'Insufficient privileges',
  requireAddSupportText: 'Requires "Add support" privilege in the space.',
  navigateTo: 'Navigate to ',
  privilegeManagement: 'privilege management.',
};
