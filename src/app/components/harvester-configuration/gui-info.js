/**
 * Harvester configuration section responsible for gui plugin info display.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-info'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin.guiInfo',

  /**
   * @type {utils.harvesterConfiguration.GuiPluginManifest}
   */
  manifestProxy: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isUploadingGui: false,

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  statusSpec: computed(
    'manifestProxy.manifest',
    'isUploadingGui',
    function statusSpec() {
      const {
        manifestProxy,
        isUploadingGui,
      } = this.getProperties('manifestProxy', 'isUploadingGui');
      if (isUploadingGui) {
        return {
          class: 'text-warning',
          name: this.t('uploading'),
        };
      } else {
        if (get(manifestProxy, 'manifest')) {
          return {
            class: 'text-success',
            name: this.t('uploaded'),
          };
        } else {
          return {
            class: 'text-danger',
            name: this.t('cannotLoadManifest'),
          };
        }
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  versionSpec: computed(
    'manifestProxy.manifest',
    'isUploadingGui',
    function versionSpec() {
      const {
        manifestProxy,
        isUploadingGui,
      } = this.getProperties('manifestProxy', 'isUploadingGui');
      const guiVersion = get(manifestProxy, 'version');
      if (isUploadingGui || guiVersion === undefined) {
        return {
          class: 'unspecified',
          version: this.t('unknown'),
        };
      } else {
        return {
          class: '',
          version: guiVersion,
        };
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  nameSpec: computed(
    'manifestProxy.manifest',
    function nameSpec() {
      const guiPluginName = this.get('manifestProxy.name');
      if (guiPluginName) {
        return {
          class: '',
          name: guiPluginName,
        };
      } else {
        return {
          class: 'unspecified',
          name: this.t('unknown'),
        };
      }
    }
  ),
});
