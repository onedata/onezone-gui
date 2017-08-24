import SimpleAuthSession from 'ember-simple-auth/services/session';

export default SimpleAuthSession.extend({
  authenticate() {
    let authPromise = this._super(...arguments);
    // reset flags
    authPromise.finally(() => this.set('data.hasExpired', false));
    return authPromise;
  },
});
