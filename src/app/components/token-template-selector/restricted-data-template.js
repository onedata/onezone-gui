import RecordSelectorTemplate from 'onezone-gui/components/token-template-selector/record-selector-template';
import layout from 'onezone-gui/templates/components/token-template-selector/record-selector-template';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';

export default RecordSelectorTemplate.extend({
  layout,

  recordManager: service(),

  /**
   * @override
   */
  templateName: 'restrictedData',

  /**
   * @override
   */
  imagePath: 'assets/images/space-data.svg',

  /**
   * @override
   */
  fetchRecords() {
    return this.get('recordManager').getUserRecordList('space')
      .then(spacesList => get(spacesList, 'list'))
      .then(spaces => ArrayProxy.extend({
        spaces,
        content: array.sort('spaces', ['name']),
      }).create());
  },

  /**
   * @override
   */
  generateTemplateFromRecord(record) {
    return {
      caveats: [{
        type: 'data.path',
        whitelist: [btoa(`/${get(record, 'entityId')}`)],
      }],
    };
  },
});
