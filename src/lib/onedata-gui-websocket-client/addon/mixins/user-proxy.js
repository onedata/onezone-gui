import Mixin from '@ember/object/mixin';
import ObjectProxy from '@ember/object/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';

const PromiseObject = ObjectProxy.extend(PromiseProxyMixin);

export default Mixin.create({
  /**
   * @virtual
   * @type {Ember.Service} with `getCurrentUserRecord: Promise` method
   */
  currentUser: undefined,

  /**
   * @type <PromiseObject<models/User>>
   */
  userProxy: undefined,

  init() {
    this._super(...arguments);
    this.set(
      'userProxy',
      PromiseObject.create({
        promise: this.get('currentUser').getCurrentUserRecord(),
      })
    );
  },
});
