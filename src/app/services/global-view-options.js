// FIXME: jsdoc

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Service.extend({
  navigationState: service(),

  /**
   * Maps: resource type -> aspect -> options object
   * @type {Object}
   */
  staticViewOptions: Object.freeze({
    spaces: {
      configuration: {
        className: 'full-height fill-flex-using-column fill-flex-limited',
      },
    },
  }),

  mainContentViewOptions: computed(
    'staticViewOptions',
    'navigationState.{activeResourceType,activeAspect}',
    function mainContentViewOptions() {
      return this.staticViewOptions[this.navigationState.activeResourceType]
        ?.[this.navigationState.activeAspect] ?? {};
    }
  ),
});
