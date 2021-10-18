import stateTag from './revisions-table/state-tag';
import revisionEntry from './revisions-table/revision-entry';
import revisionEntriesExpander from './revisions-table/resivion-entries-expander';
import createRevisionEntry from './revisions-table/create-revision-entry';

export default {
  stateTag,
  revisionEntry,
  revisionEntriesExpander,
  createRevisionEntry,
  column: {
    revisionNumber: 'Rev.',
    state: 'State',
    description: 'Description',
  },
};
