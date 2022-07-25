export default {
  title: 'Settings',
  description: 'Configuration regarding the support of <strong>{{spaceName}}</strong> by provider <strong>{{providerName}}</strong>.',
  dirStatsService: {
    label: 'Directory statistics',
    description: 'If enabled, directory statistics will be collected for each directory in this space. They include metrics with file count, logical/physical byte size and track their changes in time. The statistics can be viewed using the <em>Information</em> directory context action.',
    disabledDueToAccounting: 'Directory statistics cannot be disabled due to the accounting settings enforced by the Oneprovider administrator.',
    statuses: {
      initializing: 'Initializing',
      enabled: 'Enabled',
      stopping: 'Stopping',
      disabled: 'Disabled',
    },
    configuringDirStats: 'configuring directory statistics',
    recomputingWarning: 'Note that after enabling, statistics for the whole space will be recomputed, which may take a long time depending on its size.',
    additionalLoadWarning: 'Statistics collection causes an additional load on the provider and has a slight negative impact on file operation performance.',
  },
};
