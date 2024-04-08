/**
 * A component that shows public page.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

export default Component.extend(I18n, {
  classNames: ['public-page'],

  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.publicPage',

  /**
   * @virtual
   * @type {string}
   */
  header: undefined,

  /**
   * @virtual
   * @type {string}
   */
  content: undefined,

  init() {
    this._super(...arguments);
    if (!this.get('content')) {
      this.get('router').replaceWith('index');
    }
  },
});
