/**
 * Immediately tries to fetch provider redirection URL
 * and automatically go to it 
 *
 * @module components/content-provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

export default Component.extend(I18n, {
  classNames: ['content-provider-redirect'],

  onezoneServer: inject(),

  /**
   * @override 
   */
  i18nPrefix: 'components.contentProviderRedirect.',

  /**
   * @virtual
   * @type {models/Provider}
   */
  provider: undefined,

  /**
   * @virutal optional
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * For test purposes. Do not change it except when testing!
   * @type {Window}
   */
  _window: window,

  init() {
    this._super(...arguments);
    this._goToProvider(this.get('spaceId'));
  },

  _goToProvider(spaceId) {
    const path = spaceId ? `onedata/data/${spaceId}` : '';
    const clusterId =
      parseGri(this.get('provider').belongsTo('cluster').id()).entityId;

    const _window = this.get('_window');

    _window.location = `/op/${clusterId}/i/#/${path}`;
  },
});
