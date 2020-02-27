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
  },
};
