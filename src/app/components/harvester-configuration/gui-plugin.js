/**
 * Harvester configuration section responsible for gui plugin configuration.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-plugin'],

  i18n: service(),
  harvesterManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {PromiseObject}
   */
  manifestProxy: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isUploadingGui: false,

  init() {
    this._super(...arguments);
    this.loadManifest();
  },

  /**
   * @returns {PromiseObject}
   */
  loadManifest() {
    const {
      harvesterManager,
      harvester,
    } = this.getProperties('harvesterManager', 'harvester');
    const proxy = harvesterManager.getGuiPluginManifest(get(harvester, 'id'));
    this.set('manifestProxy', proxy);
    return proxy;
  },

  actions: {
    guiUploadStart() {
      this.set('isUploadingGui', true);
    },
    guiUploadEnd() {
      safeExec(this, () => {
        this.set('isUploadingGui', false);
        this.loadManifest();
      });
    },
  },
});
