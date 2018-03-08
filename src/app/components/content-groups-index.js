/**
 * A content page for single group
 *
 * @module components/content-groups-index
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  classNames: ['content-groups-index'],

  i18n: service(),
  providerManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsIndex',

  /**
   * @virtual
   * @type {Group}
   */
  group: undefined,

  /**
   * Id of the first available provider (if exists). Used to navigate
   * to Oneprovider web client.
   * @type {ObjectProxy<string>}
   */
  firstProviderIdProxy: computed(function () {
    return PromiseObject.create({
      promise: this.get('providerManager').getProviders()
        .then(providerList => providerList.hasMany('list').ids()[0]),
    });
  }),
});
