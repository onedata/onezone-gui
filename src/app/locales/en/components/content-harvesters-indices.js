const indexIdTooltip =
  'Identifier of this index in Onezone\'s REST API and the external indexing service';

export default {
  header: 'Indices',
  harvesterIndices: 'Harvester indices',
  create: 'Create new index',
  createNewIndex: 'Create new index',
  noIndices: 'No indices',
  indexForm: {
    fields: {
      name: {
        label: 'Name',
      },
      schema: {
        label: 'Schema',
      },
      includeMetadata: {
        label: 'Include metadata',
        metadataBasic: {
          label: 'Basic',
        },
        metadataJson: {
          label: 'JSON',
        },
        metadataRdf: {
          label: 'RDF',
        },
      },
      includeFileDetails: {
        label: 'Include file details',
        fileName: {
          label: 'File name',
        },
        originSpace: {
          label: 'Origin space',
        },
        metadataExistenceFlags: {
          label: 'Metadata existence flags',
        },
      },
      includeRejectionReason: {
        label: 'Include rejection reason',
      },
      retryOnRejection: {
        label: 'Retry on rejection',
      },
    },
    createBtnText: 'Create index',
    cancelBtnText: 'Cancel',
  },
  createIndexForm: {
    name: 'Name',
    schema: 'Schema',
    cancel: 'Cancel',
    create: 'Create',
  },
  removeIndexModal: {
    headerText: 'Remove index',
    messageText: 'Are you sure you want to remove index "{{indexName}}"?',
    proceed: 'Remove',
    cancel: 'Cancel',
    removeHarvestedData: 'Remove harvested data',
  },
  indexEntry: {
    indexId: 'Index ID',
    indexIdTooltipHasEndpoint: indexIdTooltip + ': {{endpoint}}',
    indexIdTooltipNoEndpoint: indexIdTooltip,
    usedByGui: 'Used by GUI',
    remove: 'Remove',
    rename: 'Rename',
    harvestingProgress: 'Harvesting progress',
    settings: 'Settings',
  },
  progressTable: {
    nothingToHarvest: 'There is no data to harvest. Set up files metadata in connected spaces or attach another space to start harvesting process.',
    showArchival: 'Show archival spaces / providers',
    showArchivalTooltip: 'Shows harvesting progress for spaces or providers that are no longer linked to this harvester',
    active: 'Active',
    all: 'All',
    notAccessible: 'not accessible',
    lastActivity: 'Last activity',
    changes: 'changes',
    unknown: 'unknown',
  },
  progressTableCell: {
    space: 'Space',
    provider: 'Provider',
    status: 'Status',
    active: 'active',
    inactive: 'inactive',
    progress: 'Progress',
    lastUpdate: 'Last update',
    error: 'Error',
    notSupported: 'space not supported',
  },
};
