import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

export default Mixin.create(UserProxyMixin, {
  currentUser: service(),

  /**
   * @type {Group"}
   * @virtual
   */
  targetRecord: null,

  /**
   * @type {string}
   */
  searchString: '',

  /**
   * @type {boolean}
   */
  showDescription: false,
});
