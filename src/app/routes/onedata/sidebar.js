/**
 * Extension of onedata.sidebar route from onedata-gui-common. Adds filtering of
 * routes for conditional menu items.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataSidebarRoute from 'onedata-gui-common/routes/onedata/sidebar';
import { getProperties, get } from '@ember/object';

export default OnedataSidebarRoute.extend({
  /**
   * @override
   */
  afterModel(model) {
    const {
      collection,
      resourceType,
    } = getProperties(model, 'collection', 'resourceType');

    if (resourceType === 'uploads' && !get(collection, 'list.length')) {
      return this.transitionTo('onedata.sidebar', 'spaces');
    } else {
      return this._super(...arguments);
    }
  },
});
