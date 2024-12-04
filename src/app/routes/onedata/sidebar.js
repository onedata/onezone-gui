/**
 * Extension of onedata.sidebar route from onedata-gui-common. Adds filtering of
 * routes for conditional menu items.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataSidebarRoute from 'onedata-gui-common/routes/onedata/sidebar';

export default OnedataSidebarRoute.extend({
  /**
   * @override
   */
  afterModel(model) {
    const {
      collection,
      resourceType,
    } = model;

    if (resourceType === 'uploads' && !collection.array.length) {
      return this.transitionTo('onedata.sidebar', 'spaces');
    } else {
      return this._super(...arguments);
    }
  },
});
