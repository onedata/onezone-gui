import listView from './content-atm-inventories-workflows/list-view';
import atmWorkflowSchemasListEntry from './content-atm-inventories-workflows/atm-workflow-schemas-list-entry';
import atmWorkflowSchemasList from './content-atm-inventories-workflows/atm-workflow-schemas-list';
import atmWorkflowSchemaDetailsForm from './content-atm-inventories-workflows/atm-workflow-schema-details-form';
import revisionDetailsForm from './content-atm-inventories-workflows/revision-details-form';
import creatorView from './content-atm-inventories-workflows/creator-view';
import editorView from './content-atm-inventories-workflows/editor-view';
import loadingView from './content-atm-inventories-workflows/loading-view';
import taskDetailsView from './content-atm-inventories-workflows/task-details-view';

export default {
  listView,
  atmWorkflowSchemasList,
  atmWorkflowSchemasListEntry,
  atmWorkflowSchemaDetailsForm,
  revisionDetailsForm,
  creatorView,
  editorView,
  loadingView,
  taskDetailsView,
  confirmPageClose: 'There are unsaved changes. Your changes will be lost if you don\'t save them.',
};
