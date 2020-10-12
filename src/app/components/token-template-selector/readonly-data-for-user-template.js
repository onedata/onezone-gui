import Component from '@ember/component';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import ArrayProxy from '@ember/array/proxy';
import { array } from 'ember-awesome-macros';

export default Component.extend({
  tagName: '',

  userManager: service(),

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onSelected: notImplementedIgnore,

  /**
   * @type {ComputedProperty<Function>}
   * @returns {Promise<Array<Models.User>>}
   */
  fetchUsersCallback: computed(function fetchUsersCallback() {
    return this.fetchUsers.bind(this);
  }),

  /**
   * @returns {Promise<Array<Models.User>>}
   */
  fetchUsers() {
    return this.get('userManager').getAllKnownUsers().then(users => ArrayProxy.extend({
      users,
      content: array.sort('users', ['name', 'username']),
    }).create());
  },

  actions: {
    onRecordSelected(user) {
      this.get('onSelected')('readonlyDataForUser', {
        caveats: [{
          type: 'consumer',
          whitelist: [`usr-${get(user, 'entityId')}`],
        }, {
          type: 'data.readonly',
        }],
      });
    },
  },
});
