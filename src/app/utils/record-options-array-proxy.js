import ArrayProxy from '@ember/array/proxy';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { array } from 'ember-awesome-macros';

export default ArrayProxy.extend(OwnerInjector, {
  oneiconAlias: service(),
  records: undefined,
  sortedRecords: array.sort('records', ['name']),
  content: computed('sortedRecords.@each.name', function content() {
    const {
      sortedRecords,
      oneiconAlias,
    } = this.getProperties('sortedRecords', 'oneiconAlias');
    return sortedRecords.map(record => ({
      value: record,
      label: get(record, 'name'),
      icon: oneiconAlias.getName(get(record, 'entityType')),
    }));
  }),
});
