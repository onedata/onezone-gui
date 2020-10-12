import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';

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
   * @returns {Promise<Array<Models.Provider>>}
   */
  fetchOneprovidersCallback: computed(function fetchOneprovidersCallback() {
    return this.fetchOneproviders.bind(this);
  }),

  /**
   * @returns {Promise<Array<Models.Provider>>}
   */
  fetchOneproviders() {
    return this.get('recordManager').getUserRecordList('provider')
      .then(oneproviderList => get(oneproviderList, 'list'))
      .then(oneproviders => ArrayProxy.extend({
        oneproviders,
        content: array.sort('oneproviders', ['name']),
      }).create());
  },

  actions: {
    onRecordSelected(oneprovider) {
      this.get('onSelected')('oneclientInOneprovider', {
        caveats: [{
          type: 'interface',
          interface: 'oneclient',
        }, {
          type: 'service',
          whitelist: [`opw-${get(oneprovider, 'entityId')}`],
        }],
      });
    },
  },
});
