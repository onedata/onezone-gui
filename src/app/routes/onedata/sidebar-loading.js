/**
 * Handles loading state for sidebar route: renders proper loading templates.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';

export default class SidebarLoadingRoute extends Route {
  /**
   * @override
   */
  renderTemplate() {
    this.render('-sidebar-loading', {
      into: 'onedata',
      outlet: 'sidebar',
    });
    this.render('-internal-loading', {
      into: 'onedata',
      outlet: 'content',
    });
  }
}
