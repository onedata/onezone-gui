import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend({
  tagName: '',

  recordManager: service(),

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onSelected: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Function>}
   * @returns {Promise<Array<Models.Space>>}
   */
  fetchSpacesCallback: computed(function fetchSpacesCallback() {
    return this.fetchSpaces.bind(this);
  }),

  /**
   * @returns {Promise<Array<Models.Space>>}
   */
  fetchSpaces() {
    return this.get('recordManager').getUserRecordList('space')
      .then(spacesList => get(spacesList, 'list'));
  },

  actions: {
    onRecordSelected(space) {
      this.get('onSelected')('restrictedData', {
        caveats: [{
          type: 'data.path',
          whitelist: [btoa(`/${get(space, 'entityId')}`)],
        }],
      });
    },
  },
});
