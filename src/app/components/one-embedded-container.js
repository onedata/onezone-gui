/**
 * An iframe for embedding `one-embedded-component`s.
 * It provides integration between two web applications.
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
import {
  sharedObjectName,
  setSharedProperty,
  sharedDataPropertyName,
} from 'onedata-gui-common/utils/one-embedded-common';

export default Component.extend({
  classNames: ['one-embedded-container'],
  classNameBindings: ['iframeIsLoading:is-loading', 'fitContainer:fit-container'],

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
   * Name of component from the remote app, that is exposed using URL
   * @virtual
   * @type {string}
   */
  embeddedComponentName: undefined,

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

  /**
   * If true, the iframe will be absolutely positioned with 100% width and height
   * @type {boolean}
   */
  fitContainer: false,

  src: computed('baseUrl', 'embeddedComponentName', function src() {
    const {
      baseUrl,
      embeddedComponentName,
    } = this.getProperties('baseUrl', 'embeddedComponentName');
    return `${baseUrl}#/onedata/components/${embeddedComponentName}`;
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
      this.$('iframe.one-embedded-component-iframe')[0]
    );
    iframeElement[sharedObjectName] = {
      callParent: this.callParent.bind(this),
      propertyChanged: notImplementedIgnore,
      [sharedDataPropertyName]: {
        parentInfo: {
          onezoneVersionDetails: this.get('guiUtils.softwareVersionDetails'),
        },
      },
    };
    const iframeInjectedProperties = this.get('iframeInjectedProperties');
    iframeInjectedProperties.forEach(propertyName => {
      const observerFun = function () {
        const sharedObject = iframeElement[sharedObjectName];
        setSharedProperty(sharedObject, propertyName, this.get(propertyName));
        sharedObject.propertyChanged(propertyName);
      };
      observerFun.bind(this)();
      this.addObserver(propertyName, this, observerFun);
    });
  },

  willDestroyElement() {
    try {
      this.get('iframeElement')[sharedObjectName] = undefined;
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
      this.get('iframeElement')[sharedObjectName] = undefined;
    },
    iframeOnLoad() {
      try {
        const iframeElement = this.get('iframeElement');

        // test for properly loaded iframe content - it should throw on security
        // error
        iframeElement.contentWindow;

        // attaching handler to intercept click events
        const pluginBody = iframeElement.contentDocument.body;
        // NOTE: this could be also resolved by setting rootEventType to 'click'
        // in ember-basic-dropdown 2.0, but our version of ember-power-select
        // uses version 1.1.2 and does not pass rootEvenType
        ['click', 'mousedown'].forEach(eventName => {
          pluginBody.addEventListener(eventName, (event) => {
            const newEvent = new event.constructor(event.type, event);
            iframeElement.dispatchEvent(newEvent);
          });
        });

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
