import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  classNames: ['content-groups-membership'],

  currentUser: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembership',

  /**
   * @type {PromiseObject<User>}
   */
  user: computed(function user() {
    return PromiseObject.create({
      promise: this.get('currentUser').getCurrentUserRecord(),
    });
  }),

  /**
   * @type {Group}
   * @virtual
   */
  group: null,
});
