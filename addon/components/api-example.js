/**
 * Component for manual tests of Onedata Websocket Sync API
 *
 * Only for manual tests!
 *
 * @module components/api-example
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import layout from 'onedata-gui-websocket-client/templates/components/api-example';

const {
  inject: {
    service,
  },
  computed,
  computed: { oneWay },
} = Ember;

export default Ember.Component.extend({
  layout,

  store: service(),

  session: service(),
  onedataRpc: service(),
  onedataGraph: service(),
  currentUser: service(),

  messageValue: null,

  isAuthenticated: oneWay('session.isAuthenticated'),
  userId: oneWay('session.data.authenticated.identity.user'),

  inputValue: '',

  tmpRecord: null,

  init() {
    this._super(...arguments);
  },

  spaceZeroPromise: computed('currentUser', function () {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.get('providerList'))
      .then(providerList => providerList.get('list'))
      .then(list => list.objectAt(0));
    // NOTE: Only for tests - to uncomment when want to test these models
    // .then(providerZero => providerZero.get('spaceList'))
    // .then(spaceList => spaceList.get('list'))
    // .then(spaceListList => spaceListList.objectAt(0));

    // .then(groupList => groupList.get('list'))
    // .then(list => list.objectAt(0))
    // .then(groupZero => groupZero.get('sharedUserList'))
    // .then(sharedUserList => sharedUserList.get('list'))
    // .then(list => list.objectAt(0));

    // .then(groupZero => groupZero.get('spaceList'))
    // .then(spaceList => spaceList.get('list'))
    // .then(spaceListList => spaceListList.objectAt(0));
  }),

  actions: {
    sendRpc() {
      this.get('onedataRpc').request('testRPC', {}).then(resp =>
        this.set('messageResponse', JSON.stringify(resp))
      );
    },

    getRecord() {
      let gr = this.get('currentUser').get('groupsList');
      gr.then(record => {
        this.set('messageResponse', JSON.stringify(record));
      });
      gr.catch(error => this.set('messageResponse', JSON.stringify(error)));
    },

    createRecord() {
      let {
        userId,
        store,
      } = this.getProperties('userId', 'store');
      let record = store.createRecord('space', {
        name: 'one' + this.get('inputValue'),
        _meta: {
          authHint: ['asUser', userId],
        },
      });
      return record.save().then(savedRecord => {
        this.set('tmpRecord', savedRecord);
      });
    },

    updateRecord() {
      let tmpRecord = this.get('tmpRecord');
      tmpRecord.set('name', this.get('inputValue'));
      return tmpRecord.save();
    },

    deleteRecord() {
      let tmpRecord = this.get('tmpRecord');
      return tmpRecord.destroyRecord();
    },

    getTokens() {
      let tmpRecord = this.get('tmpRecord');
      tmpRecord.getInviteToken('user');
      tmpRecord.getInviteToken('group');
    },
  },
});
