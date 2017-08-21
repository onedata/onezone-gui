import Ember from 'ember';

const {
  inject: { service },
} = Ember;

export default Ember.Component.extend({
  onedataWebsocket: service(),
  onedataRpc: service(),
  onedataGraph: service(),

  messageValue: null,

  init() {
    this._super(...arguments);
    let onedataWebsocket = this.get('onedataWebsocket');
    onedataWebsocket.initConnection().then(
      () => this.set('websocketInitialized', true),
      () => this.set('websocketInitialized', false)
    );
  },

  actions: {
    sendRpc() {
      this.get('onedataRpc').request('testRPC', {}).then(resp =>
        this.set('messageResponse', JSON.stringify(resp))
      );
    },
    getRecord() {
      this.get('onedataGraph').getRecord('od_user', 'user1').then(resp =>
        this.set('messageResponse', JSON.stringify(resp))
      );
    }
  }
});
