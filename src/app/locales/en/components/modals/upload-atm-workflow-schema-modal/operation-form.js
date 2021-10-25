export default {
  header: 'Persistence strategy',
  operations: {
    merge: {
      label: 'Merge into existing workflow',
      noTargetWorkflowWarning: 'There are no workflows, which were created based on the workflow from the uploaded file.',
      revisionConflictWarning: 'Selected workflow already has revision {{revisionNumber}}. It will be irreversibly replaced by the revision from the uploaded file.',
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
