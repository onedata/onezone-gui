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
        tip: 'Specifies which types of file metadata should be sent to the index. At least one type must be enabled.',
        metadataXattrs: {
          label: 'Basic',
          tip: 'Key-value pairs representing extended file attributes (xattrs).',
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
        tip: 'If enabled, the index will include boolean flags containing information whether basic, JSON and RDF metadata exist.',
        fileName: {
          label: 'File name',
        },
        spaceId: {
          label: 'Space ID',
        },
        metadataExistenceFlags: {
          label: 'Metadata existence flags',
        },
      },
      includeRejectionReason: {
        label: 'Include rejection reason',
        tip: 'If enabled, the index will include an error description in case of a file indexing failure. It allows to preserve file rejection reasons for a later analysis.',
      },
      retryOnRejection: {
        label: 'Retry on rejection',
        tip: 'If enabled, after a file indexing rejection the data will be sent to the index again, possibly without the problematic data causing the rejection.',
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
