import uploadDetails from './apply-atm-workflow-schema-dump-modal/upload-details';
import dumpDetails from './apply-atm-workflow-schema-dump-modal/dump-details';
import inventorySelector from './apply-atm-workflow-schema-dump-modal/inventory-selector';
import operationForm from './apply-atm-workflow-schema-dump-modal/operation-form';

export default {
  uploadDetails,
  dumpDetails,
  inventorySelector,
  operationForm,
  header: {
    upload: 'Upload workflow',
    duplication: 'Duplicate revision',
  },
  buttons: {
    cancel: 'Cancel',
    submit: 'Apply',
  },
};
