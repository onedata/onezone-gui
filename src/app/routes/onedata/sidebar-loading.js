// FIXME: jsdoc

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
