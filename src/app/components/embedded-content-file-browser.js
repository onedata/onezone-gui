import OneEmbeddedComponentContainer from 'onezone-gui/components/one-embedded-component-container';
import layout from 'onezone-gui/templates/components/one-embedded-component-container';
import { inject as service } from '@ember/service';

export default OneEmbeddedComponentContainer.extend({
  layout,

  globalNotify: service(),

  fileId: undefined,

  spaceId: undefined,

  /**
   * @override
   */
  iframeInjectedProperties: Object.freeze(['fileId', 'spaceId']),

  actions: {
    sayHello() {
      this.get('globalNotify').info('hello');
    },
  },
});
