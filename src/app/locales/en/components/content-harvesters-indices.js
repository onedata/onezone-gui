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
        tip: 'Specifies what types of file metadata should be harvested in this index. At least one type must be given.',
        nothingEnabledError: 'At least one type must be enabled',
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
        tip: 'Specifies what file details should be harvested alongside the metadata. Enabling "Metadata existence flags" will add boolean flags saying whether the file has any metadata of certain type. The "File name" field may be utilized by the GUI plugin to improve the browsing experience.',
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
        tip: 'If enabled, all harvesting errors (e.g. when the index rejects a payload due to non-matching schema) are stored as text in the index, which may be useful for later analysis.',
      },
      retryOnRejection: {
        label: 'Retry on rejection',
        tip: 'If enabled, all payloads rejected by the harvesting backend will be automatically analysed for offending data (e.g. fields that do not match the schema), pruned and submitted again. This might slow down the harvesting process and cause nonconformant metadata to be lost.',
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
