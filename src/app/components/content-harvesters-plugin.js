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

export default Component.extend({
  classNames: ['content-harvesters-plugin'],

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * Relative path to plugin application
   * @type {Ember.ComputedProperty<string>}
   */
  pluginPath: computed('harvester.guiPluginPath', function pluginPath() {
    const guiPluginPath = this.get('harvester.guiPluginPath');
    return `${guiPluginPath}/index.html`;
  }),
});
