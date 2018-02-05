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

import Component from '@ember/component';

import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { oneWay } from '@ember/object/computed';

import layout from 'onedata-gui-websocket-client/templates/components/api-example';

import { Promise } from 'rsvp';

export default Component.extend({
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

      // an example of get spaces list for first provider
      // .then(user => user.get('providerList'))
      // .then(providerList => providerList.get('list'))
      // .then(list => list.objectAt(0));
      // .then(providerZero => providerZero.get('spaceList'))

      // an example of get all spaces from list
      .then(user => user.get('spaceList'))
      .then(spaceList => {
        this.set('tmpList', spaceList);
        return spaceList.get('list');
      })
      .then(list => Promise.all(list.map(r => r)));

    // an example of get first group from list
    // .then(groupList => groupList.get('list'))
    // .then(list => list.objectAt(0))
    // .then(groupZero => groupZero.get('sharedUserList'))
    // .then(sharedUserList => sharedUserList.get('list'))
    // .then(list => list.objectAt(0));

    // an example of get a first space from spaces lit of group
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
      let userId = this.get('userId');
      let store = this.get('store');
      let record = store.createRecord('space', {
        name: 'one' + this.get('inputValue'),
        _meta: {
          authHint: ['asUser', userId],
        },
      });
      return record.save().then(savedRecord => {
        const tmpList = this.get('tmpList');
        tmpList.get('list').pushObject(savedRecord);
        this.set('tmpRecord', savedRecord);
        return tmpList.save();
      });
    },

    updateRecord() {
      let tmpRecord = this.get('tmpRecord');
      tmpRecord.set('name', this.get('inputValue'));
      return tmpRecord.save();
    },

    deleteRecord() {
      const {
        tmpRecord,
        tmpList,
      } = this.getProperties('tmpRecord', 'tmpList');
      tmpList.get('list')
        .then(list => {
          list.removeObject(tmpRecord);
          return tmpList.save();
        })
        .then(() => tmpRecord.destroyRecord());
    },

    getTokens() {
      let tmpRecord = this.get('tmpRecord');
      Promise.all([
        tmpRecord.getInviteToken('user'),
        tmpRecord.getInviteToken('group'),
      ]).then(([userToken, groupToken]) =>
        console.debug(`api-example: received tokens: ${userToken} ${groupToken}`));

    },
  },
});
