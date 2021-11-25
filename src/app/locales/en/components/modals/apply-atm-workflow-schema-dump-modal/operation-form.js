const dumpCanBeUsedToUpdate = 'It can be used to update the existing duplicate with a newer version of the original.';

export default {
  header: 'Operation',
  operations: {
    merge: {
      label: 'Merge into existing workflow',
      noTargetWorkflowWarning: {
        upload: `This operation is available if there already is a duplicate of the uploaded workflow in this inventory. ${dumpCanBeUsedToUpdate}`,
        duplication: `This operation is available if there already is a duplicate of the source workflow in this inventory. ${dumpCanBeUsedToUpdate}`,
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
