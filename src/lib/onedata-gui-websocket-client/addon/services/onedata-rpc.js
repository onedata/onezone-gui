import Ember from 'ember';

const {
  Service,
  inject: { service },
  RSVP: { Promise },
} = Ember;

export default Service.extend({
  onedataWebsocket: service(),

  // FIXME handle rejects from socket level

  /**
   * 
   * @param {string} methodName 
   * @param {string} args
   * @returns {Promise} resolves with method return data
   */
  request(methodName, args = {}) {
    return new Promise((resolve, reject) => {
      let requesting = this.get('onedataWebsocket').send('rpc', {
        function: methodName,
        args,
      });
      requesting.then(({ payload: { success, data, error } }) => {
        if (success) {
          resolve(data);
        } else {
          reject(error);
        }
      });
      requesting.catch(reject);
    });
  },
});
