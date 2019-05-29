/**
 * A component that shows an iframe with harvester plugin application
 *
 * @module components/content-harvesters-plugin
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-harvesters-plugin'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentHarvestersPlugin',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isPublic: true,

  /**
   * @type {boolean}
   */
  checkingGuiAvailability: true,

  /**
   * @type {boolean}
   */
  isGuiAvailable: undefined,

  /**
   * @type {boolean}
   */
  isGuiLoading: false,

  /**
   * Relative path to plugin application
   * @type {Ember.ComputedProperty<string>}
   */
  pluginPath: computed('harvester.guiPluginPath', function pluginPath() {
    const guiPluginPath = this.get('harvester.guiPluginPath');
    return `${guiPluginPath}/index.html`;
  }),

  init() {
    this._super(...arguments);
    const pluginPath = this.get('pluginPath');

    // Check if gui plugin index.html is accessible
    $.ajax(pluginPath, {
      method: 'HEAD',
    }).then(
      () => safeExec(this, () => this.setProperties({
        checkingGuiAvailability: false,
        isGuiAvailable: true,
        isGuiLoading: true,
      })),
      () => safeExec(this, () => this.setProperties({
        checkingGuiAvailability: false,
        isGuiAvailable: false,
      })),
    );
  },

  actions: {
    pluginLoaded() {
      this.set('isGuiLoading', false);
      this.$('.plugin-frame').removeClass('hidden');
    },
  },
});
