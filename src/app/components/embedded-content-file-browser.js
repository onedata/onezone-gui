import OneEmbeddedContainer from 'onezone-gui/components/one-embedded-container';
import layout from 'onezone-gui/templates/components/one-embedded-container';
import { inject as service } from '@ember/service';
import bindElementTop from 'onedata-gui-common/utils/bind-element-top';
import $ from 'jquery';

export default OneEmbeddedContainer.extend({
  layout,

  globalNotify: service(),

  fileId: undefined,

  spaceId: undefined,

  embeddedComponentName: 'content-file-browser',

  /**
   * @override
   */
  iframeInjectedProperties: Object.freeze(['fileId', 'spaceId']),

  didInsertElement() {
    this._super(...arguments);
    const updateIframePosition = bindElementTop({
      $topElement: $('.content-spaces-data-header'),
      $leftElement: $('.col-sidebar'),
      $innerElement: $('.content-spaces-data-content'),
    });
    updateIframePosition();
    $(window).on('resize', updateIframePosition);
    this.set('updateIframePosition', updateIframePosition);
  },

  actions: {
    sayHello() {
      this.get('globalNotify').info('hello');
    },
  },
});
