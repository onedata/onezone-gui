import Ember from 'ember';

const {
  Service,
} = Ember;

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
