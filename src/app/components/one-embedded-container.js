/**
 * An iframe for embedding `one-embedded-component`s.
 * It provides integration between two web applications.
 * It will share common object with it's child window via element's
 * `appProxy` property.
 * 
 * @module components/one-embedded-container
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, set, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import EmbeddedIframe from 'onedata-gui-common/utils/embedded-iframe';
import { A } from '@ember/array';
import { getOwner } from '@ember/application';

export default Component.extend({
  classNames: ['one-embedded-container'],
  classNameBindings: ['iframeIsLoading:is-loading', 'fitContainer:fit-container'],

  guiUtils: service(),
  embeddedIframeManager: service(),

  /**
   * @virtual
   * @type {string}
   */
  iframeId: undefined,

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
   * Optional, will be passed to EmbeddedIframe.
   * @virtual
   * @type {string}
   */
  iframeType: undefined,

  /**
   * Any data, that should be passed along with iframe. Usually will be
   * correlated to iframeType. Optional, will be passed to EmbeddedIframe.
   * @virtual
   * @type {any}
   */
  relatedData: undefined,

  /**
   * If true, the iframe will be absolutely positioned with 100% width and height
   * @type {boolean}
   */
  fitContainer: false,

  /**
   * Collection of action names (strings), which should be injected to iframe.
   * @type {Array<string>}
   */
  callParentActionNames: Object.freeze([]),

  /**
   * @type {Utils.EmbeddedIframe}
   */
  embeddedIframe: undefined,

  /**
   * Set by iframe onload event.
   * @type {boolean}
   */
  iframeIsLoading: reads('embeddedIframe.iframeIsLoading'),

  /**
   * Error from iframe element when contentWindow cannot be acessed
   * (typically access error).
   * @type {any}
   */
  iframeError: reads('embeddedIframe.iframeError'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  src: computed('baseUrl', 'embeddedComponentName', function src() {
    const {
      baseUrl,
      embeddedComponentName,
    } = this.getProperties('baseUrl', 'embeddedComponentName');
    return `${baseUrl}#/onedata/components/${embeddedComponentName}`;
  }),

  iframeIdObserver: observer('iframeId', function iframeIdObserver() {
    const {
      embeddedIframe,
      iframeId,
    } = this.getProperties('embeddedIframe', 'iframeId');
    const prevIframeId = embeddedIframe && get(embeddedIframe, 'iframeId');

    if (prevIframeId !== iframeId) {
      if (prevIframeId) {
        this.detachIframe();
      }
      this.attachIframe();
    }
  }),

  init() {
    this._super(...arguments);

    // Copy properties below directly to embedded iframe using observers
    ['src', 'iframeClass'].forEach(propName => {
      const observerName = `${propName}Observer`;
      this[observerName] = observer(propName, function () {
        const embeddedIframe = this.get('embeddedIframe');
        if (embeddedIframe) {
          set(embeddedIframe, propName, this.get(propName));
        }
      });
    });
  },

  didInsertElement() {
    this._super(...arguments);

    this.get('iframeInjectedProperties').forEach(propertyName => {
      const observerFun = function () {
        this.get('embeddedIframe')
          .setSharedProperty(propertyName, this.get(propertyName));
      };
      this.addObserver(propertyName, this, observerFun);
    });
    this.iframeIdObserver();
  },

  willDestroyElement() {
    try {
      this.detachIframe();
    } finally {
      this._super(...arguments);
    }
  },

  /**
   * Attaches iframe to this component according to iframeId (by changing ownership)
   * @returns {undefined}
   */
  attachIframe() {
    const {
      embeddedIframeManager,
      iframeId,
      relatedData,
      iframeType,
      src,
      iframeInjectedProperties,
      callParentActionNames,
      element,
    } = this.getProperties(
      'embeddedIframeManager',
      'iframeId',
      'relatedData',
      'iframeType',
      'src',
      'iframeInjectedProperties',
      'callParentActionNames',
      'element'
    );

    const iframeOwnership = {
      ownerReference: this,
      hostElement: element,
    };

    // Try to find existing embedded iframe with specified iframeId
    const embeddedIframes = get(embeddedIframeManager, 'embeddedIframes');
    let embeddedIframe = embeddedIframes.findBy('iframeId', iframeId);
    if (!embeddedIframe) {
      // If not found, create new one...
      embeddedIframe = EmbeddedIframe.create(getOwner(this).ownerInjection(), {
        iframeId,
        owners: A([iframeOwnership]),
        src,
        relatedData,
        iframeType,
      });
      // ... and add it to global embeddedIframes collection
      embeddedIframes.pushObject(embeddedIframe);
    } else {
      // If embedded iframe exists, add this component to its owners list
      const owners = get(embeddedIframe, 'owners');
      if (!owners.any(owner => get(owner, 'ownerReference') === this)) {
        owners.unshiftObject(iframeOwnership);
      }
      // and update its src
      set(embeddedIframe, 'src', src);
    }
    this.set('embeddedIframe', embeddedIframe);

    // Attach all parent actions according to `callParentActionNames` array
    callParentActionNames.forEach(actionName => {
      let actionFun = this.actions[actionName];
      if (actionFun) {
        actionFun = actionFun.bind(this);
        set(embeddedIframe, `callParentCallbacks.${actionName}`, actionFun);
      } else {
        throw new Error(
          `component:one-embedded-container: no such action: ${actionName}`
        );
      }
    });

    // Inject all shared properties into iframe
    iframeInjectedProperties.forEach(propertyName => {
      embeddedIframe.setSharedProperty(propertyName, this.get(propertyName));
    });
  },

  /**
   * Detaches previously attached iframe from this component (by removing
   * ownership).
   * @returns {undefined}
   */
  detachIframe() {
    const {
      callParentActionNames,
      embeddedIframe,
    } = this.getProperties('callParentActionNames', 'embeddedIframe');

    if (embeddedIframe) {
      callParentActionNames.forEach(actionName => {
        set(embeddedIframe, `callParentCallbacks.${actionName}`, undefined);
      });

      const owners = get(embeddedIframe, 'owners');
      owners.removeObject(owners.findBy('ownerReference', this));
    }
  },
});
