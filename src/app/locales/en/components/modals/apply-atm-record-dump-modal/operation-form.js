const dumpCanBeUsedToUpdate = 'It can be used to update the existing duplicate with a newer version of the original.';

export default {
  header: 'Operation',
  operations: {
    merge: {
      label: {
        atmLambda: 'Merge into existing lambda',
        atmWorkflowSchema: 'Merge into existing workflow',
      },
      noTargetAtmRecordWarning: {
        upload: {
          atmLambda: `This operation is available if there already is a duplicate of the uploaded lambda in this inventory. ${dumpCanBeUsedToUpdate}`,
          atmWorkflowSchema: `This operation is available if there already is a duplicate of the uploaded workflow in this inventory. ${dumpCanBeUsedToUpdate}`,
        },
        duplication: {
          atmLambda: `This operation is available if there already is a duplicate of the source lambda in this inventory. ${dumpCanBeUsedToUpdate}`,
          atmWorkflowSchema: `This operation is available if there already is a duplicate of the source workflow in this inventory. ${dumpCanBeUsedToUpdate}`,
        },
      },
      revisionConflictWarning: {
        upload: {
          atmLambda: 'Selected lambda already has revision #{{revisionNumber}}. As lambda revisions cannot be overwritten, the revision from the uploaded file will be assigned the next free number (#{{nextFreeRevisionNumber}}).',
          atmWorkflowSchema: 'Selected workflow already has revision #{{revisionNumber}}. It will be irreversibly replaced by the revision from the uploaded file.',
        },
        duplication: {
          atmLambda: 'Selected lambda already has revision #{{revisionNumber}}. As lambda revisions cannot be overwritten, the revision from the source lambda will be assigned the next free number (#{{nextFreeRevisionNumber}}).',
          atmWorkflowSchema: 'Selected workflow already has revision #{{revisionNumber}}. It will be irreversibly replaced by the revision from the source workflow.',
        },
      },
    },
    create: {
      label: {
        atmLambda: 'Persist as new lambda',
        atmWorkflowSchema: 'Persist as new workflow',
      },
    },
  },
  fields: {
    atmLambda: {
      targetAtmRecord: {
        label: 'Target',
        placeholder: 'Select target lambda...',
      },
      newAtmRecordName: {
        label: 'Name',
        placeholder: 'Enter name for new lambda...',
      },
    },
    atmWorkflowSchema: {
      targetAtmRecord: {
        label: 'Target',
        placeholder: 'Select target workflow...',
      },
      newAtmRecordName: {
        label: 'Name',
        placeholder: 'Enter name for new workflow...',
      },
    },
  },
};
