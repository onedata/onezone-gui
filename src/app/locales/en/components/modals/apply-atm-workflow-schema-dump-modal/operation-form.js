export default {
  header: 'Persistence strategy',
  operations: {
    merge: {
      label: 'Merge into existing workflow',
      noTargetWorkflowWarning: {
        upload: 'There are no workflows, which were created based on the workflow from the uploaded file.',
        duplication: 'There are no workflows, which were created based on the source workflow.',
      },
      revisionConflictWarning: {
        upload: 'Selected workflow already has revision {{revisionNumber}}. It will be irreversibly replaced by the revision from the uploaded file.',
        duplication: 'Selected workflow already has revision {{revisionNumber}}. It will be irreversibly replaced by the revision from the source workflow.',
      },
    },
    create: {
      label: 'Persist as new workflow',
    },
  },
  fields: {
    targetWorkflow: {
      label: 'Target',
      placeholder: 'Select target workflow...',
    },
    newWorkflowName: {
      label: 'Name',
      placeholder: 'Enter name for new workflow...',
    },
  },
};
