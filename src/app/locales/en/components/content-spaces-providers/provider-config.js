export default {
  title: 'Settings',
  description: 'Configuration regarding the support of <strong>{{spaceName}}</strong> by provider <strong>{{providerName}}</strong>.',
  dirStatsService: {
    label: 'Directory statistics',
    description: 'If enabled, directory statistics will be collected for each directory in this space. They include metrics with file count, logical/physical byte size and track their changes in time. The statistics can be viewed using the <em>Information</em> directory context action.',
    disabledDueToAccounting: 'Directory statistics cannot be disabled due to the accounting settings enforced by the Oneprovider administrator.',
    statusLabel: 'Current status',
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
  accounting: {
    label: 'Accounting',
    description: 'If enabled, statistics of quota usage over time will be collected for this space. Accounting relies on the directory statistics service and requires that they are enabled together.',
    disabledAccounting: 'Accounting settings are managed by a Oneprovider administrator.',
  },
  modal: {
    disable: {
      header: 'Disable directory statistics',
      question: 'Are you sure you want to disable directory statistics? <strong>All collected information will be lost</strong> and it will no longer be possible to view directory sizes or distribution.',
      description: 'In case of subsequent re-enabling of the statistics, the whole space will need to be scanned, which may take a long time depending on its size.',
      buttonConfirm: 'Disable',
    },
    enable: {
      header: 'Enable directory statistics',
      question: 'Are you sure you want to enable directory statistics?',
      description: 'The whole space will be scanned, which will cause additional load on the provider and may take a long time depending on the space size.',
      buttonConfirm: 'Enable',
    },
  },
};
