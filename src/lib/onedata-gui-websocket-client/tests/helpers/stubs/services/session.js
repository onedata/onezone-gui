import Service from '@ember/service';

const DEFAULT_USERNAME = 'some_user';

export default Service.extend({
  data: undefined,

  init() {
    this._super(...arguments);
    this.set('data', {
      authenticated: {
        identity: {
          user: DEFAULT_USERNAME,
        },
      },
    });
  },
});
