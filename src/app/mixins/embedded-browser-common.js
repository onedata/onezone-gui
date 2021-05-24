/**
 * Adds methods commonly used in embedded containers, whose are item browsers (eg.
 * file-browser).
 *
 * @module mixins/embedded-browser-common
 * @author Jakub Liput
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';
import { get } from '@ember/object';

export default Mixin.create({
  // required property: _location: Location
  // required property: router: Ember.Router
  // required property: navigationState: Ember.Service

  /**
   * @param {String} sourceViewType one of: data, datasets - type of browser,
   *   from which the action is invoked
   * @param {String} type one of: data, datasets
   * @param {Object} options 
   * @returns {String} URL to browser item (opened or selected)
   */
  getBrowserUrl(sourceViewType, type, options) {
    const {
      _location,
      router,
      navigationState,
    } = this.getProperties('_location', 'router', 'navigationState');
    let aspect;
    let aspectOptions = Object.assign({}, options);
    const selected = options.selected;
    aspectOptions.selected = (selected instanceof Array) ?
      selected.join(',') : (selected || null);
    if (type === 'datasets') {
      aspect = 'datasets';
      aspectOptions.dataset = aspectOptions.datasetId || null;
      delete aspectOptions.datasetId;
    } else {
      aspect = 'data';
      aspectOptions.dir = aspectOptions.fileId || null;
      delete aspectOptions.fileId;
    }
    if (type === sourceViewType) {
      aspectOptions = navigationState.mergedAspectOptions(aspectOptions);
    } else {
      // preserve oneprovider in case there is view-changing URL (eg. from data to datasets)
      aspectOptions.oneproviderId = get(navigationState, 'oneproviderId') || null;
      for (const option in aspectOptions) {
        if (aspectOptions[option] == null) {
          delete aspectOptions[option];
        }
      }
    }
    return _location.origin + _location.pathname + router.urlFor(
      'onedata.sidebar.content.aspect',
      aspect, {
        queryParams: {
          options: serializeAspectOptions(aspectOptions),
        },
      });
  },
});
