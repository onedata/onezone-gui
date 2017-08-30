import Service from '@ember/service';

const DEFAULT_USERNAME = 'some_user';

export default Service.extend({
  data: {
    authenticated: {
      identity: {
        user: DEFAULT_USERNAME,
      },
    },
  },
});
