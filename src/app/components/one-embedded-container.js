/**
 * An iframe for embedding `one-embedded-component`s.
 * It provides integration between two Ember applications.
 * It will share common object with it's child window via element's
 * `appProxy` property.
 * 
 * @module components/one-embedded-container
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend({
  classNames: ['one-embedded-container'],
  classNameBindings: ['iframeIsLoading:is-loading'],

  guiUtils: service(),

  /**
   * Root URL where the embedded component's app is served.
   * E.g. URL of Oneprovider.
   * @virtual
   */
  baseUrl: undefined,

  /**
   * Array with property names that are injected to common `appProxy`
   * object and are written on the init and change.
   * @virtual optional
   */
  iframeInjectedProperties: Object.freeze([]),

  /**
   * Classes added to iframe element
   * @virtual
   * @type {string}
   */
  iframeClass: '',

  /**
   * Set by iframe onload event.
   * @type {boolean}
   */
  iframeIsLoading: true,

  /**
   * Error from iframe element when contentWindow cannot be acessed
   * (typically access error).
   * @type {any}
   */
  iframeError: undefined,

  /**
   * Set on init.
   * @type {HTMLElement}
   */
  iframeElement: undefined,

  src: computed('baseUrl', function src() {
    return `${this.get('baseUrl')}#/onedata/components/content-file-browser`;
  }),

  srcChanged: observer('src', function srcChanged() {
    safeExec(this, () => {
      this.setProperties({
        iframeIsLoading: true,
        iframeError: undefined,
      });
    });
  }),

  didInsertElement() {
    this._super(...arguments);
    // allow to inject iframeElement for test purposes
    const iframeElement = this.set(
      'iframeElement',
      this.$('iframe.one-embedded-component-iframe')
    )[0];
    iframeElement.appProxy = {
      parentInfo: {
        onezoneVersionDetails: this.get('guiUtils.softwareVersionDetails'),
      },
      callParent: this.callParent.bind(this),
      propertyChanged: notImplementedIgnore,
    };
    const iframeInjectedProperties = this.get('iframeInjectedProperties');
    iframeInjectedProperties.forEach(property => {
      const observerFun = function () {
        iframeElement.appProxy[property] = this.get(property);
        iframeElement.appProxy.propertyChanged(property);
      };
      observerFun.bind(this)();
      this.addObserver(property, this, observerFun);
    });
  },

  willDestroyElement() {
    try {
      this.element.appProxy = undefined;
    } finally {
      this._super(...arguments);
    }
  },

  callParent(method, ...args) {
    const actionFun = this.actions[method];
    if (actionFun) {
      return actionFun.bind(this)(...args);
    } else {
      throw new Error(
        `component:one-embedded-container: no such action: ${method}`
      );
    }
  },

  actions: {
    willDestroyEmbeddedComponent() {
      this.element.appProxy = undefined;
    },
    __iframeOnLoad() {
      try {
        // test for properly loaded iframe content - it should throw on security
        // error
        this.element.contentWindow;
        safeExec(this, () => {
          this.setProperties({
            iframeIsLoading: false,
            iframeError: undefined,
          });
        });
      } catch (error) {
        safeExec(this, () => {
          this.setProperties({
            iframeIsLoading: false,
            iframeError: error,
          });
        });
      }
    },
  },
});
