import RecordSelectorTemplate from 'onezone-gui/components/token-template-selector/record-selector-template';
import layout from 'onezone-gui/templates/components/token-template-selector/record-selector-template';
import { get, getProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';

export default RecordSelectorTemplate.extend({
  layout,

  userManager: service(),

  /**
   * @override
   */
  templateName: 'readonlyDataForUser',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  filterDependentKeys: Object.freeze(['name', 'username']),

  /**
   * @override
   */
  fetchRecords() {
    return this.get('userManager').getAllKnownUsers().then(users => ArrayProxy.extend({
      users,
      content: array.sort('users', ['name', 'username']),
    }).create());
  },

  /**
   * @override
   */
  filterMatcher(record, filter) {
    if (!filter) {
      return true;
    }
    const normalizedFilter = filter.toLocaleLowerCase();

    const {
      name,
      username,
    } = getProperties(record, 'name', 'username');

    return (name || '').toLocaleLowerCase().includes(normalizedFilter) ||
      (username || '').toLocaleLowerCase().includes(normalizedFilter);
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    return {
      caveats: [{
        type: 'consumer',
        whitelist: [`usr-${get(record, 'entityId')}`],
      }, {
        type: 'data.readonly',
      }],
    };
  },
});
