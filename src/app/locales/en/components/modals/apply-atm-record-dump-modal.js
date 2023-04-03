import uploadDetails from './apply-atm-record-dump-modal/upload-details';
import dumpDetails from './apply-atm-record-dump-modal/dump-details';
import inventorySelector from './apply-atm-record-dump-modal/inventory-selector';
import operationForm from './apply-atm-record-dump-modal/operation-form';

export default {
  uploadDetails,
  dumpDetails,
  inventorySelector,
  operationForm,
  header: {
    upload: {
      atmLambda: 'Upload lambda',
      atmWorkflowSchema: 'Upload workflow',
    },
    duplication: {
      atmLambda: 'Duplicate lambda revision',
      atmWorkflowSchema: 'Duplicate workflow revision',
    },
  },
  buttons: {
    cancel: 'Cancel',
    submit: 'Apply',
  },
};
