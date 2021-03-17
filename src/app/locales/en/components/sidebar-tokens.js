export default {
  advancedFilters: {
    typeFilter: {
      label: 'Type',
      values: {
        all: 'All',
        access: 'Access',
        identity: 'Identity',
        invite: 'Invite',
      },
    },
    targetFilter: {
      label: 'Target',
      model: {
        options: {
          all: 'All',
          workflowDirectory: 'Workflow dir.',
          cluster: 'Cluster',
          group: 'Group',
          harvester: 'Harvester',
          space: 'Space',
          user: 'User',
        },
      },
      record: {
        options: {
          all: 'All',
        },
      },
    },
  },
  tokenItem: {
    savingToken: 'saving token',
    renameAction: 'Rename',
    removeAction: 'Remove',
    copyAction: 'Copy to clipboard',
    revoked: 'revoked',
    expired: 'expired',
    token: 'token',
  },
};
