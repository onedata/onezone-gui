import Ember from 'ember';

const {
  Service,
} = Ember;

export default Service.extend({
  _cookiesMap: null,

  init() {
    this._super(...arguments);
    this.set('_cookiesMap', new Map());
  },

  write(id, value) {
    return this.get('_cookiesMap').set(id, value)
  },

  read(id) {
    return this.get('_cookiesMap').get(id);
  },
});
